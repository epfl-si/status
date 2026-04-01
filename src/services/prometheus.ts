"use server";

import { Alert, AlertReceiver, AlertRoute, AlertSubscriber, apiUrl, configFiles, files, PrometheusMetricQueryValuesResponse, PrometheusQueryResponse, Scrape } from "@/types/prometheus";
import { User, UserInfo } from "next-auth";
import { promises as fs } from "node:fs";
import { parse, stringify } from "yaml";

export const getFileConfigContent = async(src: string) => {
  const file = await fs.readFile(`${process.cwd()}/${src}`, "utf8");
  return parse(file);
};

export const editFileConfigContent = async ({ src, content }: { src: string, content: object }) => {
  const yamlContent = stringify(content);
  const isWrited = await fs.writeFile(`${process.cwd()}/${src}`, yamlContent, "utf8");
  return isWrited;
};

export const addWebsiteToFileConfigContent = async ({ src, content, website, type, user }: { src: string, content: Scrape, website: string, type: configFiles, user: User }) => {
  const websites = content.scrape_configs[0].static_configs[0].targets;
  if (!content.scrape_configs[0].static_configs[0].targets.includes(website) && (user as UserInfo).groups?.includes("status-admins_AppGrpU")) {
    websites.push(website)
    content.scrape_configs[0].static_configs[0].targets = websites;
    await editFileConfigContent({ src, content });

    const alertConfigSrc = files.alert;
    const alertConfig: Alert = await getFileConfigContent(alertConfigSrc);
    const host = new URL(website).hostname.replaceAll(".", "-")
    const receiver = `status-${host}`;
    const alertRoute: AlertRoute = {
      receiver,
      group_by: ["instance"],
      matchers: [`instance="${website}"`]
    }
    const alertReceiver: AlertReceiver = {
      name: receiver,
      email_configs: [
        {
          to: `${user.email || ""}`,
          headers: {
            Subject: `Highly urgent... Please look ASAP !! (${receiver})`
          },
          text: "{ { . CommonAnnotations. summary } } "
        }
      ]
    }
    alertConfig.route.routes.push(alertRoute);
    alertConfig.receivers.push(alertReceiver);
    await editFileConfigContent({ src: files.alert, content: alertConfig });

    await refreshConfig(type);
    await refreshConfig("alert");
  }
};

export const removeWebsiteToFileConfigContent = async ({ src, content, website, type, user }: { src: string, content: Scrape, website: string, type: configFiles, user: User }) => {
  let websites = content.scrape_configs[0].static_configs[0].targets;
  if (content.scrape_configs[0].static_configs[0].targets.includes(website) && (user as UserInfo).groups?.includes("status-admins_AppGrpU")) {
    websites = websites.filter((w) => w !== website);
    content.scrape_configs[0].static_configs[0].targets = websites;
    await editFileConfigContent({ src, content });

    const alertConfigSrc = files.alert;
    const alertConfig: Alert = await getFileConfigContent(alertConfigSrc);
    const host = new URL(website).hostname.replaceAll(".", "-")
    const receiver = `status-${host}`;

    const newAlertRoutes = alertConfig.route.routes.filter((route) => route.receiver !== receiver);
    alertConfig.route.routes = newAlertRoutes;

    const newAlertReceivers = alertConfig.receivers.filter((r) => r.name !== receiver)
    alertConfig.receivers = newAlertReceivers;
    await editFileConfigContent({ src: files.alert, content: alertConfig });

    await refreshConfig(type);
    await refreshConfig("alert");
  }
};

const refreshConfig = async (type: configFiles) => {
  const url = apiUrl[type] + "/-/reload";
  if (url) {
    await fetch(url.toString(), { method: "POST" });
  }
};

export const PrometheusAPIQueryCall = async (query: string) => {
  const baseUrl = process.env.PROMETHEUS_API_URL;
  const url = `${baseUrl}/api/v1/query?query=${query}`;
  const jsonResponse: PrometheusQueryResponse = await fetch(url.toString(), { method: "GET" }).then((response) => response.json());
  return jsonResponse;
}

export const getCurrentMsResponse = async () => {
  const duration = 30; // in minutes
  const response = await PrometheusAPIQueryCall(`probe_duration_seconds[${duration}m]`);
  return response;
};

export const getStatusHTTPResponse = async () => {
  const duration = 30; // in minutes
  const response = await PrometheusAPIQueryCall(`probe_success[${duration}m]`);
  return response;
};

export const getHTTPCodeResponse = async () => {
  const duration = 30; // in minutes
  const response = await PrometheusAPIQueryCall(`probe_http_status_code[${duration}m]`);
  return response;
};

export const getHTTPResponse = async () => {
  const httpMs = await getCurrentMsResponse();
  const httpStatus = await getStatusHTTPResponse();
  const httpStatusCode = await getHTTPCodeResponse();

  const response = httpMs;

  const metricsDataArray = response.data.result;

  response.data.result = metricsDataArray.map((result, index) => {
    const httpStatusMetrics = httpStatus.data.result[index].values;
    const httpStatusCodeMetrics = httpStatusCode.data.result[index].values;
    return (
      {
        ...result,
        values: result.values.map((val) => {
          const status = httpStatusMetrics.filter((metric) => metric[0] == val[0])[0][1];
          const statusCode = httpStatusCodeMetrics.filter((metric) => metric[0] == val[0])[0][1];
          const datetime = new Date(val[0] as number * 1000);
          return (
            {
              timestamp: val[0] as number,
              httpResponse: val[1],
              httpStatus: status,
              httpStatusCode: statusCode,
              datetime
            }
          )
        })
      }
    )
  });

  return response;
};

const getAlertConfig = async () => {
  const alertConfigSrc = files.alert;
  const alertConfig: Alert = await getFileConfigContent(alertConfigSrc);
  return alertConfig;
};

export const getAlertSubscriberConfig = async () => {
  const alertConfig: Alert = await getAlertConfig();
  delete alertConfig.global;
  return alertConfig;
};

export const getAlertSubscriber = async () => {
  const alertConfig: Alert = await getAlertSubscriberConfig();
  const alertSubscriberWithReceivers: AlertSubscriber[] = alertConfig.receivers.map((receiver) => (
    {
      name: receiver.name,
      targetReceiver: alertConfig.route.routes.filter((route) => route.receiver === receiver.name)[0],
      emails: receiver.email_configs.map((config) => config.to.replaceAll(" ", "").split(",")).flat(),
    }
  ));
  return alertSubscriberWithReceivers;
};

export const followAlert = async (receiverName: string, email: string) => {
  const alertConfigSrc = files.alert;
  const alertConfig: Alert = await getAlertConfig();

  let success = false;

  const receiver = alertConfig.receivers.filter((receiver) => receiver.name === receiverName)[0];
  if (!receiver.email_configs.map((email_config) => email_config.to)[0].includes(email)) {
    const email_configs_array = receiver.email_configs[0].to.replaceAll(" ", "").split(',');
    email_configs_array.push(email);
    receiver.email_configs[0].to = email_configs_array.join(", ");

    await editFileConfigContent({ src: alertConfigSrc, content: alertConfig });
    await refreshConfig("alert");
    success = true;
  }

  const matcher = alertConfig.route.routes.filter((route) => route.receiver === receiverName)[0].matchers[0];
  const website = matcher?.substring(matcher?.indexOf('"') + 1, matcher?.lastIndexOf('"'));

  return { isActionFollow: true, website, success };
};

export const unfollowAlert = async (receiverName: string, email: string) => {
  const alertConfigSrc = files.alert;
  const alertConfig: Alert = await getAlertConfig();

  let success = false;

  const receiver = alertConfig.receivers.filter((receiver) => receiver.name === receiverName)[0];
  if (receiver.email_configs.map((email_config) => email_config.to)[0].includes(email)) {
    let email_configs_array = receiver.email_configs[0].to.replaceAll(" ", "").split(',');
    email_configs_array = email_configs_array.filter((mail) => mail !== email);
    receiver.email_configs.filter((email_config) => email_config.to.includes(email))[0].to = email_configs_array.join(", ");

    await editFileConfigContent({ src: alertConfigSrc, content: alertConfig });
    await refreshConfig("alert");
    success = true;
  }

  const matcher = alertConfig.route.routes.filter((route) => route.receiver === receiverName)[0].matchers[0];
  const website = matcher?.substring(matcher?.indexOf('"') + 1, matcher?.lastIndexOf('"'));

  return { isActionFollow: false, website, success };
};

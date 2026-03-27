"use server";

import { apiUrl, configFiles, PrometheusMetricQueryValuesResponse, PrometheusQueryResponse, Scrape } from "@/types/prometheus";
import { promises as fs } from "node:fs";
import { parse, stringify } from "yaml";

export const getFileConfigContent = async(src: string) => {
  const file = await fs.readFile(`${process.cwd()}/${src}`, "utf8");
  return parse(file) as Scrape;
};

export const editFileConfigContent = async ({ src, content }: { src: string, content: object }) => {
  const yamlContent = stringify(content);
  const isWrited = await fs.writeFile(`${process.cwd()}/${src}`, yamlContent, "utf8");
  return isWrited;
};

export const addWebsiteToFileConfigContent = async ({ src, content, website, type }: { src: string, content: Scrape, website: string, type: configFiles }) => {
  const websites = content.scrape_configs[0].static_configs[0].targets;
  websites.push(website)
  content.scrape_configs[0].static_configs[0].targets = websites;
  await editFileConfigContent({ src, content });
  await refreshConfig(type);
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
    return(
      {
        ...result,
        values: result.values.map((val) => {
          const status = httpStatusMetrics.filter((metric) => metric[0] == val[0])[0][1];
          const statusCode = httpStatusCodeMetrics.filter((metric) => metric[0] == val[0])[0][1];
          const datetime = new Date(val[0] as number * 1000);
          return(
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
}
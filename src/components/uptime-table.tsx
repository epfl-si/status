"use client";

import { useEffect, useState } from "react"
import { FileConfig } from "@/services/config-files";
import { AlertSubscriber, PrometheusMetricQueryValuesResponse, PrometheusQueryResponse, Scrape } from "@/types/prometheus";
import { getAlertSubscriber, getAlertSubscriberConfig, getHTTPResponse } from "@/services/prometheus";
import UptimeBarChart from "./uptime-bar-chart";

export function UptimeTable({ userEmail }: {userEmail: string}) {
  const [scrapFileConfig, setScrapFileConfig] = useState(new FileConfig("scrapes"));
  const [uptimes, setUptimes] = useState<PrometheusQueryResponse>();
  const [alertSubscribers, setAlertSubscribers] = useState<AlertSubscriber[]>();
  useEffect(() => {
    const call = async () => {
      await scrapFileConfig.getFileContent();
      const fileContent = await scrapFileConfig.content;
      // const yamlStringified = await scrapFileConfig.editFileContent(fileContent);
      // await scrapFileConfig.addWebsite("https://youtube.com");
      // console.log(currentMsResponse)
      // console.log(statusHTTPReponse)
      // console.log(HTTPCodeResponse)
      // console.log(currentMsResponse.data.result[0].values);
      // console.log(new Date((currentMsResponse.data.result[0].values[0] as PrometheusMetricQueryValuesResponse).timestamp as number * 1000));
      const httpResponse = await getHTTPResponse();
      setUptimes(httpResponse);
      const alertSubscriberConfig = await getAlertSubscriberConfig();
      console.log(alertSubscriberConfig);
      const subscribers = await getAlertSubscriber();
      setAlertSubscribers(subscribers);
      console.log(subscribers);
    };
    call();
  }, [])
  return (
    <div>
      {
        uptimes?.data.result.map((site) =>
          <UptimeBarChart
            key={site.metric.instance}
            site={site}
            alertSubscriber={
              alertSubscribers?.filter((alert) => {
                const matcher = alert.targetReceiver?.matchers?.filter((matcher) => matcher.includes("instance="))[0];
                return matcher?.substring(matcher?.indexOf('"') + 1, matcher?.lastIndexOf('"')) === site.metric.instance;
              }
              )[0]
            }
            userEmail={userEmail} />
        )
      }
      {/* <UptimeBarChart site={currentMsArray?.data.result[0].metric.instance} chartData={currentMsArray?.data.result[0].values as PrometheusMetricQueryValuesResponse[]}/> */}
    </div>
  )
};

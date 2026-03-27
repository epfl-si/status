"use client";

import { useEffect, useState } from "react"
import { FileConfig } from "@/services/config-files";
import { PrometheusMetricQueryValuesResponse, PrometheusQueryResponse, Scrape } from "@/types/prometheus";
import { getCurrentMsResponse, getHTTPCodeResponse, getHTTPResponse, getStatusHTTPResponse } from "@/services/prometheus";
import UptimeBarChart from "./uptime-bar-chart";

export const UptimeTable: React.FC = () => {
  const [scrapFileConfig, setScrapFileConfig] = useState(new FileConfig("scrapes"));
  const [uptimes, setUptimes] = useState<PrometheusQueryResponse>();
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
    };
    call();
  }, [])
  return (
    <div>
      {
        uptimes?.data.result.map((site) =>
          <UptimeBarChart key={site.metric.instance} site={site}/>
        )
      }
      {/* <UptimeBarChart site={currentMsArray?.data.result[0].metric.instance} chartData={currentMsArray?.data.result[0].values as PrometheusMetricQueryValuesResponse[]}/> */}
    </div>
  )
};

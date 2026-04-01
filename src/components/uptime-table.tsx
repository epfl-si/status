"use client";

import { useEffect, useState } from "react"
import { FileConfig } from "@/services/config-files";
import { AlertSubscriber, PrometheusQueryResponse } from "@/types/prometheus";
import { getAlertSubscriber, getHTTPResponse } from "@/services/prometheus";
import UptimeBarChart from "./uptime-bar-chart";
import AddWebsiteButton from "./add-website-button";
import { User, UserInfo } from "next-auth";
import { useSearchParams } from "next/navigation";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { useTranslations } from "next-intl";

export function UptimeTable({ user }: {user: User}) {
  const searchParams = useSearchParams();

  const translations = {
    site: useTranslations("pages.site"),
  };

  const [scrapFileConfig, setScrapFileConfig] = useState(new FileConfig("scrapes"));
  const [uptimes, setUptimes] = useState<PrometheusQueryResponse>();
  const [alertSubscribers, setAlertSubscribers] = useState<AlertSubscriber[]>();
  const [search, setSearch] = useState<string>(searchParams.has("url") ? searchParams.get("url") || "" : "");


  useEffect(() => {
    const call = async () => {
      await scrapFileConfig.getFileContent();
      const httpResponse = await getHTTPResponse();
      setUptimes(httpResponse);
      const subscribers = await getAlertSubscriber();
      setAlertSubscribers(subscribers);
    };
    call();
  }, [])
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <Field orientation="horizontal" className="w-150">
          <Input type="search" placeholder={translations.site("search")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </Field>
        {
          (user as UserInfo).groups?.includes("status-admins_AppGrpU") ?
            <AddWebsiteButton user={user} scrapFileConfig={scrapFileConfig} />
            :
            <></>
        }
      </div>
      {
        uptimes || search.length !== 0 ?
          uptimes?.data.result.filter((website) => scrapFileConfig.content.scrape_configs[0].static_configs[0].targets.includes(website?.metric.instance) && (search.length >= 3 ? website.metric.instance.includes(search) : true))?.length > 0 ?
            uptimes?.data.result.filter((website) => scrapFileConfig.content.scrape_configs[0].static_configs[0].targets.includes(website.metric.instance) && (search.length >= 3 ? website.metric.instance.includes(search) : true)).map((website) =>
              <UptimeBarChart
                key={website.metric.instance}
                website={website}
                alertSubscriber={
                  alertSubscribers?.filter((alert) => {
                    const matcher = alert.targetReceiver?.matchers?.filter((matcher) => matcher.includes("instance="))[0];
                    return matcher?.substring(matcher?.indexOf('"') + 1, matcher?.lastIndexOf('"')) === website.metric.instance;
                  }
                  )[0]
                }
                user={user}
                scrapFileConfig={scrapFileConfig}
              />
            )
            :
            <div>{translations.site("noResult", { search })}</div>
          :
          <div>{translations.site("loadingMessage")}</div>
      }
      {/* <UptimeBarChart site={currentMsArray?.data.result[0].metric.instance} chartData={currentMsArray?.data.result[0].values as PrometheusMetricQueryValuesResponse[]}/> */}
    </div>
  )
};

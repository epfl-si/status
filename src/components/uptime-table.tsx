"use client";

import { useSearchParams } from "next/navigation";
import type { User, UserInfo } from "next-auth";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { FileConfig } from "@/services/config-files";
import { getAlertSubscriber, getHTTPResponse, isAuthorized } from "@/services/prometheus";
import type { AlertSubscriber, PrometheusQueryResponse } from "@/types/prometheus";
import AddWebsiteButton from "./add-website-button";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import UptimeBarChart from "./uptime-bar-chart";

export function UptimeTable({ user }: { user: User }) {
  const searchParams = useSearchParams();

  const translations = {
    site: useTranslations("pages.site"),
  };

  const [scrapFileConfig, _setScrapFileConfig] = useState(new FileConfig("scrapes"));
  const [uptimes, setUptimes] = useState<
    PrometheusQueryResponse | { success: boolean; error: unknown; data?: undefined } | undefined
  >();
  const [alertSubscribers, setAlertSubscribers] = useState<AlertSubscriber[]>();
  const [search, setSearch] = useState<string>(searchParams.has("url") ? searchParams.get("url") || "" : "");
  const [authorized, setAuthorized] = useState<boolean | undefined>(false);

  useEffect(() => {
    const call = async () => {
      await scrapFileConfig.getFileContent();
      const httpResponse = await getHTTPResponse(user);
      setUptimes(httpResponse);
      console.log(httpResponse);
      if (httpResponse.success !== false) {
        const subscribers = await getAlertSubscriber();
        setAlertSubscribers(subscribers);
      }
      const isAccessRight = await isAuthorized(user as UserInfo);
      setAuthorized(isAccessRight);
    };
    call();
  }, [scrapFileConfig.getFileContent, user]);
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <Field orientation="horizontal" className="w-150">
          <Input
            type="search"
            placeholder={translations.site("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Field>
        {authorized && uptimes?.success !== false ? (
          <AddWebsiteButton user={user} scrapFileConfig={scrapFileConfig} />
        ) : (
          <></>
        )}
      </div>
      {uptimes || (uptimes && search.length !== 0) ? (
        uptimes?.success === false ? (
          <div>{translations.site("apiUnreacheable")}</div>
        ) : uptimes?.data &&
          uptimes?.data?.result?.filter(
            (website) =>
              scrapFileConfig?.content?.scrape_configs[0].static_configs[0].targets?.includes(
                website?.metric.instance,
              ) && (search.length >= 3 ? website.metric.instance.includes(search) : true),
          )?.length > 0 ? (
          uptimes?.data?.result
            .filter(
              (website) =>
                scrapFileConfig.content.scrape_configs[0].static_configs[0].targets.includes(website.metric.instance) &&
                (search.length >= 3 ? website.metric.instance.includes(search) : true),
            )
            .map((website) => (
              <UptimeBarChart
                key={website.metric.instance}
                website={website}
                isAutorized={authorized}
                alertSubscribers={alertSubscribers?.filter((alert) => {
                  const matcher = alert.targetReceiver?.matchers?.filter((matcher) => matcher.includes("instance="))[0];
                  return (
                    matcher?.substring(matcher?.indexOf('"') + 1, matcher?.lastIndexOf('"')) === website.metric.instance
                  );
                })}
                user={user}
                scrapFileConfig={scrapFileConfig}
              />
            ))
        ) : (
          <div>{translations.site("noResult", { search })}</div>
        )
      ) : (
        <div>{translations.site("loadingMessage")}</div>
      )}
    </div>
  );
}

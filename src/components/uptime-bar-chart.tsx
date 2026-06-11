"use client";

import { Bell, BellMinus, BellOff, BellPlus, BellRing, Settings, Trash } from "lucide-react";
import Link from "next/link";
import type { User } from "next-auth";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from "recharts";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { FileConfig } from "@/services/config-files";
import { followAlert, unfollowAlert } from "@/services/prometheus";
import {
  type AlertSubscriber,
  ProbeType,
  type PrometheusMetricQueryResponse,
  type PrometheusMetricQueryValuesResponse,
} from "@/types/prometheus";
import AlertCRUDForm from "./alerts-crud-form";
import DeleteWebsiteButton from "./delete-website-button";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const chartConfig = {
  views: {
    label: "Temps de réponse",
  },
  responseTime: {
    label: "Response Time",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function UptimeBarChart({
  website,
  alertSubscribers,
  user,
  scrapFileConfig,
  isAutorized,
}: {
  website: PrometheusMetricQueryResponse;
  alertSubscribers: AlertSubscriber[] | undefined;
  user: User;
  scrapFileConfig: FileConfig;
  isAutorized: boolean | undefined;
}) {
  const translations = {
    site: useTranslations("pages.site"),
    uptime: useTranslations("pages.site.uptime"),
    alert: useTranslations("pages.site.uptime.alert"),
  };

  const [websiteUrl, _setWebsiteUrl] = useState(website?.metric.instance);
  const [chartData, _setChartData] = useState<PrometheusMetricQueryValuesResponse[] | undefined>(website?.values);

  const [onBellOver, setOnBellOver] = useState(false);
  const [loadingChange, setLoadingChange] = useState(false);

  const [skeletonCellId, setSkeletonCellId] = useState(0);

  useEffect(() => {
    setChartDataFormat([
      ...new Map(
        chartData
          ?.map((data) => ({
            timestamp: data.timestamp,
            time: `${data.datetime.getHours()}:${data.datetime.getMinutes().toString().length === 1 ? `0${data.datetime.getMinutes()}` : data.datetime.getMinutes()}`,
            responseCode: data.httpStatusCode,
            responseTime: Number(data.httpResponse) * 1000,
            display: 100,
          }))
          .map((item) => [item.time, item]),
      ).values(),
    ]);
  }, [chartData]);

  const [chartDataFormat, setChartDataFormat] = useState(
    chartData?.map((data) => ({
      timestamp: data.timestamp,
      time: `${data.datetime.getHours()}:${data.datetime.getMinutes().toString().length === 1 ? `0${data.datetime.getMinutes()}` : data.datetime.getMinutes()}`,
      responseCode: data.httpStatusCode,
      responseTime: Number(data.httpResponse) * 1000,
      display: 100,
    })),
  );

  const manageAlert = async (alertSubscriber: AlertSubscriber, email: string) => {
    setLoadingChange(true);
    const isSubscribe = alertSubscriber?.emails.includes(user?.email as string);
    interface dataType {
      isActionFollow: boolean;
      website: string;
      success: boolean;
    }
    let data: dataType;
    if (isSubscribe) {
      data = await unfollowAlert(alertSubscriber.name, email);
    } else {
      data = await followAlert(alertSubscriber.name, email);
    }
    setLoadingChange(false);
    return data;
  };

  const SubUnsubToAlert = (alertSubscriber: AlertSubscriber) => {
    toast.promise<{ isActionFollow: boolean; website: string; success: boolean }>(
      () =>
        new Promise((resolve) => {
          const data = manageAlert(alertSubscriber, user?.email as string);
          resolve(data);
        }),
      {
        loading: translations.alert("loadingMessage"),
        success: (data) => {
          setLoadingChange(false);
          return translations.alert("successMessage", {
            isFollow: JSON.stringify(data.isActionFollow),
            website: data.website,
          });
        },
        error: translations.alert("errorMessage"),
      },
    );
  };

  const formatWebsiteName = (website: string) => {
    return String(website).charAt(0).toUpperCase() + String(website).slice(1);
  };

  const getAverageMs = () => {
    const responseTimeArray = chartDataFormat?.map((data) => data.responseTime);
    const totalMs = responseTimeArray?.reduce((accumulator, currentValue) => accumulator + currentValue) || 0;
    const averageMs = responseTimeArray ? totalMs / responseTimeArray?.length : 0;
    return averageMs.toFixed(2);
  };

  return (
    <Card className="py-0 mb-4 mx-2 min-w-80 max-w-30 w-auto gap-0">
      <CardHeader className="flex flex-col border-b p-0! sm:flex-row min-h-20 items-center mx-6">
        <div className="flex flex-1 flex-col justify-center gap-1 pt-4 pb-3 sm:py-0!">
          <CardTitle>
            {!new URL(websiteUrl).hostname.includes("www.epfl.ch")
              ? formatWebsiteName(new URL(websiteUrl).host.split(".")[0])
              : "EPFL"}
          </CardTitle>
          {/* <CardDescription>{translations.uptime("description")}</CardDescription> */}
          <CardDescription>
            <Link href={websiteUrl} target="_blank" className="hover:underline">
              {new URL(websiteUrl).hostname +
                (new URL(websiteUrl).pathname.length <= 1 ? "" : new URL(websiteUrl).pathname)}
            </Link>
          </CardDescription>
        </div>
        <div>
          {parseInt(website.values[website.values.length - 1].httpStatus) === 1 ? (
            <Badge variant={"outline"} className="text-green-700 border-green-700">
              <span className="relative flex size-3">
                {/* <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-700 opacity-75"></span> */}
                <span className="relative inline-flex size-3 rounded-full bg-green-700"></span>
              </span>
              {translations.uptime("up")}
            </Badge>
          ) : (
            <Badge variant={"outline"} className="text-red-700 border-red-700">
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-700 opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-red-700"></span>
              </span>
              {translations.uptime("down")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 p-4">
        <CardDescription className="text-right mx-3">{`~${getAverageMs()}ms`}</CardDescription>
        <ChartContainer config={chartConfig} className="aspect-auto h-20 w-full">
          <BarChart
            accessibilityLayer
            data={chartDataFormat}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              // tickMargin={8}
              minTickGap={32}
              interval={28}
            />
            <ChartTooltip
              // content={<ChartTooltipContent className="w-[150px]" nameKey="views" />}
              content={<ChartTooltipContent className="w-[150px]" nameKey="views" />}
              formatter={(_, __, item) => `${(item.payload.responseTime as number).toFixed(2)} ms`}
              position={{ y: 50 }}
            />
            {/* <Bar dataKey={"display"} fill={`var(--color-responseTime)`} radius={50} maxBarSize={120/30}> */}
            <Bar dataKey={"display"} fill={`var(--color-responseTime)`} radius={50}>
              {chartDataFormat?.map((data) => (
                <Cell
                  key={data.timestamp}
                  fill={parseInt(data.responseCode) < 200 || parseInt(data.responseCode) >= 400 ? "#C82909" : "#209C07"}
                  onClick={() => console.log(chartDataFormat?.length)}
                />
              ))}
              {/* {
                chartDataFormat && chartDataFormat?.length < 30 && (
                [...Array(30 - chartDataFormat?.length)].map((_, i) => i + 1).map((skeleton) => (
                  <Cell
                  key={skeleton}
                  fill={"#808080"}
                  />
                )))
              } */}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="mb-2 flex justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Bell />
              Alerts
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40" align="start">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                {alertSubscribers && alertSubscribers?.length >= 1
                  ? translations.alert("availableAlerts")
                  : translations.alert("unavailableAlerts")}
              </DropdownMenuLabel>
              {alertSubscribers?.map((alertSubscriber) => (
                <DropdownMenuSub key={alertSubscriber.name}>
                  <DropdownMenuSubTrigger>
                    {alertSubscriber.name.includes("http")
                      ? translations.alert("httpdown")
                      : alertSubscriber.name.includes("sslexpiry")
                        ? translations.alert("sslexpiry")
                        : alertSubscriber.name.includes("icmptimeout")
                          ? translations.alert("icmptimeout")
                          : translations.alert("nameNotFound")}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {alertSubscriber?.emails.includes(user?.email as string) ? (
                        <DropdownMenuItem onClick={() => SubUnsubToAlert(alertSubscriber)}>
                          <BellOff />
                          {translations.alert("unfollow")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => SubUnsubToAlert(alertSubscriber)}>
                          <BellRing />
                          {translations.alert("follow")}
                        </DropdownMenuItem>
                      )}
                      {isAutorized && (
                        <>
                          <DropdownMenuSeparator />
                          <AlertCRUDForm
                            action="update"
                            user={user}
                            website={website?.metric.instance}
                            alertSubscribers={alertSubscribers}
                            alertSubscriberName={alertSubscriber.name}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Settings />
                              {translations.alert("edit")}
                            </DropdownMenuItem>
                          </AlertCRUDForm>
                          <AlertCRUDForm
                            action="delete"
                            user={user}
                            website={website?.metric.instance}
                            alertSubscribers={alertSubscribers}
                            alertSubscriberName={alertSubscriber.name}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash />
                              {translations.alert("delete")}
                            </DropdownMenuItem>
                          </AlertCRUDForm>
                        </>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              ))}
              {alertSubscribers?.length !== Object.values(ProbeType).length && isAutorized && (
                <>
                  <DropdownMenuSeparator />
                  <AlertCRUDForm
                    action="create"
                    user={user}
                    website={website?.metric.instance}
                    alertSubscribers={alertSubscribers}
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <BellPlus />
                      {translations.alert("create")}
                    </DropdownMenuItem>
                  </AlertCRUDForm>
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        {isAutorized && (
          <DeleteWebsiteButton website={website?.metric.instance} scrapFileConfig={scrapFileConfig} user={user} />
        )}
      </CardFooter>
    </Card>
  );
}

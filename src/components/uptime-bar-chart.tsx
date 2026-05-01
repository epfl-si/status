"use client";

import { Bell, BellMinus, BellOff, BellPlus, BellRing, Settings, Trash } from "lucide-react";
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

  useEffect(() => {
    setChartDataFormat([
      ...new Map(
        chartData
          ?.map((data) => ({
            timestamp: data.timestamp,
            time: `${data.datetime.getHours()}:${data.datetime.getMinutes().toString().length === 1 ? `0${data.datetime.getMinutes()}` : data.datetime.getMinutes()}`,
            responseCode: data.httpStatusCode,
            responseTime: Number(data.httpResponse) * 1000,
          }))
          .map((item) => [item.time, item]),
      ).values(),
    ]);
  }, [chartData]);

  const [charDataFormat, setChartDataFormat] = useState(
    chartData?.map((data) => ({
      timestamp: data.timestamp,
      time: `${data.datetime.getHours()}:${data.datetime.getMinutes().toString().length === 1 ? `0${data.datetime.getMinutes()}` : data.datetime.getMinutes()}`,
      responseCode: data.httpStatusCode,
      responseTime: Number(data.httpResponse) * 1000,
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

  return (
    <Card className="py-0 mb-4">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>{websiteUrl}</CardTitle>
          <CardDescription>{translations.uptime("description")}</CardDescription>
        </div>
        <div>
          {parseInt(website.values[website.values.length - 1].httpStatus) === 1 ? (
            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              {translations.uptime("up")}
            </Badge>
          ) : (
            <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
              {translations.uptime("down")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart
            accessibilityLayer
            data={charDataFormat}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
            <ChartTooltip
              // content={<ChartTooltipContent className="w-[150px]" nameKey="views" />}
              content={<ChartTooltipContent className="w-[150px]" nameKey="views" />}
              formatter={(value) => `${(value as number).toFixed(2)} ms`}
            />
            <Bar dataKey={"responseTime"} fill={`var(--color-responseTime)`} height={5}>
              {charDataFormat?.map((data) => (
                <Cell
                  key={data.timestamp}
                  fill={parseInt(data.responseCode) < 200 || parseInt(data.responseCode) >= 400 ? "#C82909" : "#209C07"}
                />
              ))}
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
              {alertSubscribers?.length !== Object.values(ProbeType).length && (
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

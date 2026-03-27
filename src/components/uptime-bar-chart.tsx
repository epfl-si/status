"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { PrometheusMetricQueryResponse, PrometheusMetricQueryValuesResponse } from "@/types/prometheus"
import { Badge } from "./ui/badge"

const chartConfig = {
  views: {
    label: "Temps de réponse",
  },
  responseTime: {
    label: "Response Time",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function UptimeBarChart({ site }: {site: PrometheusMetricQueryResponse }) {

  const [siteUrl, setSiteUrl] = useState(site?.metric.instance);
  const [chartData, setChartData] = useState<PrometheusMetricQueryValuesResponse[] | undefined>(site?.values);

  useEffect(() => {
    setChartDataFormat(chartData?.map((data) => (
    {
      timestamp: data.timestamp,
      time: `${data.datetime.getHours()}:${data.datetime.getMinutes().toString().length == 1 ? `0${data.datetime.getMinutes()}` : data.datetime.getMinutes()}`,
      responseCode: data.httpStatusCode,
      responseTime: Number(data.httpResponse) * 1000
    }
  )))
  }, [chartData])

  const [charDataFormat, setChartDataFormat] = useState(chartData?.map((data) => (
    {
      timestamp: data.timestamp,
      time: `${data.datetime.getHours()}:${data.datetime.getMinutes().toString().length == 1 ? `0${data.datetime.getMinutes()}` : data.datetime.getMinutes()}`,
      responseCode: data.httpStatusCode,
      responseTime: Number(data.httpResponse) * 1000
    }
  )));

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>{siteUrl}</CardTitle>
          <CardDescription>
            Le status sur les 30 dernières minutes
          </CardDescription>
        </div>
        <div>{
          parseInt(site.values[site.values.length - 1].httpStatus) === 1 ?
            <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
              UP
            </Badge>
            :
            <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
              DOWN
            </Badge>
        }</div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={charDataFormat}
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
              tickMargin={8}
              minTickGap={32}
              // tickFormatter={(value) => {
              //   return new Date(value).toLocaleTimeString("fr-FR", {
              //     hour: "numeric",
              //     minute: "numeric",
              //     second: "numeric"
              //   })
              // }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  // labelFormatter={(value) => {
                  //   return new Date(value as string).toLocaleDateString("en-US", {
                  //     month: "short",
                  //     day: "numeric",
                  //     year: "numeric",
                  //   })
                  // }}
                />
              }
              formatter={(value) => `${(value as Number).toFixed(2)} ms`}
            />
            <Bar dataKey={"responseTime"} fill={`var(--color-responseTime)`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export type configFiles = "scrapes" | "alert";

export const files = {
  scrapes: "config/prometheus/scrapes/list-scrape.yml",
  alert: "config/alertmanager/config.yml",
};

export const apiUrl = {
  scrapes: process.env.PROMETHEUS_API_URL,
  alert: process.env.ALERTMANAGER_API_URL,
};

interface ScrapeJobStaticConfigs {
  targets: string[];
}

interface ScrapeJobRelabelConfigs {
  source_labels?: string[];
  target_label?: string;
  replacement?: string;
}

interface ScrapeJob {
  job_name: string;
  metrics_path: string;
  params: {
    module: string[];
  };
  static_configs: ScrapeJobStaticConfigs[];
  relabel_configs: ScrapeJobRelabelConfigs[];
}

export interface Scrape {
  scrape_configs: ScrapeJob[];
}

export interface PrometheusMetricQueryValuesResponse {
  timestamp: number;
  httpResponse: string;
  httpStatus: string;
  httpStatusCode: string;
  datetime: Date;
}

export interface PrometheusMetricQueryResponse {
  metric: {
    __name__: string; // queryName
    instance: string; // url
    job: string;
  };
  values: PrometheusMetricQueryValuesResponse[];
}

export interface PrometheusQueryResponse {
  success: boolean;
  data: {
    result: PrometheusMetricQueryResponse[];
    resultType: string;
  };
}

export interface AlertRoute {
  receiver: string | null;
  group_by: string[];
  matchers: string[];
}

export interface AlertReceiverEmailConfig {
  to: string;
  headers: {
    Subject: string;
  };
  text: string;
}

export interface AlertReceiver {
  name: string;
  email_configs: AlertReceiverEmailConfig[];
}

export interface Alert {
  global?: any;
  route: {
    group_wait: string;
    group_interval: string;
    repeat_interval: string;
    receiver: string;
    routes: AlertRoute[];
  };
  receivers: AlertReceiver[];
}

export interface AlertSubscriber {
  name: string;
  targetReceiver: AlertRoute;
  emails: string[];
}

export const ProbeType = {
  http: "httpdown",
  ssl: "sslexpiry",
  icmp: "icmptimeout",
};

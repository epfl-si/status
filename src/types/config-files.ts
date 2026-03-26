export type configFiles = "scrapes" | "alert";

export const files = {
  scrapes: "devkit/prometheus/scrapes/list-scrape.yml",
  alert: "devkit/alertmanager/config.yml",
};

export const apiUrl = {
  scrapes: process.env.PROMETHEUS_API_URL,
  alert: process.env.ALERTMANAGER_API_URL,
}

interface ScrapeJobStaticConfigs{
  targets: string[],
}

interface ScrapeJobRelabelConfigs{
  source_labels?: string[],
  target_label?: string,
  replacement?: string,
}

interface ScrapeJob{
  job_name: string,
  metrics_path: string,
  params: {
    module: string[]
  },
  static_configs: ScrapeJobStaticConfigs[],
  relabel_configs: ScrapeJobRelabelConfigs[],
}

export interface Scrape{
  scrape_configs: ScrapeJob[],
};

"use server";

import { apiUrl, configFiles, Scrape } from "@/types/config-files";
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

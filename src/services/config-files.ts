import type { User } from "next-auth";
import { type configFiles, files, type Scrape } from "@/types/prometheus";
import {
  addWebsiteToFileConfigContent,
  editFileConfigContent,
  getFileConfigContent,
  removeWebsiteToFileConfigContent,
} from "./prometheus";

export class FileConfig {
  type: configFiles;
  src: string;
  content: Scrape;

  constructor(filetype: configFiles) {
    this.type = filetype;
    this.src = files[filetype];
    this.content = {} as Scrape;
  }

  getFileContent = async () => {
    const content = (await getFileConfigContent(this.src)) as Scrape;
    this.content = content;
    return content;
  };

  editFileContent = async (content: Scrape) => {
    const src = this.src;
    const yamlContent = await editFileConfigContent({ src, content });
    await this.getFileContent();
    return yamlContent;
  };

  addWebsite = async (website: string, user: User) => {
    const src = this.src;
    const content = this.content;
    let success = false;
    try {
      await addWebsiteToFileConfigContent({ src, content, website, user });
      await this.getFileContent();
      success = true;
    } catch {
      success = false;
    }
    return { success, website };
  };

  removeWebsite = async (website: string, user: User) => {
    const src = this.src;
    const content = this.content;
    let success = false;
    try {
      await removeWebsiteToFileConfigContent({ src, content, website, user });
      await this.getFileContent();
      success = true;
    } catch {
      success = false;
    }
    return { success, website };
  };
}

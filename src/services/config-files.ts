import { configFiles, files, Scrape } from "@/types/prometheus";
import { getFileConfigContent, editFileConfigContent, addWebsiteToFileConfigContent, removeWebsiteToFileConfigContent } from "./prometheus";
import { error } from "console";
import { User } from "next-auth";

export class FileConfig{
  type: configFiles;
  src: string;
  content: Scrape;

  constructor(filetype: configFiles) {
    this.type = filetype;
    this.src = files[filetype];
    this.content = {} as Scrape;
  };

  getFileContent = async() => {
    const content = await getFileConfigContent(this.src) as Scrape;
    this.content = content;
    return content;
  };

  editFileContent = async (content: Scrape) => {
    const src = this.src;
    const yamlContent = await editFileConfigContent({src, content});
    return yamlContent;
  };

  addWebsite = async (website: string, user: User) => {
    const src = this.src;
    const content = this.content;
    const type = this.type;
    let success = false;
    try {
      await addWebsiteToFileConfigContent({ src, content, website, type, user })
      success = true;
    }
    catch {
      success = false;
    }
    return {success, website}
  };

  removeWebsite = async (website: string, user: User) => {
    const src = this.src;
    const content = this.content;
    const type = this.type;
    let success = false;
    try {
      await removeWebsiteToFileConfigContent({ src, content, website, type, user })
      success = true;
    }
    catch {
      success = false;
    }
    return {success, website}
  };

}

import { configFiles, files, Scrape } from "@/types/config-files";
import { getFileConfigContent, editFileConfigContent, addWebsiteToFileConfigContent } from "./config";

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
    const content = await getFileConfigContent(this.src);
    this.content = content;
    return content;
  };

  editFileContent = async (content: Scrape) => {
    const src = this.src;
    const yamlContent = await editFileConfigContent({src, content});
    return yamlContent;
  };

  addWebsite = async (website: string) => {
    const src = this.src;
    const content = this.content;
    const type = this.type;
    await addWebsiteToFileConfigContent({src, content, website, type})
  };

}

import { Trash } from "lucide-react";
import { Button } from "./ui/button";
import { FileConfig } from "@/services/config-files";
import { toast } from "sonner"
import { useTranslations } from "next-intl";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Field } from "./ui/field";
import { useState } from "react";
import { User } from "next-auth";

export default function DeleteWebsiteButton({ website, scrapFileConfig, user }: { website: string, scrapFileConfig: FileConfig, user: User }) {

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const translations = {
    websiteDelete: useTranslations("pages.site.uptime.website.delete"),
  };

  const deleteWebsite = async () => {
    toast.promise<{success: boolean, website: string}>(
      () =>
        new Promise(async (resolve) => {
          try {
            const success = await scrapFileConfig.removeWebsite(website, user);
            resolve(success);
          }
          catch (error){
            console.error(error);
          }
        }),
      {
        loading: translations.websiteDelete("loadingMessage"),
        success: (data) => { setIsDialogOpen(false); return translations.websiteDelete("successMessage", { website: data.website })},
        error: translations.websiteDelete("errorMessage"),
      }
    )
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <Trash />
          {translations.websiteDelete("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{translations.websiteDelete("title")}</DialogTitle>
          <DialogDescription>
            {translations.websiteDelete("description", {website})}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Field orientation="horizontal">
            <DialogClose asChild>
              <Button variant="outline">{translations.websiteDelete("cancel")}</Button>
            </DialogClose>
            <Button onClick={() => deleteWebsite()} form="form-website-add">{translations.websiteDelete("confirm")}</Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
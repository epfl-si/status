import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "next-auth";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FileConfig } from "@/services/config-files";
import { Button } from "./ui/button";

const formSchema = z.object({
  url: z
    .string()
    .min(10, "URL must be at least 10 characters.")
    .max(60, "URL must be at most 60 characters.")
    .regex(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
      "URL need to be in a right format.",
    ),
});

export default function AddWebsiteButton({ user, scrapFileConfig }: { user: User; scrapFileConfig: FileConfig }) {
  const translations = {
    websiteAdd: useTranslations("pages.site.uptime.website.add"),
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    const website = data.url;
    toast.promise<{ website: string; success: boolean }>(
      () =>
        new Promise((resolve) => {
          try {
            scrapFileConfig.getFileContent();
            const data = scrapFileConfig.addWebsite(website, user);
            resolve(data);
          } catch (error) {
            console.error(error);
          }
        }),
      {
        loading: translations.websiteAdd("loadingMessage"),
        success: (data) => {
          setIsDialogOpen(false);
          return translations.websiteAdd("successMessage", { website: data.website });
        },
        error: translations.websiteAdd("errorMessage"),
      },
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>{translations.websiteAdd("trigger")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{translations.websiteAdd("title")}</DialogTitle>
          <DialogDescription>{translations.websiteAdd("description")}</DialogDescription>
        </DialogHeader>
        <form id="form-website-add" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-website-add-input-url">{translations.websiteAdd("url")}</FieldLabel>
                  <Input
                    {...field}
                    id="form-website-add-input-url"
                    name="url"
                    placeholder="https://google.com"
                    aria-invalid={fieldState.invalid}
                    required
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <Field orientation="horizontal">
            <DialogClose asChild>
              <Button variant="outline">{translations.websiteAdd("cancel")}</Button>
            </DialogClose>
            <Button type="submit" form="form-website-add">
              {translations.websiteAdd("confirm")}
            </Button>
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

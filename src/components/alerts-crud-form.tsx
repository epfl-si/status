import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "next-auth";
import { useTranslations } from "next-intl";
import { ReactNode, useState } from "react";
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
import { createAlert, deleteAlert, updateAlert } from "@/services/prometheus";
import { AlertSubscriber, ProbeType } from "@/types/prometheus";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formSchema = z.object({
  probeType: z
    .string()
    .min(1, "Field need to be filled")
    .refine((value) => Object.values(ProbeType).includes(value), {
      message: `Invalid plan selection. Please choose ${Object.values(ProbeType).join(", ")}`,
    }),
});

type actionCRUD = "create" | "update" | "delete";

// export default function AlertCRUDForm({ user, scrapFileConfig }: { user: User; scrapFileConfig: FileConfig }) {
export default function AlertCRUDForm({
  children,
  user,
  website,
  alertSubscribers,
  alertSubscriberName,
  action,
}: {
  children: ReactNode;
  user: User;
  website: string;
  alertSubscribers: AlertSubscriber[] | undefined;
  alertSubscriberName?: string;
  action: actionCRUD;
}) {
  const translations = {
    alert: useTranslations("pages.site.uptime.alert"),
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Define form and its default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      probeType: "",
    },
  });

  const CRUDFunction = (data?: z.infer<typeof formSchema>) => {
    if (action !== "delete" && data) {
      const selectedProbeType = data.probeType;
      if (action === "create") {
        toast.promise<{ success: boolean }>(
          () =>
            new Promise((resolve) => {
              try {
                const data = createAlert({ selectedProbeType, user, website });
                resolve(data);
              } catch (error) {
                console.error(error);
              }
            }),
          {
            loading: translations.alert("loadingMessage"),
            success: (data) => {
              setIsDialogOpen(false);
              return translations.alert("successMessageCreate");
            },
            error: translations.alert("errorMessageCreate"),
          },
        );
      } else if (action === "update") {
        toast.promise<{ success: boolean }>(
          () =>
            new Promise((resolve, reject) => {
              try {
                updateAlert({
                  selectedProbeType,
                  oldProbeType: alertSubscriberName?.split("-")[0] || "",
                  website,
                  user,
                })
                  .then((data) => {
                    if (data.success === true) {
                      resolve(data);
                    } else {
                      reject(data);
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                    reject(error);
                  });
              } catch (error) {
                console.error(error);
              }
            }),
          {
            loading: translations.alert("loadingMessage"),
            success: (data) => {
              setIsDialogOpen(false);
              return translations.alert("successMessageUpdate");
            },
            error: translations.alert("errorMessageUpdate"),
          },
        );
      }
    } else {
      toast.promise<{ success: boolean }>(
        () =>
          new Promise((resolve) => {
            try {
              const data = deleteAlert({ alertSubscriberName: alertSubscriberName || "" });
              resolve(data);
            } catch (error) {
              console.error(error);
            }
          }),
        {
          loading: translations.alert("loadingMessage"),
          success: (data) => {
            setIsDialogOpen(false);
            return translations.alert("successMessageDelete");
          },
          error: translations.alert("errorMessageDelete"),
        },
      );
    }
    setIsDialogOpen(false);
  };

  // Submit function to create an alert
  function onSubmit(data: z.infer<typeof formSchema>) {
    CRUDFunction(data);
  }

  const getDialogText = (type: string) => {
    switch (action) {
      case "create":
        return translations.alert(`${type}Create`);
      case "update":
        return translations.alert(`${type}Update`);
      case "delete":
        return translations.alert(`${type}Delete`, {
          alert: translations.alert(alertSubscriberName?.split("-")[0] || ""),
        });
      default:
        return translations.alert(`${type}Unknow`);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{getDialogText("title")}</DialogTitle>
          <DialogDescription>{getDialogText("description")}</DialogDescription>
        </DialogHeader>
        <form id="form-alert-management" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {action !== "delete" && (
              <Controller
                name="probeType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel></FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value} name={field.name}>
                      <SelectTrigger className="w-[180px]" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder={translations.alert("usagePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.values(ProbeType)
                            .filter(
                              (type) => !alertSubscribers?.map((alert) => alert.name.includes(type)).includes(true),
                            )
                            .map((type) => (
                              <SelectItem key={type} value={type}>
                                {translations.alert(type)}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Field orientation="horizontal">
            <DialogClose asChild>
              <Button variant="outline">{translations.alert("cancel")}</Button>
            </DialogClose>
            {action !== "delete" ? (
              <Button type="submit" form="form-alert-management">
                {translations.alert("confirm")}
              </Button>
            ) : (
              <Button form="form-alert-management" onClick={() => CRUDFunction()}>
                {translations.alert("confirm")}
              </Button>
            )}
          </Field>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

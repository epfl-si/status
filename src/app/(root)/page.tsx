import { ArrowRight, Container, Globe, Layers, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { auth } from "@/services/auth";

export default async function Home() {
  const translations = {
    home: await getTranslations("pages.home"),
  };
  const session = await auth();

  const features = [
    {
      icon: ShieldCheck,
      title: translations.home("featureAuth"),
      description: translations.home("featureAuthDesc"),
    },
    {
      icon: Globe,
      title: translations.home("featureI18n"),
      description: translations.home("featureI18nDesc"),
    },
    {
      icon: Layers,
      title: translations.home("featureUi"),
      description: translations.home("featureUiDesc"),
    },
    {
      icon: Container,
      title: translations.home("featureDocker"),
      description: translations.home("featureDockerDesc"),
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="container mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">{translations.home("title")}</h1>
          <p className="text-xl text-muted-foreground font-medium">{translations.home("subtitle")}</p>
          <p className="text-muted-foreground leading-relaxed">{translations.home("description")}</p>
          <div className="pt-2">
            {session ? (
              <Button asChild size="lg" className="gap-2">
                <Link href="/dashboard">
                  {translations.home("cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground italic">{translations.home("ctaSignin")}</p>
            )}
          </div>
        </div>
        <div className="flex-1 flex justify-center lg:justify-end">
          <Image
            src="/fly.png"
            alt="Starter kit illustration"
            width={420}
            height={420}
            className="w-64 lg:w-105 drop-shadow-2xl"
            priority
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 border-t py-16">
        <div className="container mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-background rounded-xl p-6 border space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { ArrowRight } from "lucide-react";
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

  return (
    <div>
      {/* Hero */}
      <section className="container mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">{translations.home("title")}</h1>
          <p className="text-xl text-muted-foreground font-medium">{translations.home("subtitle")}</p>
          <div className="pt-2">
            {session ? (
              <Button asChild size="lg" className="gap-2">
                <Link href="/site">
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
            src="/status.png"
            alt="Status illustration"
            width={420}
            height={420}
            className="w-64 lg:w-105 drop-shadow-2xl"
            priority
          />
        </div>
      </section>
    </div>
  );
}

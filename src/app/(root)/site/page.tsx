import { getTranslations } from "next-intl/server";
import { auth, getUser } from "@/services/auth";
import { UptimeTable } from "@/components/uptime-table";

type ParsedAccred = {
  id: string;
  acronym: string;
  path: string;
  raw: string;
};

function parseAccred(accred: string): ParsedAccred {
  const parts = accred.split(":");
  return {
    id: parts[0] ?? "",
    acronym: parts[1] ?? "",
    path: parts[2] ?? "",
    raw: accred,
  };
}

export default async function Uptime() {
  const translations = {
    dashboard: await getTranslations("pages.dashboard"),
  };
  const [session, user] = await Promise.all([auth(), getUser()]);

  const parsedAccreds = (user.accreds ?? []).map(parseAccred);

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <UptimeTable userEmail={user.email}/>
    </div>
  );
}

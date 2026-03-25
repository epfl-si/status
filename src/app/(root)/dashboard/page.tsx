import { getTranslations } from "next-intl/server";
import { auth, getUser } from "@/services/auth";

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

export default async function Dashboard() {
  const translations = {
    dashboard: await getTranslations("pages.dashboard"),
  };
  const [session, user] = await Promise.all([auth(), getUser()]);

  const parsedAccreds = (user.accreds ?? []).map(parseAccred);

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{translations.dashboard("title")}</h1>
        <p className="text-muted-foreground mt-1">{translations.dashboard("subtitle")}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Left — parsed user info */}
        <div className="space-y-8">
          {/* Identity */}
          <section className="space-y-1">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              {translations.dashboard("fieldName")}
            </h2>
            <p className="text-2xl font-bold">{user.name ?? "—"}</p>
            <p className="text-muted-foreground">{user.email ?? "—"}</p>
            <p className="text-sm text-muted-foreground font-mono">
              {user.username}
              {user.userId ? <span className="ml-2 text-xs opacity-60">· {user.userId}</span> : null}
            </p>
          </section>

          {/* Groups */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              {translations.dashboard("groups")}
            </h2>
            {user.groups?.length > 0 ? (
              <ul className="space-y-1">
                {user.groups.map((group) => (
                  <li key={group} className="text-sm">
                    {group}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{translations.dashboard("noGroups")}</p>
            )}
          </section>

          {/* Accreditations */}
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              {translations.dashboard("accreds")}
            </h2>
            {parsedAccreds.length > 0 ? (
              <ul className="space-y-4">
                {parsedAccreds.map((accred) => (
                  <li key={accred.raw} className="space-y-0.5">
                    <p className="font-semibold text-sm">{accred.acronym}</p>
                    <p className="text-sm text-muted-foreground">{accred.path}</p>
                    <p className="text-xs text-muted-foreground font-mono opacity-60">
                      {translations.dashboard("accredId")} {accred.id}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{translations.dashboard("noAccreds")}</p>
            )}
          </section>
        </div>

        {/* Right — raw session */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {translations.dashboard("rawSession")}
            </span>
          </div>
          <pre className="p-4 text-xs leading-relaxed overflow-auto max-h-[560px] text-muted-foreground">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

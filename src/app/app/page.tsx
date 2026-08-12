import type { Metadata, Viewport } from "next";
import { Studio } from "../_components/studio";
import type { Language } from "../_lib/i18n";

export const metadata: Metadata = {
  title: "Live Demo — NailLab Studio",
  description:
    "Scan a hand and match nail shape and colour in real time, at the chair.",
};

export const viewport: Viewport = {
  themeColor: "#fbf9f5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

type AppSearch = {
  lang?: string | string[];
  start?: string | string[];
};

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<AppSearch>;
}) {
  const params = await searchParams;
  const lang = first(params.lang);
  const start = first(params.start);
  const language: Language | undefined =
    lang === "en" || lang === "nl" ? lang : undefined;
  const startAt =
    start === "scan" ? "scan" : language ? "splash" : undefined;

  return (
    <main className="bg-atelier mx-auto w-full max-w-[26rem] flex-1">
      <Studio initialLanguage={language} startAt={startAt} />
    </main>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

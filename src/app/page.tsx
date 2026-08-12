import { redirect } from "next/navigation";
import { LandingPage } from "./_components/landing-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    shape?: string | string[];
    polish?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const shape = first(params.shape);
  const polish = first(params.polish);

  // Older QR links pointed at the root; send them into the studio.
  if (shape || polish) {
    const query = new URLSearchParams();
    if (shape) query.set("shape", shape);
    if (polish) query.set("polish", polish);
    redirect(`/app?${query.toString()}`);
  }

  return <LandingPage />;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

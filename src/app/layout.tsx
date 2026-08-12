import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NailLab Studio | AI Hand Analysis & AR Nail Polish Studio",
  description:
    "De vorm en kleur van hun droomnagels. Direct in AR, aan de stoel.",
  applicationName: "NailLab Studio",
  appleWebApp: {
    capable: true,
    title: "NailLab Studio",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf9f5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="bg-atelier text-charcoal flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}

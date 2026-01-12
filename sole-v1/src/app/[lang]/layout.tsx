import { i18n } from "../../lib/i18n-config";

// 讓 Next.js 預先生成支援的語系路徑
export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>; // 改為 Promise 以符合最新 Next.js 規範
}) {
  const { lang } = await params;

  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
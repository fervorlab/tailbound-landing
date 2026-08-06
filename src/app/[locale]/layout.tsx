import type { Metadata } from "next";
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import LoadingScreen from '@/components/LoadingScreen';
import { GA_MEASUREMENT_ID } from '@/lib/analytics';
import "../globals.css";

const seoByLocale = {
  ko: {
    title: "설화 (魂录) — 조선 설화 로그라이크 서바이벌 액션",
    description: "달빛 아래 귀문이 열린다. 부적과 정화수로 악귀를 막아내는 조선 설화 로그라이크 퇴마 액션.",
    ogLocale: "ko_KR",
  },
  en: {
    title: "Tailbound (魂录) — Korean Folklore Roguelike Survival Action",
    description: "The demon gate opens tonight. Wield talismans and purifying water in this fast-paced Korean folklore roguelike exorcism action game.",
    ogLocale: "en_US",
  },
  ja: {
    title: "Tailbound (魂录) — 韓国説話ローグライクサバイバルアクション",
    description: "月明かりの下、鬼門が開かれる。朝鮮説話をベースにしたスピード感あるローグライク退魔アクションゲーム。",
    ogLocale: "ja_JP",
  },
  zh: {
    title: "Tailbound (魂录) — 韩国民间传说 Roguelike 生存动作游戏",
    description: "月光之下，鬼门大开。基于朝鲜民间传说的快节奏肉鸽退魔动作游戏。",
    ogLocale: "zh_CN",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seo = seoByLocale[locale as keyof typeof seoByLocale] ?? seoByLocale.ko;

  return {
    metadataBase: new URL("https://tailbound.xyz"),
    title: seo.title,
    description: seo.description,
    icons: {
      icon: "/icon.png",
      apple: "/apple-icon.png",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ko: "/ko",
        en: "/en",
        ja: "/ja",
        zh: "/zh",
        "x-default": "/ko",
      },
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `/${locale}`,
      siteName: "Tailbound",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Tailbound — Korean Folklore Roguelike",
        },
      ],
      locale: seo.ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: ["/og.png"],
      creator: "@tailbound_game",
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({locale});
  const wordBreakClass = locale === 'ko' ? 'break-keep' : 'break-normal';

  return (
    <html lang={locale}>
      <head>
        <link rel="preload" href="/poster.webp" as="image" fetchPriority="high" />
        <link rel="preload" href="/title.png" as="image" />
      </head>
      <body className={`antialiased font-sans ${wordBreakClass}`}>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
        </Script>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LoadingScreen />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

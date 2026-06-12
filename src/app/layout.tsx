import type { Metadata } from "next";
import { Inter, Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import { Providers } from "@/components/Providers";
import StructuredData from "@/components/landing/StructuredData";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: {
    default: "Gimnasio | Tu Transformación Comienza Aquí",
    template: "%s | Gimnasio"
  },
  description: "Gimnasio premium abierto 24/7 con entrenadores certificados, clases grupales, zona de recuperación y equipamiento de última generación. Únete hoy y transforma tu vida.",
  keywords: ["gimnasio", "fitness", "entrenamiento personal", "clases grupales", "gym 24 horas", "pesas", "cardio", "spinning", "yoga", "nutrición"],
  authors: [{ name: "Gimnasio" }],
  creator: "Gimnasio",
  publisher: "Gimnasio",
  metadataBase: new URL('https://gimnasio.com'),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://gimnasio.com",
    siteName: "Gimnasio",
    title: "Gimnasio | Tu Transformación Comienza Aquí",
    description: "Gimnasio premium abierto 24/7 con entrenadores certificados, clases grupales y equipamiento de última generación.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gimnasio - Instalaciones premium"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Gimnasio | Tu Transformación Comienza Aquí",
    description: "Gimnasio premium abierto 24/7 con entrenadores certificados y equipamiento de última generación.",
    images: ["/og-image.jpg"],
    creator: "@gimnasio"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  alternates: {
    canonical: "https://gimnasio.com"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} ${spaceGrotesk.variable} ${outfit.variable}`}>
        <StructuredData />
        <Providers>
          <NextTopLoader
            color="#02F5D4"
            initialPosition={0.08}
            crawlSpeed={200}
            height={4}
            crawl={true}
            showSpinner={true}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2299DD,0 0 5px #2299DD"
            template='<div class="bar" role="bar"><div class="peg"></div></div>
  <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
            zIndex={1600}
            showAtBottom={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}

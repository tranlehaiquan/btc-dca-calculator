import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { type Asset } from "../constants";
import { LANGUAGES } from "../i18n";

interface SEOProps {
  asset?: Asset;
  title?: string;
  description?: string;
  ogImage?: string;
}

export function SEO({ asset = "BTC", title: customTitle, description: customDescription, ogImage }: SEOProps) {
  const { t, i18n } = useTranslation();

  const assetName = t(`assets.${asset}`);
  const title = customTitle || `${assetName} DCA Calculator - Calculate Potential Returns`;
  const description = customDescription || t("app.subtitle");
  const lang = i18n.language.split("-")[0];
  const baseUrl = "https://btc-dca-calculator.vercel.app";
  const currentUrl = typeof window !== 'undefined' ? window.location.href : baseUrl;
  
  // Default OG image based on asset if not provided
  const defaultOgImage = `${baseUrl}/og-${asset.toLowerCase()}.png`;
  const finalOgImage = ogImage || defaultOgImage;

  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title,
    description: description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    url: baseUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Dollar Cost Averaging calculation",
      "Historical price data",
      "Multi-asset support (Bitcoin, Gold, Silver)",
      "Interactive charts",
    ],
  };

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={`dca calculator, dollar cost averaging, ${assetName}, investment, crypto, finance`} />

      {/* hreflang tags for all supported languages */}
      {Object.keys(LANGUAGES).map((l) => (
        <link
          key={l}
          rel="alternate"
          hrefLang={l}
          href={`${baseUrl}/${window.location.pathname}?lng=${l}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={baseUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalOgImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* Canonical Link */}
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
}

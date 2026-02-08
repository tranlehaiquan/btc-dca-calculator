import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { type Asset } from "../constants";
import { LANGUAGES } from "../i18n";

interface SEOProps {
  asset: Asset;
}

export function SEO({ asset }: SEOProps) {
  const { t, i18n } = useTranslation();

  const assetName = t(`assets.${asset}`);
  const title = `${assetName} DCA Calculator - Calculate Potential Returns`;
  const description = t("app.subtitle");
  const lang = i18n.language.split("-")[0];
  const baseUrl = window.location.origin;

  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": title,
    "description": description,
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Dollar Cost Averaging calculation",
      "Historical price data",
      "Multi-asset support (Bitcoin, Gold, Silver)",
      "Interactive charts"
    ]
  };

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* hreflang tags for all supported languages */}
      {Object.keys(LANGUAGES).map((l) => (
        <link 
          key={l} 
          rel="alternate" 
          hrefLang={l} 
          href={`${baseUrl}?lng=${l}`} 
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={baseUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* Canonical Link */}
      <link rel="canonical" href={baseUrl} />
    </Helmet>
  );
}
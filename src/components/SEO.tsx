import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  image?: string;
  type?: string;
}

const SEO = ({
  title,
  description,
  keywords,
  url,
  image,
  type = "website",
}: SEOProps) => {
  const { lang } = useParams();

  const defaultTitle = "Akhmads Net - Digital Advertising Network";
  const defaultDescription =
    "Smart advertising platform that connects advertisers with bot owners using AI-powered distribution. Earn money from your Telegram bots.";
  const defaultKeywords =
    "telegram ads, monetize bot, telegram advertising platform, buy telegram ads, akhmads net";
  const defaultImage = "https://akhmads.net/og-image.png"; // Assuming default image

  const metaTitle = title ? `${title} | Akhmads Net` : defaultTitle;
  const metaDesc = description || defaultDescription;
  const metaKeywords = keywords || defaultKeywords;
  const metaUrl = url ? `https://akhmads.net${url}` : "https://akhmads.net";
  const metaImage = image || defaultImage;

  return (
    <Helmet htmlAttributes={{ lang: lang || "en" }}>
      {/* Standard Metadata */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="keywords" content={metaKeywords} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content="Akhmads Net" />

      {/* Twitter Component */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />
      {/* <meta name="twitter:site" content="@yourtwitterhandle" /> */}
    </Helmet>
  );
};

export default SEO;

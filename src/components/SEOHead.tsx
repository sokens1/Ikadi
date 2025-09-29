import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  structuredData?: object;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "o'Hitu | République Gabonaise",
  description = "o'Hitu - Suivez les résultats en temps réel, découvrez les candidats et participez au processus démocratique en toute transparence.",
  keywords = "élections, Gabon, vote, résultats électoraux, démocratie, transparence, République Gabonaise, o'Hitu, candidats, bureaux de vote",
  image = 'https://ohitu.gabon.ga/og-image.jpg',
  url = 'https://ohitu.gabon.ga/',
  type = 'website',
  structuredData
}) => {
  const fullTitle = title.includes("o'Hitu") ? title : `${title} | o'Hitu`;
  const fullUrl = url.startsWith('http') ? url : `https://ohitu.gabon.ga${url}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="o'Hitu" />
      <meta property="og:locale" content="fr_GA" />
      <meta property="og:updated_time" content={new Date().toISOString()} />
      
      {/* WhatsApp specific */}
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:secure_url" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@gabon_officiel" />
      <meta name="twitter:creator" content="@gabon_officiel" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;

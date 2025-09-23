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
  title = 'iKADI - Plateforme de Gestion Électorale Sécurisée | République Gabonaise',
  description = 'iKADI est la plateforme officielle de gestion électorale de la République Gabonaise. Suivez les résultats en temps réel, découvrez les candidats et participez au processus démocratique en toute transparence.',
  keywords = 'élections, Gabon, vote, résultats électoraux, démocratie, transparence, République Gabonaise, iKADI, gestion électorale, candidats, bureaux de vote',
  image = 'https://ikadi.gabon.ga/og-image.jpg',
  url = 'https://ikadi.gabon.ga/',
  type = 'website',
  structuredData
}) => {
  const fullTitle = title.includes('iKADI') ? title : `${title} | iKADI`;
  const fullUrl = url.startsWith('http') ? url : `https://ikadi.gabon.ga${url}`;

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
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="iKADI" />
      <meta property="og:locale" content="fr_GA" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
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

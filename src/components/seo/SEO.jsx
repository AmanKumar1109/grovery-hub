import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, url, type = 'website', image, schema }) {
  const defaultTitle = 'The Grocery Hub - Fresh Groceries Delivered in 15 Minutes';
  const defaultDescription = 'Shop quality groceries, household essentials, snacks, beverages & personal care products-all at unbeatable prices. Delivered in 15 minutes.';
  // Update with production URL when deployed
  const defaultUrl = 'https://thegroceryhub.example.com';
  const defaultImage = `${defaultUrl}/favicon.png`;

  const seoTitle = title ? `${title} | The Grocery Hub` : defaultTitle;
  const seoDesc = description || defaultDescription;
  const seoUrl = url ? `${defaultUrl}${url}` : defaultUrl;
  const seoImage = image || defaultImage;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDesc} />
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDesc} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:site_name" content="The Grocery Hub" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDesc} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}

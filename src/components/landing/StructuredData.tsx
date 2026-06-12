export default function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GymOrFitnessCenter",
    "name": "Gimnasio",
    "description": "Gimnasio premium abierto 24/7 con entrenadores certificados, clases grupales, zona de recuperación y equipamiento de última generación.",
    "image": "https://gimnasio.com/og-image.jpg",
    "url": "https://gimnasio.com",
    "telephone": "+5355551234",
    "email": "hola@gimnasio.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Principal #123, Centro",
      "addressLocality": "Ciudad",
      "postalCode": "12345",
      "addressCountry": "CU"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 23.1234567,
      "longitude": -82.3456789
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "00:00",
        "closes": "23:59"
      }
    ],
    "priceRange": "$$-$$$",
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Estacionamiento gratuito", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Duchas", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Sauna", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Clases grupales", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Entrenador personal", "value": true }
    ],
    "sameAs": [
      "https://instagram.com/gimnasio",
      "https://facebook.com/Gimnasio",
      "https://twitter.com/gimnasio",
      "https://youtube.com/@Gimnasio"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "234"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

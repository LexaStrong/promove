import type { Metadata } from 'next';

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://promovegh.com';

export const siteUrl = new URL(configuredSiteUrl);

/**
 * Official ProMove Ghana contact and brand configuration
 */
export const siteConfig = {
  name: 'ProMove',
  legalName: 'ProMove Technologies',
  title: 'ProMove Fleet Management for Ghana | Vehicles, Drivers & Revenue',
  description:
    'Dedicated fleet operations platform for Ghanaian transport businesses. Manage vehicles, track daily income in pesewas, monitor live GPS, and automate DVLA document reminders.',
  url: configuredSiteUrl,
  supportEmail: 'support@promovegh.com',
  infoEmail: 'info@promovegh.com',
  phone: '+233595227273',
  phoneDisplay: '+233 59 522 7273',
  whatsappUrl: 'https://wa.me/233595227273?text=Hello%20ProMove%20Fleet%20Support%2C%20I%20would%20like%20to%20inquire%20about%20the%20platform.',
  socials: {
    handle: '@promovegh',
    instagram: 'https://instagram.com/promovegh',
    facebook: 'https://facebook.com/promovegh',
    twitter: 'https://x.com/promovegh',
  },
  address: {
    streetAddress: 'Ring Road West / Kwame Nkrumah Avenue',
    addressLocality: 'Accra',
    addressRegion: 'Greater Accra',
    postalCode: 'GA-110-0042',
    addressCountry: 'GH',
  },
  geo: {
    latitude: 5.6037,
    longitude: -0.187,
    region: 'GH-AA',
    placename: 'Accra, Ghana',
  },
};

export const privatePageRobots: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

/**
 * Common FAQs for Landing Page and AEO / Answer Engine Schema
 */
export const siteFaqs = [
  {
    question: 'What is ProMove and who is it designed for?',
    answer:
      'ProMove is Ghana’s dedicated fleet operating system, designed specifically for commercial vehicle owners, transport operators, trotro syndicates, logistics companies, and corporate fleets. It replaces informal paper notebooks and fragmented WhatsApp chats with a single digital platform for vehicle records, daily cash collections, maintenance scheduling, and DVLA compliance.',
  },
  {
    question: 'How does ProMove track fleet revenue and daily driver remittances?',
    answer:
      'ProMove records every transaction in exact Ghanaian pesewas (integer precision, zero floating-point errors). Fleet owners can track driver daily sales, fuel expenses, maintenance costs, and net remittances per vehicle in real-time, backed by an immutable append-only audit trail.',
  },
  {
    question: 'Does ProMove work offline without internet connectivity?',
    answer:
      'Yes. ProMove features built-in offline synchronization. Drivers and managers can record trips, fuel purchases, and daily collections along highways or remote corridors with zero signal. All data syncs automatically with duplicate prevention as soon as an internet connection is restored.',
  },
  {
    question: 'How does ProMove handle DVLA, roadworthiness, and insurance expiry alerts?',
    answer:
      'ProMove securely stores digital copies of vehicle registration logbooks, roadworthiness certificates, and insurance policies. Automated alerts notify fleet managers at 30 days, 14 days, and 7 days prior to expiry, eliminating costly roadside impoundments and police penalties.',
  },
  {
    question: 'How can I contact ProMove Ghana for support or general inquiries?',
    answer:
      'You can contact ProMove Ghana via dedicated customer support email at support@promovegh.com, general inquiries at info@promovegh.com, or directly by phone and WhatsApp at +233 59 522 7273 (+233595227273). Our support team operates Monday through Saturday from 7:00 AM to 8:00 PM GMT, with 24/7 priority emergency dispatch.',
  },
  {
    question: 'What are the official ProMove Ghana social media channels?',
    answer:
      'Follow ProMove Ghana on Instagram (@promovegh), Facebook (@promovegh), and X / Twitter (@promovegh) for platform updates, transport regulatory announcements, and fleet management tips.',
  },
];

/**
 * Structured Data (JSON-LD) for Root Organization, WebSite & SoftwareApplication
 */
export function getRootStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${configuredSiteUrl}/#organization`,
        name: siteConfig.name,
        legalName: siteConfig.legalName,
        url: configuredSiteUrl,
        logo: {
          '@type': 'ImageObject',
          '@id': `${configuredSiteUrl}/#logo`,
          url: `${configuredSiteUrl}/logo.png`,
          contentUrl: `${configuredSiteUrl}/logo.png`,
          width: 512,
          height: 512,
          caption: 'ProMove Fleet Management Ghana',
        },
        image: `${configuredSiteUrl}/og-image.png`,
        description: siteConfig.description,
        email: siteConfig.infoEmail,
        telephone: siteConfig.phone,
        sameAs: [
          siteConfig.socials.instagram,
          siteConfig.socials.facebook,
          siteConfig.socials.twitter,
        ],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: siteConfig.phone,
            contactType: 'customer support',
            email: siteConfig.supportEmail,
            areaServed: 'GH',
            availableLanguage: ['en', 'ak'],
            contactOption: 'TollFree',
          },
          {
            '@type': 'ContactPoint',
            telephone: siteConfig.phone,
            contactType: 'sales',
            email: siteConfig.infoEmail,
            areaServed: 'GH',
            availableLanguage: ['en'],
          },
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: siteConfig.address.streetAddress,
          addressLocality: siteConfig.address.addressLocality,
          addressRegion: siteConfig.address.addressRegion,
          postalCode: siteConfig.address.postalCode,
          addressCountry: siteConfig.address.addressCountry,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${configuredSiteUrl}/#website`,
        url: configuredSiteUrl,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          '@id': `${configuredSiteUrl}/#organization`,
        },
        inLanguage: 'en-GH',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${configuredSiteUrl}/#software`,
        name: 'ProMove Fleet OS',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, Android, iOS',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'GHS',
        },
        author: {
          '@id': `${configuredSiteUrl}/#organization`,
        },
        description:
          'Cloud-native commercial fleet and transport operations suite with live GPS telematics, driver management, DVLA document expiry reminders, and exact-pesewa ledger tracking.',
      },
    ],
  };
}

/**
 * Structured Data for Landing Page (including FAQPage for AEO)
 */
export function getLandingPageFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: siteFaqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
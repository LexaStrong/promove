import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  siteConfig,
  siteFaqs,
  getRootStructuredData,
  getLandingPageFaqSchema,
} from '../src/lib/site';

test('Contact & Socials: Validates required contact details and social media channels', () => {
  assert.equal(siteConfig.supportEmail, 'support@promovegh.com');
  assert.equal(siteConfig.infoEmail, 'info@promovegh.com');
  assert.equal(siteConfig.phone, '+233595227273');
  assert.equal(siteConfig.socials.handle, '@promovegh');
  assert.equal(siteConfig.socials.instagram, 'https://instagram.com/promovegh');
  assert.equal(siteConfig.socials.facebook, 'https://facebook.com/promovegh');
  assert.equal(siteConfig.socials.twitter, 'https://x.com/promovegh');
  assert.ok(siteConfig.whatsappUrl.includes('wa.me/233595227273'));
});

test('SEO & Schema.org: Organization, WebSite & SoftwareApplication JSON-LD is valid', () => {
  const data = getRootStructuredData();
  assert.equal(data['@context'], 'https://schema.org');
  assert.ok(Array.isArray(data['@graph']));

  const org = data['@graph'].find((item: any) => item['@type'] === 'Organization');
  assert.ok(org, 'Organization schema must exist');
  assert.equal(org.name, 'ProMove');
  assert.equal(org.email, 'info@promovegh.com');
  assert.equal(org.telephone, '+233595227273');
  assert.ok(org.sameAs.includes('https://instagram.com/promovegh'));
  assert.ok(org.sameAs.includes('https://facebook.com/promovegh'));
  assert.ok(org.sameAs.includes('https://x.com/promovegh'));

  const contactSupport = org.contactPoint.find((c: any) => c.contactType === 'customer support');
  assert.ok(contactSupport);
  assert.equal(contactSupport.email, 'support@promovegh.com');
  assert.equal(contactSupport.telephone, '+233595227273');
  assert.equal(contactSupport.areaServed, 'GH');

  const app = data['@graph'].find((item: any) => item['@type'] === 'SoftwareApplication');
  assert.ok(app, 'SoftwareApplication schema must exist');
});

test('AEO: FAQPage schema answers match site FAQs for answer engines', () => {
  const faqSchema = getLandingPageFaqSchema();
  assert.equal(faqSchema['@context'], 'https://schema.org');
  assert.equal(faqSchema['@type'], 'FAQPage');
  assert.equal(faqSchema.mainEntity.length, siteFaqs.length);

  const contactFaq = faqSchema.mainEntity.find((q: any) =>
    q.name.toLowerCase().includes('contact')
  );
  assert.ok(contactFaq, 'A contact question must exist in FAQ');
  assert.ok(contactFaq.acceptedAnswer.text.includes('support@promovegh.com'));
  assert.ok(contactFaq.acceptedAnswer.text.includes('info@promovegh.com'));
  assert.ok(contactFaq.acceptedAnswer.text.includes('+233595227273') || contactFaq.acceptedAnswer.text.includes('+233 59 522 7273'));
});

test('Indexing & Robots: File allows public indexing and AI search bots while protecting private routes', () => {
  const robotsPath = path.join(process.cwd(), 'src', 'app', 'robots.ts');
  assert.ok(fs.existsSync(robotsPath));
  const content = fs.readFileSync(robotsPath, 'utf8');

  assert.ok(content.includes('Google-Extended'));
  assert.ok(content.includes('GPTBot'));
  assert.ok(content.includes('PerplexityBot'));
  assert.ok(content.includes('ClaudeBot'));
  assert.ok(content.includes("allow: ['/', '/privacy', '/contact'"));
  assert.ok(content.includes("sitemap: new URL('/sitemap.xml', siteUrl).toString()"));
});

test('Sitemap: Contains home, privacy, contact, and llms.txt endpoints', () => {
  const sitemapPath = path.join(process.cwd(), 'src', 'app', 'sitemap.ts');
  assert.ok(fs.existsSync(sitemapPath));
  const content = fs.readFileSync(sitemapPath, 'utf8');

  assert.ok(content.includes("url: new URL('/', siteUrl).toString()"));
  assert.ok(content.includes("url: new URL('/privacy', siteUrl).toString()"));
  assert.ok(content.includes("url: new URL('/contact', siteUrl).toString()"));
  assert.ok(content.includes("url: new URL('/llms.txt', siteUrl).toString()"));
  assert.ok(content.includes("changeFrequency: 'daily'"));
});

test('GEO: llms.txt and llms-full.txt files exist with required contact and entity facts', () => {
  const llmsPath = path.join(process.cwd(), 'public', 'llms.txt');
  const llmsFullPath = path.join(process.cwd(), 'public', 'llms-full.txt');

  assert.ok(fs.existsSync(llmsPath), 'public/llms.txt must exist');
  assert.ok(fs.existsSync(llmsFullPath), 'public/llms-full.txt must exist');

  const llmsContent = fs.readFileSync(llmsPath, 'utf8');
  assert.ok(llmsContent.includes('support@promovegh.com'));
  assert.ok(llmsContent.includes('info@promovegh.com'));
  assert.ok(llmsContent.includes('+233 59 522 7273'));
  assert.ok(llmsContent.includes('@promovegh'));
  assert.ok(llmsContent.includes('https://instagram.com/promovegh'));
  assert.ok(llmsContent.includes('https://facebook.com/promovegh'));
  assert.ok(llmsContent.includes('https://x.com/promovegh'));
});

test('Contact Page & Menu: Validates /contact page and layout existence with support channels', () => {
  const contactPagePath = path.join(process.cwd(), 'src', 'app', 'contact', 'page.tsx');
  const contactLayoutPath = path.join(process.cwd(), 'src', 'app', 'contact', 'layout.tsx');
  const appShellPath = path.join(process.cwd(), 'src', 'components', 'app-shell.tsx');

  assert.ok(fs.existsSync(contactPagePath), 'src/app/contact/page.tsx must exist');
  assert.ok(fs.existsSync(contactLayoutPath), 'src/app/contact/layout.tsx must exist');

  const shellContent = fs.readFileSync(appShellPath, 'utf8');
  assert.ok(shellContent.includes("href: '/contact'"), 'AppShell menu must include /contact');
  assert.ok(shellContent.includes("label: 'Contact & Support'"), 'AppShell menu must have Contact & Support label');
});

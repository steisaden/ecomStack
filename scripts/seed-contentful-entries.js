#!/usr/bin/env node

/**
 * Seed Contentful entries for products, yoga services, add-on experiences, and About page
 *
 * Usage:
 *   node scripts/seed-contentful-entries.js
 */

require('dotenv').config();
const contentful = require('contentful-management');

const requiredEnv = ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_MANAGEMENT_TOKEN'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing environment variables:', missing.join(', '));
  process.exit(1);
}

const LOCALE = process.env.CONTENTFUL_LOCALE || 'en-US';

const client = contentful.createClient({ accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN });

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

function buildRichText(paragraphs = []) {
  return {
    nodeType: 'document',
    data: {},
    content: paragraphs.map((p) => ({
      nodeType: 'paragraph',
      data: {},
      content: [{ nodeType: 'text', value: p, marks: [], data: {} }],
    })),
  };
}

async function getEnvironment() {
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
  const envId = process.env.CONTENTFUL_ENVIRONMENT_ID || 'master';
  return space.getEnvironment(envId);
}

async function ensureContentTypeActive(environment, contentTypeId) {
  try {
    const ct = await environment.getContentType(contentTypeId);
    // If not published, publish it
    if (!ct.sys.publishedVersion) {
      await ct.publish();
    }
  } catch (err) {
    // Best effort: log and continue; caller will retry
    console.warn(`Warning: could not verify content type '${contentTypeId}': ${err.message || err}`);
  }
}

async function createOrUpdateById(environment, contentType, id, fields, attempt = 1) {
  try {
    const entry = await environment.getEntry(id);
    Object.assign(entry.fields, fields);
    const updated = await entry.update();
    const published = await updated.publish();
    return published;
  } catch (e) {
    // If not found, try to create with retries on activation errors
    const isActivationError = e && e.message && (
      e.message.includes('not be found or was not activated') ||
      e.message.includes('unknownContentType')
    );
    if (isActivationError && attempt <= 5) {
      console.log(`Content type '${contentType}' may not be active yet. Waiting and retrying (attempt ${attempt})...`);
      await ensureContentTypeActive(environment, contentType);
      await sleep(2000 * attempt);
      return createOrUpdateById(environment, contentType, id, fields, attempt + 1);
    }
    try {
      const created = await environment.createEntryWithId(contentType, id, { fields });
      const published = await created.publish();
      return published;
    } catch (err2) {
      const isActivationError2 = err2 && err2.message && (
        err2.message.includes('not be found or was not activated') ||
        err2.message.includes('unknownContentType')
      );
      if (isActivationError2 && attempt <= 5) {
        console.log(`Content type '${contentType}' may not be active yet (on create). Waiting and retrying (attempt ${attempt})...`);
        await ensureContentTypeActive(environment, contentType);
        await sleep(2000 * attempt);
        return createOrUpdateById(environment, contentType, id, fields, attempt + 1);
      }
      throw err2;
    }
  }
}

function summarize(text, maxLen = 300) {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > maxLen ? `${t.slice(0, maxLen - 1)}…` : t;
}

// Remove getEntryBySlug; we will use deterministic IDs via createOrUpdateById

async function resolveContentTypeIds(environment) {
  const list = await environment.getContentTypes();
  const byId = new Map(list.items.map(i => [i.sys.id, i]));
  const byName = new Map(list.items.map(i => [String(i.name || '').toLowerCase(), i]));

  function pick(preferredId, displayName) {
    if (byId.has(preferredId)) return byId.get(preferredId).sys.id;
    const found = byName.get(String(displayName).toLowerCase());
    if (found) return found.sys.id;
    throw new Error(`Content type not found: prefer '${preferredId}' or name '${displayName}'`);
  }

  return {
    category: pick('category', 'Category'),
    aboutPage: pick('aboutPage', 'About Page'),
    goddessCareProduct: pick('goddessCareProduct', 'Goddess Care Product'),
    yogaService: pick('yogaService', 'Yoga Service'),
    addOnExperience: pick('addOnExperience', 'Add-On Experience'),
    navigationItem: pick('navigationItem', 'Navigation Item'),
    footerSection: pick('footerSection', 'Footer Section'),
    contactInfo: pick('contactInfo', 'Contact Info'),
    socialLink: pick('socialLink', 'Social Link'),
    ctaButton: pick('ctaButton', 'CTA Button'),
    heroContent: pick('heroContent', 'Hero Content'),
    globalSettings: pick('globalSettings', 'Global Settings'),
  };
}

// Seed Global Settings with defaults
async function seedGlobalSettings(environment, ctIds) {
  const gsId = 'global-settings';
  const fields = {
    siteTitle: { [LOCALE]: 'Goddess Care Co' },
    siteDescription: { [LOCALE]: 'Handcrafted oils and natural beauty essentials' },
    seoKeywords: { [LOCALE]: ['beauty', 'skincare', 'natural', 'handcrafted', 'oils'] },
    copyrightText: { [LOCALE]: `© ${new Date().getFullYear()} Goddess Care Co. All rights reserved.` },
    // Navigation items: create minimal primary nav
    primaryNavigation: { [LOCALE]: [] },
    footerNavigation: { [LOCALE]: [] },
    socialLinks: { [LOCALE]: [] },
    footerSections: { [LOCALE]: [] }
  };

  await createOrUpdateById(environment, ctIds.globalSettings, gsId, fields);
  console.log('Ensured Global Settings.');
}

async function ensureCategory(environment, contentTypeId, { name, slug }) {
  // category has fields: name (Symbol), slug (Symbol)
  const fields = {
    name: { [LOCALE]: name },
    slug: { [LOCALE]: slug },
  };
  const entry = await createOrUpdateById(environment, contentTypeId, slug, fields);
  console.log(`Ensured category: ${name}`);
  return entry;
}

async function seedAboutPage(environment, ctIds) {
  const bio = `GoddessCareCo is a premium self-care and lifestyle brand designed to awaken your inner power and elevate your everyday experience from a holistic perspective. We believe true beauty radiates from alignment—where wellness, confidence, and intention meet. Our mission is to empower you to be the best version of yourself, with luxury essentials that nurture your body, refine your routine, and restore balance.

Our thoughtfully curated collection includes nutrient-rich growth hair oil, eco-luxe yoga mats, high-performance sportswear, and indulgent beauty and nail care. We also offer bespoke 1:1 yoga sessions tailored to your personal goals—inviting you to reconnect with your body, mind, and elevated energy state. For men, our grooming line redefines self-care with sophistication and strength.

At GoddessCareCo, self-care is not just a habit, but a sacred practice—a daily devotion to your highest self. Every product, every moment, is intentionally crafted to inspire confidence, clarity, and a lifestyle of refined wellness.

GoddessCareCo — Be the best version of yourself.`;

  const fields = {
    title: { [LOCALE]: 'About GoddessCareCo' },
    slug: { [LOCALE]: 'about' },
    content: { [LOCALE]: buildRichText(bio.split('\n\n')) },
    seoDescription: { [LOCALE]: summarize(bio, 160) },
  };

  await createOrUpdateById(environment, ctIds.aboutPage, 'about', fields);
  console.log('Ensured About page.');
}

async function seedProducts(environment, ctIds, categoryId) {
  // Product content type: goddessCareProduct
  const products = [
    {
      id: 'goddess-hair-oil',
      title: 'Goddess Hair Oil',
      slug: 'goddess-hair-oil',
      price: 35,
      descriptionParas: [
        'Elevate your hair ritual with our cold-pressed growth elixir featuring tea tree and eucalyptus—crafted to clarify the scalp, boost circulation, and encourage stronger, fuller growth.',
        'This luxury blend nourishes from root to tip, soothing dryness while restoring natural shine. Lightweight yet potent, it absorbs quickly without buildup, making it perfect for protective styles and daily care.',
        'Scent profile: clean, refreshing, and subtly herbal—an invigorating moment of self-care in every drop.'
      ],
      inStock: true,
    },
    {
      id: 'goddess-body-oil',
      title: 'Goddess Body Oil',
      slug: 'goddess-body-oil',
      price: 35,
      descriptionParas: [
        'Indulge your skin with a luxury-grade infusion of tea tree and coconut, enhanced with vitamin E for deep moisture and radiant softness.',
        'Silky and fast-absorbing, this body oil calms and replenishes while leaving a natural glow—perfect after-shower or as a daily body conditioning ritual.',
        'Scent profile: smooth, warm, and subtly uplifting—wellness, bottled.'
      ],
      inStock: true,
    },
  ];

  for (const p of products) {
    const fields = {
      title: { [LOCALE]: p.title },
      slug: { [LOCALE]: p.slug },
      description: { [LOCALE]: buildRichText(p.descriptionParas) },
      price: { [LOCALE]: p.price },
      images: { [LOCALE]: [] },
      category: categoryId
        ? { [LOCALE]: { sys: { type: 'Link', linkType: 'Entry', id: categoryId } } }
        : undefined,
      inStock: { [LOCALE]: p.inStock },
      isAffiliate: { [LOCALE]: false },
      affiliateUrl: { [LOCALE]: '' },
    };

    await createOrUpdateById(environment, ctIds.goddessCareProduct, p.id, fields);
    console.log(`Ensured product: ${p.title}`);
  }
}

async function seedYogaServices(environment, ctIds) {
  const services = [
    {
      id: 'private-one-on-one-yoga',
      name: 'Private One-on-One Yoga',
      slug: 'private-one-on-one-yoga',
      description:
        'A customized private session tailored to your goals and energy. Includes deeply restoring experience.',
      price: 150,
      duration: 60,
      category: 'Private',
      includedAmenities: ['Premium mat', 'Aromatherapy', 'Personalized flow'],
      luxuryFeatures: ['Curated music', 'Warm towel finish'],
      displayOrder: 1,
    },
    {
      id: 'private-couples-yoga',
      name: 'Private Couples Yoga',
      slug: 'private-couples-yoga',
      description:
        'A luxury partner flow focused on connection and balance. Includes wellness tea service and guided breathwork.',
      price: 220,
      duration: 60,
      category: 'Couples',
      includedAmenities: ['Wellness tea', 'Essential oils', 'Guided breathwork'],
      luxuryFeatures: ['Scented ambiance', 'Hands-on assists (optional)'],
      displayOrder: 2,
    },
    {
      id: 'group-yoga-3-6',
      name: 'Group Yoga (3–6 people)',
      slug: 'group-yoga-3-6-people',
      description: 'A boutique small-group experience designed to energize and align.',
      price: 85,
      duration: 60,
      category: 'Group',
      includedAmenities: ['Group mats by request', 'Curated flow'],
      luxuryFeatures: ['Atmospheric playlist'],
      displayOrder: 3,
    },
    {
      id: 'mommy-and-me-yoga',
      name: 'Mommy & Me Yoga',
      slug: 'mommy-and-me-yoga',
      description:
        'A gentle bonding session with mindful movement. Includes keepsake mini yoga kit for little ones.',
      price: 90,
      duration: 45,
      category: 'Family',
      includedAmenities: ['Keepsake mini yoga kit', 'Calming aromatherapy'],
      luxuryFeatures: ['Soft ambient lighting'],
      displayOrder: 4,
    },
    {
      id: 'virtual-yoga-class',
      name: 'Virtual Yoga Class',
      slug: 'virtual-yoga-class',
      description: 'Small-group, live-stream instruction with optional class recording.',
      price: 55,
      duration: 45,
      category: 'Virtual',
      includedAmenities: ['Recording optional', 'Real-time instruction'],
      luxuryFeatures: ['Curated at-home setup tips'],
      displayOrder: 5,
    },
    {
      id: 'virtual-wellness-coaching',
      name: 'Virtual Wellness Coaching',
      slug: 'virtual-wellness-coaching',
      description: 'Personalized self-care and nutrition plan built around your lifestyle and goals.',
      price: 120,
      duration: 60,
      category: 'Coaching',
      includedAmenities: ['Actionable plan', 'Follow-up recommendations'],
      luxuryFeatures: ['Habit tracking guidance'],
      displayOrder: 6,
    },
  ];

  for (const s of services) {
    const fields = {
      name: { [LOCALE]: s.name },
      slug: { [LOCALE]: s.slug },
      description: { [LOCALE]: s.description },
      price: { [LOCALE]: s.price },
      duration: { [LOCALE]: s.duration },
      category: { [LOCALE]: s.category },
      includedAmenities: { [LOCALE]: s.includedAmenities },
      luxuryFeatures: { [LOCALE]: s.luxuryFeatures },
      displayOrder: { [LOCALE]: s.displayOrder },
    };

    await createOrUpdateById(environment, ctIds.yogaService, s.id, fields);
    console.log(`Ensured service: ${s.name}`);
  }
}

async function seedAddOnExperiences(environment, ctIds) {
  const addOns = [
    {
      id: 'aromatherapy-upgrade',
      name: 'Aromatherapy Upgrade',
      description: 'Elevate your session with therapeutic essential oil diffusers for deeper relaxation and clarity.',
      price: 25,
      applicableServices: [
        'Private One-on-One Yoga',
        'Private Couples Yoga',
        'Group Yoga (3–6 people)',
        'Mommy & Me Yoga',
        'Virtual Yoga Class',
      ],
    },
    {
      id: 'gift-packaging',
      name: 'Gift Packaging',
      description: 'Velvet pouch with a gold-foil card—perfect for unforgettable gifting.',
      price: 15,
      applicableServices: ['All Services'],
    },
    {
      id: 'seasonal-limited-edition-oils',
      name: 'Seasonal Limited-Edition Oils',
      description: 'Exclusive seasonal blends to complement your session and extend the luxury at home.',
      price: 65,
      applicableServices: ['Private One-on-One Yoga', 'Private Couples Yoga'],
    },
  ];

  for (const a of addOns) {
    const fields = {
      name: { [LOCALE]: a.name },
      description: { [LOCALE]: a.description },
      price: { [LOCALE]: a.price },
      applicableServices: { [LOCALE]: a.applicableServices },
    };

    await createOrUpdateById(environment, ctIds.addOnExperience, a.id, fields);
    console.log(`Ensured add-on: ${a.name}`);
  }
}

(async function run() {
  try {
    const env = await getEnvironment();

    // Resolve actual content type IDs in the space/environment
    const ctIds = await resolveContentTypeIds(env);

    // Proactively ensure required content types are active/published
    for (const ct of Object.values(ctIds)) {
      await ensureContentTypeActive(env, ct);
    }

    // Ensure we have a category for products
    const categorySlug = 'luxury-oils';
    const categoryEntry = await ensureCategory(env, ctIds.category, { name: 'Luxury Oils', slug: categorySlug });

    await seedAboutPage(env, ctIds);
    await seedProducts(env, ctIds, categoryEntry?.sys?.id || categorySlug);
    await seedYogaServices(env, ctIds);
    await seedAddOnExperiences(env, ctIds);
+    await seedGlobalSettings(env, ctIds);

    console.log('\n✅ Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err.message || err);
    process.exit(1);
  }
})();
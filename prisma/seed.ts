/**
 * Seeds a fully-populated demo tenant ("Blue Moon Labradors") so you can
 * explore the public site and dashboard without manually clicking through
 * onboarding. Safe to run repeatedly — it upserts by slug.
 *
 * Usage:
 *   npm run db:seed
 *
 * To also seed a dashboard owner you can log in as, sign up once through
 * the app first (so Supabase creates the auth user), then re-run this
 * script with that user's id/email:
 *
 *   DEMO_OWNER_USER_ID=<supabase-auth-uid> DEMO_OWNER_EMAIL=you@example.com npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG = "blue-moon-labradors";
const photo = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  console.log(`Seeding demo tenant "${SLUG}"...`);

  const tenant = await prisma.tenant.upsert({
    where: { slug: SLUG },
    update: {},
    create: {
      slug: SLUG,
      kennelName: "Blue Moon Labradors",
      species: "dog",
      breeds: ["Labrador Retriever"],
      status: "active",
      themePreset: "meadow",
      accentColor: "#5B7553",
      logoUrl: photo("bml-logo", 200, 200),
      heroImageUrl: photo("bml-hero", 1600, 900),
      tagline: "Health-tested, home-raised Labrador Retrievers in the Blue Ridge foothills.",
      aboutHtml:
        "<p>We're a small hobby kennel raising English-style Labrador Retrievers with a focus on temperament, structure, and full health clearances (OFA hips/elbows, CERF eyes, EIC/CNM/PRA DNA panel).</p><p>Every puppy is raised underfoot in our home with early neurological stimulation, crate introduction, and lots of love before going to their new family at 8 weeks.</p>",
      contactEmail: "hello@bluemoonlabs.example.com",
      contactPhone: "(555) 010-1234",
      address: "Asheville, NC",
      instagramUrl: "https://instagram.com/bluemoonlabs",
      facebookUrl: "https://facebook.com/bluemoonlabs",
      depositPolicy:
        "A $500 non-refundable deposit reserves your puppy's place in the litter and is applied toward the final purchase price.",
      healthGuaranteeHtml:
        "<p>All puppies come with a 2-year genetic health guarantee against life-limiting hereditary conditions, OFA prelims on both parents, and up-to-date vaccinations/deworming.</p>",
      contractHtml:
        "<p>Buyers agree to provide veterinary care, a safe home environment, and to contact us first if they can no longer keep the dog at any point in its life.</p>",
      spayNeuterHtml:
        "<p>Pet-quality puppies are sold on a spay/neuter contract, to be completed by 12 months of age.</p>",
      onboarding: {
        create: {
          billingComplete: true,
          profileComplete: true,
          themeComplete: true,
          firstLitterComplete: true,
          stripeConnected: true,
          socialsComplete: true,
          published: true,
        },
      },
      subscription: {
        create: {
          plan: "pro",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        },
      },
      stripeAccount: {
        create: {
          stripeAccountId: "acct_demo_seed_placeholder",
          chargesEnabled: true,
          payoutsEnabled: true,
          detailsSubmitted: true,
        },
      },
    },
  });

  // Reset child collections so re-running the seed doesn't duplicate rows.
  await prisma.$transaction([
    prisma.offspring.deleteMany({ where: { tenantId: tenant.id } }),
    prisma.litter.deleteMany({ where: { tenantId: tenant.id } }),
    prisma.animal.deleteMany({ where: { tenantId: tenant.id } }),
    prisma.media.deleteMany({ where: { tenantId: tenant.id } }),
    prisma.testimonial.deleteMany({ where: { tenantId: tenant.id } }),
    prisma.faqItem.deleteMany({ where: { tenantId: tenant.id } }),
    prisma.waitlistEntry.deleteMany({ where: { tenantId: tenant.id } }),
    prisma.lead.deleteMany({ where: { tenantId: tenant.id } }),
    prisma.affiliateProduct.deleteMany({ where: { tenantId: tenant.id } }),
  ]);

  const dam = await prisma.animal.create({
    data: {
      tenantId: tenant.id,
      name: "Willow",
      species: "dog",
      breed: "Labrador Retriever",
      sex: "female",
      dateOfBirth: new Date("2021-04-12"),
      color: "Yellow",
      weightLbs: 58,
      bio: "Willow is our sweet, biddable foundation girl — calm in the house, tireless in the field.",
      registryNumber: "AKC-WM123456",
      titles: ["CGC"],
      healthTests: [
        { test: "OFA Hips", result: "Good", date: "2023-06-01" },
        { test: "OFA Elbows", result: "Normal", date: "2023-06-01" },
        { test: "CERF Eyes", result: "Clear", date: "2024-01-15" },
      ],
      coverPhotoUrl: photo("willow"),
    },
  });

  const sire = await prisma.animal.create({
    data: {
      tenantId: tenant.id,
      name: "Bear",
      species: "dog",
      breed: "Labrador Retriever",
      sex: "male",
      dateOfBirth: new Date("2020-09-03"),
      color: "Black",
      weightLbs: 75,
      bio: "Bear is a block-headed, athletic boy with a rock-solid temperament — a favorite with kids and other dogs alike.",
      registryNumber: "AKC-BR654321",
      titles: ["CGC", "TKN"],
      healthTests: [
        { test: "OFA Hips", result: "Excellent", date: "2022-11-01" },
        { test: "OFA Elbows", result: "Normal", date: "2022-11-01" },
        { test: "EIC/CNM/PRA Panel", result: "Clear", date: "2022-05-01" },
      ],
      coverPhotoUrl: photo("bear"),
    },
  });

  await prisma.animal.create({
    data: {
      tenantId: tenant.id,
      name: "Daisy",
      species: "dog",
      breed: "Labrador Retriever",
      sex: "female",
      dateOfBirth: new Date("2017-02-20"),
      color: "Chocolate",
      isBreedingStock: false,
      isRetired: true,
      bio: "Daisy is our beloved retired matriarch, now enjoying a well-earned life of naps and belly rubs.",
      coverPhotoUrl: photo("daisy"),
    },
  });

  const activeLitter = await prisma.litter.create({
    data: {
      tenantId: tenant.id,
      species: "dog",
      breed: "Labrador Retriever",
      sireId: sire.id,
      damId: dam.id,
      status: "active",
      whelpDate: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
      goHomeDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      description: "A gorgeous litter of 6 — 3 yellow, 3 black — bursting with drive and good manners.",
      defaultPrice: 2500,
      defaultDepositAmount: 500,
      coverPhotoUrl: photo("litter-active"),
    },
  });

  const offspringSeed: {
    name: string;
    sex: "male" | "female";
    color: string;
    status: "available" | "deposit_received" | "reserved" | "sold";
  }[] = [
    { name: "Scout", sex: "male", color: "Yellow", status: "available" },
    { name: "Luna", sex: "female", color: "Black", status: "available" },
    { name: "Gus", sex: "male", color: "Black", status: "deposit_received" },
    { name: "Poppy", sex: "female", color: "Yellow", status: "reserved" },
    { name: "Duke", sex: "male", color: "Black", status: "sold" },
    { name: "Ivy", sex: "female", color: "Yellow", status: "available" },
  ];

  const offspringRecords = [];
  for (const o of offspringSeed) {
    const record = await prisma.offspring.create({
      data: {
        tenantId: tenant.id,
        litterId: activeLitter.id,
        name: o.name,
        sex: o.sex,
        color: o.color,
        price: 2500,
        depositAmount: 500,
        status: o.status,
        coverPhotoUrl: photo(`pup-${o.name.toLowerCase()}`),
      },
    });
    offspringRecords.push(record);
  }

  const pastLitter = await prisma.litter.create({
    data: {
      tenantId: tenant.id,
      species: "dog",
      breed: "Labrador Retriever",
      sireId: sire.id,
      damId: dam.id,
      status: "complete",
      whelpDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
      goHomeDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
      description: "Our first litter together — 5 healthy, happy puppies all placed in loving homes.",
      defaultPrice: 2200,
      defaultDepositAmount: 500,
      coverPhotoUrl: photo("litter-past"),
    },
  });

  for (const [i, name] of ["Max", "Bella", "Rocky", "Molly", "Cooper"].entries()) {
    await prisma.offspring.create({
      data: {
        tenantId: tenant.id,
        litterId: pastLitter.id,
        name,
        sex: i % 2 === 0 ? "male" : "female",
        color: i % 2 === 0 ? "Black" : "Yellow",
        price: 2200,
        status: "sold",
        coverPhotoUrl: photo(`past-${name.toLowerCase()}`),
      },
    });
  }

  await prisma.media.createMany({
    data: [1, 2, 3, 4, 5, 6].map((n) => ({
      tenantId: tenant.id,
      entityType: "tenant" as const,
      entityId: tenant.id,
      url: photo(`gallery-${n}`, 800, 800),
      sortOrder: n,
    })),
  });

  await prisma.testimonial.createMany({
    data: [
      {
        tenantId: tenant.id,
        authorName: "The Ramirez Family",
        quote:
          "Our puppy Scout from Blue Moon has been the perfect addition to our family. Health-tested, well-socialized, and clearly loved before he even came home.",
        rating: 5,
      },
      {
        tenantId: tenant.id,
        authorName: "Jake & Priya T.",
        quote: "Communication was fantastic every step of the way. You can tell this is a labor of love, not a business.",
        rating: 5,
      },
      {
        tenantId: tenant.id,
        authorName: "Morgan H.",
        quote: "Bear and Willow's puppies have incredible temperaments. Our dog is calm, smart, and great with our kids.",
        rating: 5,
      },
    ],
  });

  await prisma.faqItem.createMany({
    data: [
      {
        tenantId: tenant.id,
        question: "What health testing do you do on your breeding dogs?",
        answer: "Both parents have OFA hip/elbow evaluations, CERF eye exams, and a full DNA health panel (EIC, CNM, PRA, dilute).",
        sortOrder: 1,
      },
      {
        tenantId: tenant.id,
        question: "How do I reserve a puppy?",
        answer: "A refundable-until-birth deposit reserves your spot on our list; once puppies are born, deposits become non-refundable and pick order is determined by deposit date.",
        sortOrder: 2,
      },
      {
        tenantId: tenant.id,
        question: "Do you ship puppies?",
        answer: "We prefer in-person pickup or a ground transport service, and can also meet within a few hours of Asheville, NC.",
        sortOrder: 3,
      },
      {
        tenantId: tenant.id,
        question: "What's included when I bring my puppy home?",
        answer: "A starter food kit, blanket with mom's scent, vet records, AKC registration paperwork, and our 2-year health guarantee.",
        sortOrder: 4,
      },
    ],
  });

  await prisma.waitlistEntry.createMany({
    data: [
      { tenantId: tenant.id, name: "Casey Nguyen", email: "casey@example.com", breed: "Labrador Retriever", rank: 1 },
      { tenantId: tenant.id, name: "Sam Okafor", email: "sam@example.com", breed: "Labrador Retriever", rank: 2 },
      { tenantId: tenant.id, name: "Terry Lopez", email: "terry@example.com", breed: "Labrador Retriever", rank: 3 },
    ],
  });

  const availablePup = offspringRecords.find((o) => o.name === "Scout");
  const depositPup = offspringRecords.find((o) => o.name === "Gus");

  await prisma.lead.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: "Alex Rivera",
        email: "alex.rivera@example.com",
        phone: "(555) 222-1111",
        message: "Hi! Is Scout still available? We'd love to meet him.",
        source: "inquiry",
        status: "new",
        offspringId: availablePup?.id,
      },
      {
        tenantId: tenant.id,
        name: "The Chen Family",
        email: "chenfamily@example.com",
        message: "Paid a $500 deposit on Gus.",
        source: "deposit",
        status: "deposit",
        offspringId: depositPup?.id,
      },
      {
        tenantId: tenant.id,
        name: "Jordan Blake",
        email: "jordan.blake@example.com",
        phone: "(555) 333-4444",
        message: "Do you have any upcoming litters planned for next spring?",
        source: "inquiry",
        status: "contacted",
      },
    ],
  });

  if (depositPup) {
    await prisma.deposit.create({
      data: {
        tenantId: tenant.id,
        offspringId: depositPup.id,
        buyerName: "The Chen Family",
        buyerEmail: "chenfamily@example.com",
        amount: 500,
        status: "paid",
        policySnapshot:
          "A $500 non-refundable deposit reserves your puppy's place in the litter and is applied toward the final purchase price.",
      },
    });
  }

  const amazonSettings = await prisma.amazonSettings.upsert({
    where: { tenantId: tenant.id },
    update: { associatesTag: "bluemoonlabs-20", isConfigured: true },
    create: { tenantId: tenant.id, associatesTag: "bluemoonlabs-20", isConfigured: true },
  });

  await prisma.affiliateProduct.createMany({
    data: [
      {
        tenantId: tenant.id,
        category: "food",
        originalUrl: "https://www.amazon.com/dp/B00025644G",
        affiliateUrl: `https://www.amazon.com/dp/B00025644G?tag=${amazonSettings.associatesTag}`,
        title: "Puppy-formula dry food (30 lb bag)",
        imageUrl: photo("aff-food", 400, 400),
        price: "$54.99",
        sortOrder: 1,
      },
      {
        tenantId: tenant.id,
        category: "crates",
        originalUrl: "https://www.amazon.com/dp/B0002AR15Y",
        affiliateUrl: `https://www.amazon.com/dp/B0002AR15Y?tag=${amazonSettings.associatesTag}`,
        title: "42-inch wire dog crate with divider",
        imageUrl: photo("aff-crate", 400, 400),
        price: "$64.99",
        sortOrder: 2,
      },
      {
        tenantId: tenant.id,
        category: "toys",
        originalUrl: "https://www.amazon.com/dp/B0002DJXHM",
        affiliateUrl: `https://www.amazon.com/dp/B0002DJXHM?tag=${amazonSettings.associatesTag}`,
        title: "Durable rubber chew toy, 3-pack",
        imageUrl: photo("aff-toy", 400, 400),
        price: "$19.99",
        sortOrder: 3,
      },
    ],
  });

  const ownerUserId = process.env.DEMO_OWNER_USER_ID;
  const ownerEmail = process.env.DEMO_OWNER_EMAIL;

  if (ownerUserId && ownerEmail) {
    await prisma.user.upsert({
      where: { id: ownerUserId },
      update: { email: ownerEmail },
      create: { id: ownerUserId, email: ownerEmail, platformRole: "breeder_owner" },
    });
    await prisma.tenantMember.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: ownerUserId } },
      update: { role: "owner" },
      create: { tenantId: tenant.id, userId: ownerUserId, role: "owner" },
    });
    console.log(`Linked ${ownerEmail} as owner of ${tenant.kennelName}.`);
  } else {
    console.log(
      "No DEMO_OWNER_USER_ID/DEMO_OWNER_EMAIL provided — skipping dashboard owner. " +
        "Sign up through the app, then re-run with those env vars to log in as this tenant's owner."
    );
  }

  console.log(`Done. Visit the public site at http://${tenant.slug}.localhost:3000 (or your configured root domain).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

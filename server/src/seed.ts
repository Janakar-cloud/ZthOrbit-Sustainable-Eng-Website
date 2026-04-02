import bcrypt from "bcryptjs";
import { connectDb } from "./config/db.js";
import { User } from "./models/User.js";
import { Tag } from "./models/Tag.js";
import { LiveConfig } from "./models/LiveConfig.js";
import { Video } from "./models/Video.js";
import { Podcast } from "./models/Podcast.js";
import { Article } from "./models/Article.js";
import { CaseStory } from "./models/CaseStory.js";
import { AboutBlock } from "./models/AboutBlock.js";

async function main() {
  await connectDb();

  const categoryNames = ["Aether", "Materia", "Aqua", "Terra", "Civitas"];
  const tagDocs = await Promise.all(
    categoryNames.map((name) => Tag.findOneAndUpdate({ name }, { name, kind: "category" }, { upsert: true, new: true }))
  );
  const tagMap = Object.fromEntries(tagDocs.map((t) => [t.name, t._id]));

  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || "ChangeMe123!";
  const testUsers = [
    { email: "superadmin@zthorbit.local", role: "superadmin" as const, name: "Super Admin" },
    { email: "janakar.ganesan@gmail.com", role: "superadmin" as const, name: "Janakar" },
    { email: "admin1@zthorbit.local", role: "admin" as const, name: "Admin One" },
    { email: "admin2@zthorbit.local", role: "admin" as const, name: "Admin Two" },
    { email: "user1@zthorbit.local", role: "viewer" as const, name: "User One" },
    { email: "user2@zthorbit.local", role: "viewer" as const, name: "User Two" },
  ];
  const primaryAdminEmail = testUsers[0].email;

  for (const user of testUsers) {
    const hash = await bcrypt.hash(defaultPassword, 10);
    await User.findOneAndUpdate(
      { email: user.email },
      { email: user.email, passwordHash: hash, role: user.role, status: "active", name: user.name, emailVerified: true },
      { upsert: true, new: true }
    );
  }

  await LiveConfig.findOneAndUpdate(
    {},
    {
      streamUrl: "https://example.com/live.m3u8",
      title: "Live Sustainable Engineering Channel",
      description: "24/7 conversations on sustainability, technology, and impact.",
      updatedBy: primaryAdminEmail,
      updatedAt: new Date(),
    },
    { upsert: true }
  );

  await Video.deleteMany({});
  await Video.insertMany([
    {
      title: "Sustainability in Sanatana Dharma Part 2",
      description: "Part 2 of the Sanatana Dharma sustainability series.",
      streamUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/LiveTV/Sustainability+in+sanatana+Dharma+PART+2.mp4",
      thumbnailUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/Thumbnail/videos/Sustainability+in+sanatana+Dharma+PART+2.jpg",
      publishDate: new Date("2026-03-02"),
      status: "published",
      isLive: false,
      tags: [tagMap.Aether],
      seriesId: "sanatana-dharma",
      partNumber: 2,
      partTitle: "Part 2",
    },
  ]);

  await Podcast.deleteMany({});
  await Podcast.insertMany([
    {
      title: "A Call from the Earth: Opportunities",
      description: "Opportunities presented by Earth’s environmental challenges.",
      audioUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/podcast/A+CALL+FROM+THE+EARTH+OPPORTUNITIES.m4a",
      imageUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/Thumbnail/podcast/A%20CALL%20FROM%20THE%20EARTH%20OPPORTUNITIES.jpg",
      publishDate: new Date("2026-03-01"),
      duration: "45:30",
      status: "published",
      tags: [tagMap.sustainability],
    },
    {
      title: "Artificial Intelligence: A Great Enabler Towards Sustainable Development",
      description: "How AI enables sustainable development.",
      audioUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/podcast/ARTIFICIAL+INTELLIGENCE+IS+A+GREAT+ENABLER+TOWARDS+SUSTAINABLE+DEVELOPMENT.m4a",
      imageUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/Thumbnail/podcast/ARTIFICIAL%20INTELLIGENCE%20IS%20A%20GREAT%20ENABLER%20TOWARDS%20SUSTAINABLE%20DEVELOPMENT.jpg",
      publishDate: new Date("2026-03-02"),
      duration: "52:15",
      status: "published",
      tags: [tagMap.technology],
    },
    {
      title: "Digital Disruption: Case Studies & Cyber Hygiene",
      description: "Case studies on digital disruption and cyber hygiene.",
      audioUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/podcast/DIGITAL+DISRUPTION+CASE+STUDIES+%26+CYBER+HYGIENE.m4a",
      imageUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/Thumbnail/podcast/DIGITAL%20DISRUPTION%20CASE%20STUDIES%20%26%20CYBER%20HYGIENE.webp",
      publishDate: new Date("2026-03-03"),
      duration: "48:20",
      status: "published",
      tags: [tagMap.technology],
    },
    {
      title: "Examples to Understand Market Dynamics",
      description: "Examples that explain market dynamics for sustainable growth.",
      audioUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/podcast/EXAMPLES+TO+UNDERSTAND+MARKET+DYNAMICS.m4a",
      imageUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/Thumbnail/podcast/EXAMPLES%20TO%20UNDERSTAND%20MARKET%20DYNAMICS.jpg",
      publishDate: new Date("2026-03-04"),
      duration: "41:45",
      status: "published",
      tags: [tagMap.economy],
    },
    {
      title: "Finance is Not Just Profit: It is Responsibility",
      description: "Finance reimagined as responsibility as well as profit.",
      audioUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/podcast/FINANCE+IS+NOT+JUST+PROFIT.+IT+IS+RESPONSIBILITY.m4a",
      imageUrl: "https://greentv-s3.s3.ap-south-1.amazonaws.com/Thumbnail/podcast/FINANCE%20IS%20NOT%20JUST%20PROFIT.%20IT%20IS%20RESPONSIBILITY.jpg",
      publishDate: new Date("2026-03-05"),
      duration: "39:30",
      status: "published",
      tags: [tagMap.economy],
    },
  ]);

  await Article.deleteMany({});
  await Article.insertMany([
    {
      title: "The Digital Ecosystem as the New Driver of Sustainable Economic Growth",
      subtitle: "From economic fixes to structural transformation",
      bodyMd:
        "Full article hosted in S3: https://greentv-s3.s3.ap-south-1.amazonaws.com/articels/The+Digital+Ecosystem+as+the+New+Driver+of+Sustainable+Economic+Growth.docx",
      readTime: "8 min",
      coverImage: "https://greentv-s3.s3.ap-south-1.amazonaws.com/Thumbnail/articels/The+Digital+Ecosystem+as+the+New+Driver+of+Sustainable+Economic+Growth.png",
      publishDate: new Date("2026-01-15"),
      status: "published",
      featured: true,
      tags: [tagMap.economy, tagMap.technology],
    },
    {
      title: "AI and Sustainability: Practical Playbook",
      subtitle: "Field notes for engineering leaders",
      bodyMd: "A concise guide to deploying AI responsibly across infrastructure and supply chains.",
      readTime: "6 min",
      coverImage: "/assets/images/AI & Sustainability.jpeg",
      publishDate: new Date("2026-01-10"),
      status: "published",
      featured: false,
      tags: [tagMap.technology, tagMap.sustainability],
    },
  ]);

  await CaseStory.deleteMany({});
  await CaseStory.insertMany([
    {
      title: "Transforming Urban Waste Management",
      impact: "Reduced landfill waste by 85% and created 200+ green jobs",
      duration: "18 months",
      heroImage: "/assets/images/seetharaman/Seetharaman1.jpg",
      metrics: [
        { label: "CO2 Reduced", value: "50K tons" },
        { label: "Recycling Rate", value: "85%" },
      ],
      bodyMd: "Implemented comprehensive waste reduction across metros, hitting zero-waste certification for 15 facilities.",
      tags: [tagMap.sustainability],
    },
    {
      title: "AI-Powered Environmental Monitoring",
      impact: "Real-time monitoring of 1000+ environmental data points",
      duration: "12 months",
      heroImage: "/assets/images/seetharaman/Seetharaman2.jpg",
      metrics: [
        { label: "Accuracy", value: "97%" },
        { label: "Alerts", value: "24/7" },
      ],
      bodyMd: "Built ML platform to monitor and predict environmental impact across industrial ops.",
      tags: [tagMap.technology],
    },
  ]);

  await AboutBlock.deleteMany({});
  await AboutBlock.insertMany([
    { kind: "gallery", title: "Dr. Seetharaman - Leadership Excellence", mediaUrl: "/assets/images/seetharaman/Seetharaman1.jpg", order: 1 },
    { kind: "gallery", title: "Dr. Seetharaman - Leadership Excellence", mediaUrl: "/assets/images/seetharaman/Seetharaman2.jpg", order: 2 },
    { kind: "gallery", title: "Dr. Seetharaman - Leadership Excellence", mediaUrl: "/assets/images/seetharaman/Seetharaman3.jpg", order: 3 },
    { kind: "theme", title: "Conscious Living", body: "Cruelty-free practices and mindful choices", order: 10 },
    { kind: "theme", title: "Ethical Governance", body: "Responsible leadership frameworks", order: 11 },
    { kind: "theme", title: "Financial Clarity", body: "Sustainable economic decision-making", order: 12 },
    { kind: "cta", title: "Join the community", body: "Empowering sustainability through conscious leadership.", order: 20 },
  ]);

  console.log("Seed complete. Test users (password =", defaultPassword, "):");
  testUsers.forEach((u) => console.log(`- ${u.role}: ${u.email}`));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

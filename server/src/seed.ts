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

  const categoryNames = ["sustainability", "technology", "economy", "leadership", "ethics", "innovation"];
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
      title: "Sustainable Development Goals: A Strategic Framework",
      description: "Exploring sustainable development goals as a strategic framework for global stability.",
      streamUrl: "https://example.com/videos/sdg.m3u8",
      thumbnailUrl: "/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (5).jpg",
      publishDate: new Date("2026-01-20"),
      status: "published",
      isLive: false,
      tags: [tagMap.sustainability],
    },
    {
      title: "AI for Sustainable Infrastructure",
      description: "How AI is transforming environmental monitoring and infrastructure.",
      streamUrl: "https://example.com/videos/ai-infra.m3u8",
      thumbnailUrl: "/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (6).jpg",
      publishDate: new Date("2026-01-12"),
      status: "published",
      isLive: false,
      tags: [tagMap.technology],
    },
    {
      title: "Responsible Finance 101",
      description: "Principles for sustainable economic growth.",
      streamUrl: "https://example.com/videos/finance.m3u8",
      thumbnailUrl: "/assets/livetv/Green Yellow and Black Modern Business Podcast YouTube Thumbnail (10).jpg",
      publishDate: new Date("2026-01-05"),
      status: "published",
      isLive: false,
      tags: [tagMap.economy],
    },
  ]);

  await Podcast.deleteMany({});
  await Podcast.insertMany([
    {
      title: "Welcome to the Sustainable Engineering Podcast",
      description: "Introduction to the channel and what listeners can expect.",
      audioUrl: "https://example.com/audio/episode1.mp3",
      imageUrl: "https://example.com/images/episode1.jpg",
      publishDate: new Date("2026-01-01"),
      duration: "12:34",
      status: "published",
      tags: [tagMap.sustainability],
    },
    {
      title: "Artificial Intelligence as a Sustainability Enabler",
      description: "AI use-cases driving sustainable development.",
      audioUrl: "https://example.com/audio/episode2.mp3",
      imageUrl: "https://example.com/images/episode2.jpg",
      publishDate: new Date("2026-01-12"),
      duration: "52:15",
      status: "published",
      tags: [tagMap.technology],
    },
  ]);

  await Article.deleteMany({});
  await Article.insertMany([
    {
      title: "Digital Ecosystems as Drivers of Sustainable Growth",
      subtitle: "From economic fixes to structural transformation",
      bodyMd:
        "In an era marked by economic uncertainty and environmental stress, digital ecosystems are redefining sustainability, resilience, and long-term momentum...",
      readTime: "8 min",
      coverImage: "/assets/images/digital ecosystem as a new driver of sustainable economic growth .png",
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

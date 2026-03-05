import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const achievements = [
    {
      key: "first_light",
      name: "First Light",
      description: "Complete your first study session",
      icon: "🌅",
    },
    {
      key: "centurion",
      name: "Centurion",
      description: "Reach 100 total study hours",
      icon: "⚔️",
    },
    {
      key: "dawn_patrol",
      name: "Dawn Patrol",
      description: "Complete 10 sessions before 9am",
      icon: "🌄",
    },
    {
      key: "night_owl",
      name: "Night Owl",
      description: "Complete 10 sessions after 10pm",
      icon: "🦉",
    },
    {
      key: "marathon",
      name: "Marathon",
      description: "Study for 5 continuous hours",
      icon: "🏃",
    },
    {
      key: "week_streak",
      name: "7-Day Streak",
      description: "Study 7 days in a row",
      icon: "🔥",
    },
    {
      key: "month_streak",
      name: "30-Day Streak",
      description: "Study 30 days in a row",
      icon: "💎",
    },
    {
      key: "consistency",
      name: "Consistency",
      description: "Study 365 days in a row",
      icon: "👑",
    },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      update: {},
      create: a,
    });
  }
  console.log(`✅ Seeded ${achievements.length} achievements`);

  const hash = await bcrypt.hash("password123", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@studysync.app" },
    update: {},
    create: {
      username: "demo_user",
      email: "demo@studysync.app",
      password: hash,
      bio: "This is the demo account",
      level: 5,
      totalStudySeconds: 360000,
      currentStreak: 7,
      longestStreak: 14,
    },
  });
  console.log(`✅ Demo user: ${demo.email} / password123`);

  const existing = await prisma.studyRoom.findFirst({
    where: { name: "CS Finals Grind" },
  });
  if (!existing) {
    const room = await prisma.studyRoom.create({
      data: {
        name: "CS Finals Grind",
        description: "Studying for CS exams together",
        tags: ["coding", "exams", "cs"],
        inviteCode: "DEMO2024",
        createdById: demo.id,
        members: { create: { userId: demo.id, role: "OWNER" } },
      },
    });
    console.log(`✅ Demo room: "${room.name}"`);
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

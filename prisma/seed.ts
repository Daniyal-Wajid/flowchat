import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@flowchat.app" },
    update: {},
    create: {
      email: "admin@flowchat.app",
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
      businessId: null,
    },
  });

  const demoPassword = await bcrypt.hash("demo1234", 12);

  const demoBusiness = await prisma.business.upsert({
    where: { slug: "demo-salon" },
    update: {},
    create: {
      name: "Demo Salon",
      slug: "demo-salon",
      phone: "+10000000001",
      timezone: "America/New_York",
      status: "TRIAL",
      billingStatus: "TRIAL",
      planTier: "BASIC",
      subscription: {
        create: {
          planTier: "BASIC",
          billingStatus: "TRIAL",
        },
      },
      users: {
        create: {
          email: "owner@demo.com",
          name: "Demo Owner",
          passwordHash: demoPassword,
          role: "OWNER",
        },
      },
      customers: {
        create: [
          { name: "Alice Johnson", phone: "+15551234567", email: "alice@example.com" },
          { name: "Bob Smith", phone: "+15559876543" },
        ],
      },
    },
    include: { customers: true, users: true },
  });

  const customer = demoBusiness.customers[0];
  if (customer) {
    const existing = await prisma.appointment.findFirst({
      where: { businessId: demoBusiness.id, customerId: customer.id },
    });
    if (!existing) {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 1);
      scheduledAt.setHours(10, 0, 0, 0);

      await prisma.appointment.create({
        data: {
          businessId: demoBusiness.id,
          customerId: customer.id,
          title: "Haircut",
          scheduledAt,
          status: "SCHEDULED",
        },
      });
    }
  }

  console.log("Seed complete:");
  console.log("  Super admin: admin@flowchat.app / admin123");
  console.log("  Demo owner:  owner@demo.com / demo1234");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

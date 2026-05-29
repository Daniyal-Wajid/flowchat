import bcrypt from "bcryptjs";
import { addDays } from "date-fns";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { z } from "zod";
import type { signupSchema } from "@/lib/validations/auth";

type SignupInput = z.infer<typeof signupSchema>;

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let attempt = 0;
  while (true) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
    const existing = await prisma.business.findUnique({
      where: { slug: candidate },
    });
    if (!existing) return candidate;
    attempt++;
  }
}

export const signupService = {
  async register(input: SignupInput) {
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("EMAIL_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const slug = await uniqueSlug(input.businessName);
    const trialEndsAt = addDays(new Date(), 14);

    const business = await prisma.business.create({
      data: {
        name: input.businessName,
        slug,
        status: "TRIAL",
        billingStatus: "TRIAL",
        planTier: "BASIC",
        trialEndsAt,
        subscription: {
          create: {
            planTier: "BASIC",
            billingStatus: "TRIAL",
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEndsAt,
          },
        },
        users: {
          create: {
            email,
            name: input.name,
            passwordHash,
            role: "OWNER",
          },
        },
      },
      include: { users: true },
    });

    return business.users[0];
  },
};

import { prisma } from "@/lib/db";
import type { BusinessUpdateInput } from "@/lib/validations/business";

export const businessService = {
  async getById(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { subscription: true },
    });
    if (!business) throw new Error("NOT_FOUND");
    return business;
  },

  async update(businessId: string, input: BusinessUpdateInput) {
    await this.getById(businessId);
    return prisma.business.update({
      where: { id: businessId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      },
      include: { subscription: true },
    });
  },
};

import { prisma } from "@/lib/db";
import type { CustomerInput } from "@/lib/validations/customer";
import { subscriptionService } from "./subscription-service";

export const customerService = {
  async list(businessId: string, search?: string) {
    return prisma.customer.findMany({
      where: {
        businessId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { appointments: true } },
      },
    });
  },

  async getById(businessId: string, id: string) {
    const customer = await prisma.customer.findFirst({
      where: { id, businessId },
      include: {
        appointments: { orderBy: { scheduledAt: "desc" }, take: 10 },
        _count: { select: { appointments: true, messageLogs: true } },
      },
    });
    if (!customer) throw new Error("NOT_FOUND");
    return customer;
  },

  async create(businessId: string, input: CustomerInput) {
    await subscriptionService.assertCanAddCustomer(businessId);
    return prisma.customer.create({
      data: {
        businessId,
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        notes: input.notes || null,
      },
    });
  },

  async update(businessId: string, id: string, input: CustomerInput) {
    await this.getById(businessId, id);
    return prisma.customer.update({
      where: { id },
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        notes: input.notes || null,
      },
    });
  },

  async delete(businessId: string, id: string) {
    await this.getById(businessId, id);
    return prisma.customer.delete({ where: { id } });
  },
};

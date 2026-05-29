import { prisma } from "@/lib/db";
import type { AppointmentInput } from "@/lib/validations/appointment";
import { subscriptionService } from "./subscription-service";
import { whatsAppService } from "@/lib/messaging/service";

export const appointmentService = {
  async list(businessId: string, params?: { from?: Date; to?: Date; status?: string }) {
    return prisma.appointment.findMany({
      where: {
        businessId,
        ...(params?.status ? { status: params.status as never } : {}),
        ...(params?.from || params?.to
          ? {
              scheduledAt: {
                ...(params.from ? { gte: params.from } : {}),
                ...(params.to ? { lte: params.to } : {}),
              },
            }
          : {}),
      },
      include: { customer: true },
      orderBy: { scheduledAt: "asc" },
    });
  },

  async getById(businessId: string, id: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id, businessId },
      include: { customer: true },
    });
    if (!appointment) throw new Error("NOT_FOUND");
    return appointment;
  },

  async create(businessId: string, input: AppointmentInput) {
    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, businessId },
    });
    if (!customer) throw new Error("NOT_FOUND");

    const appointment = await prisma.appointment.create({
      data: {
        businessId,
        customerId: input.customerId,
        title: input.title ?? "Appointment",
        scheduledAt: new Date(input.scheduledAt),
        notes: input.notes,
        status: input.status ?? "SCHEDULED",
      },
      include: { customer: true },
    });

    await subscriptionService.incrementAppointmentCount(businessId);

    if (input.sendConfirmation) {
      await whatsAppService.sendConfirmation(appointment.id, businessId);
    }

    return appointment;
  },

  async update(
    businessId: string,
    id: string,
    input: Partial<AppointmentInput>
  ) {
    await this.getById(businessId, id);
    return prisma.appointment.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.scheduledAt !== undefined
          ? { scheduledAt: new Date(input.scheduledAt) }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
      },
      include: { customer: true },
    });
  },

  async delete(businessId: string, id: string) {
    await this.getById(businessId, id);
    return prisma.appointment.delete({ where: { id } });
  },
};

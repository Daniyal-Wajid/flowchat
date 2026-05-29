import { prisma } from "@/lib/db";
import { getMessagingProvider } from "./index";
import {
  confirmationMessage,
  reminderMessage,
  updateMessage,
} from "./templates";
import { subscriptionService } from "@/server/services/subscription-service";

export class WhatsAppService {
  private provider = getMessagingProvider();

  async sendConfirmation(appointmentId: string, businessId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, businessId },
      include: { customer: true, business: true },
    });
    if (!appointment) throw new Error("NOT_FOUND");

    await subscriptionService.assertCanSendMessage(businessId);

    const body = confirmationMessage({
      businessName: appointment.business.name,
      customerName: appointment.customer.name,
      title: appointment.title,
      scheduledAt: appointment.scheduledAt,
    });

    const result = await this.provider.send({
      businessId,
      toPhone: appointment.customer.phone,
      body,
      type: "CONFIRMATION",
      customerId: appointment.customerId,
      appointmentId: appointment.id,
    });

    if (result.success) {
      await subscriptionService.incrementMessageCount(businessId);
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { confirmedAt: new Date(), status: "CONFIRMED" },
      });
    }

    return result;
  }

  async sendReminder(appointmentId: string, businessId: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, businessId },
      include: { customer: true, business: true },
    });
    if (!appointment) throw new Error("NOT_FOUND");

    await subscriptionService.assertCanSendMessage(businessId);

    const body = reminderMessage({
      businessName: appointment.business.name,
      customerName: appointment.customer.name,
      title: appointment.title,
      scheduledAt: appointment.scheduledAt,
    });

    const result = await this.provider.send({
      businessId,
      toPhone: appointment.customer.phone,
      body,
      type: "REMINDER",
      customerId: appointment.customerId,
      appointmentId: appointment.id,
    });

    if (result.success) {
      await subscriptionService.incrementMessageCount(businessId);
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { reminderSentAt: new Date() },
      });
    }

    return result;
  }

  async sendManual(params: {
    businessId: string;
    customerId: string;
    message: string;
  }) {
    const customer = await prisma.customer.findFirst({
      where: { id: params.customerId, businessId: params.businessId },
      include: { business: true },
    });
    if (!customer) throw new Error("NOT_FOUND");

    await subscriptionService.assertCanSendMessage(params.businessId);

    const body = updateMessage({
      businessName: customer.business.name,
      customerName: customer.name,
      message: params.message,
    });

    const result = await this.provider.send({
      businessId: params.businessId,
      toPhone: customer.phone,
      body,
      type: "MANUAL",
      customerId: customer.id,
    });

    if (result.success) {
      await subscriptionService.incrementMessageCount(params.businessId);
    }

    return result;
  }
}

export const whatsAppService = new WhatsAppService();

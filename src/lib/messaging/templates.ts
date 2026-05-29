import { format } from "date-fns";

export function confirmationMessage(params: {
  businessName: string;
  customerName: string;
  title: string;
  scheduledAt: Date;
}): string {
  const when = format(params.scheduledAt, "EEE, MMM d yyyy 'at' h:mm a");
  return `Hi ${params.customerName}! ${params.businessName} confirms your ${params.title} on ${when}. Reply if you need to reschedule.`;
}

export function reminderMessage(params: {
  businessName: string;
  customerName: string;
  title: string;
  scheduledAt: Date;
}): string {
  const when = format(params.scheduledAt, "EEE, MMM d 'at' h:mm a");
  return `Reminder from ${params.businessName}: your ${params.title} is tomorrow at ${when}. See you soon, ${params.customerName}!`;
}

export function updateMessage(params: {
  businessName: string;
  customerName: string;
  message: string;
}): string {
  return `Hi ${params.customerName}, update from ${params.businessName}: ${params.message}`;
}

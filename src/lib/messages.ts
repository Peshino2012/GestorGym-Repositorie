import { formatCurrency, formatDate } from "@/lib/format";

export function paymentReminderMessage(memberName: string, amount: number, dueDate: Date) {
  const firstName = memberName.split(" ")[0];
  return `Hola ${firstName} 👋 Te recordamos que tu cuota de ${formatCurrency(
    amount
  )} vence el ${formatDate(dueDate)}. Cualquier duda, respondé este mensaje. — PULSO Gym`;
}

export function retentionAlertMessage(memberName: string) {
  const firstName = memberName.split(" ")[0];
  return `Hola ${firstName} 💪 Te extrañamos en PULSO. ¿Todo bien? Si necesitás cambiar de horario o tenés alguna traba para volver, contanos y te ayudamos.`;
}

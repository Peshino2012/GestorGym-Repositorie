import { formatCurrency, formatDate } from "@/lib/format";

// gymName always comes from that gym's own GymSettings.name — never a
// fixed brand — since each deploy is a different client gym and these
// messages go out signed with whichever business the socio actually
// belongs to.
export function paymentReminderMessage(
  memberName: string,
  amount: number,
  dueDate: Date,
  gymName: string
) {
  const firstName = memberName.split(" ")[0];
  return `Hola ${firstName} 👋 Te recordamos que tu cuota de ${formatCurrency(
    amount
  )} vence el ${formatDate(dueDate)}. Cualquier duda, respondé este mensaje. — ${gymName}`;
}

export function retentionAlertMessage(memberName: string, gymName: string) {
  const firstName = memberName.split(" ")[0];
  return `Hola ${firstName} 💪 Te extrañamos en ${gymName}. ¿Todo bien? Si necesitás cambiar de horario o tenés alguna traba para volver, contanos y te ayudamos.`;
}

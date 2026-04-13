export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const amount = Number(digits) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, "");

  if (!digits) {
    return 0;
  }

  return Number(digits) / 100;
}

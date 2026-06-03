export function formatPrice(cents: number): string {
  return `TSH ${(cents / 100).toFixed(2)}`;
}

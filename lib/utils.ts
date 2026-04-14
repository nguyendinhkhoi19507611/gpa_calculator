export function round2(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '—';
  return (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);
}

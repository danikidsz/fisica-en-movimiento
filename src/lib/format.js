// Números con coma decimal (Colombia).
const cache = new Map();

export function formatNumber(value, decimals = 1) {
  if (!Number.isFinite(value)) return '—';
  if (!cache.has(decimals)) {
    cache.set(
      decimals,
      new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    );
  }
  return cache.get(decimals).format(value);
}

export const fmt = formatNumber;

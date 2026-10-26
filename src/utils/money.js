export function formatDzd(value) {
  var amount = Number(value);
  if (!Number.isFinite(amount)) amount = 0;
  return amount.toFixed(2) + ' DZD';
}

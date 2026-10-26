export function getAssignedPhones(store) {
  if (!store) return [];
  return [store.phone, store.phone2]
    .map(function (value) { return String(value || '').trim(); })
    .filter(function (value) { return value.length > 0; });
}

export function getWhatsappNumber(store) {
  if (!store) return '';
  return String(store.whatsapp || '').trim();
}

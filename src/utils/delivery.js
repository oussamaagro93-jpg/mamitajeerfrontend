// Mirrors the backend's order-level delivery rule: compare only the selected
// delivery type when it is offered, then choose the highest delivery price.
// The company id is the deterministic tie-breaker.
export function pickBestDeliveryOption(options, preferredType) {
  var candidates = [];
  var exactTypeCandidates = [];

  (options || []).forEach(function (option) {
    var methods = option.methods || [];
    var exact = methods.find(function (entry) { return entry.type === preferredType; });
    if (exact) exactTypeCandidates.push({ option: option, method: exact });

    var method = exact
      || methods.find(function (entry) { return entry.type === 'home_delivery'; })
      || methods[0];

    if (method) {
      candidates.push({ option: option, method: method });
    }
  });

  if (exactTypeCandidates.length > 0) candidates = exactTypeCandidates;
  if (candidates.length === 0) return null;

  candidates.sort(function (a, b) {
    return (Number(b.method.price) || 0) - (Number(a.method.price) || 0)
      || (Number(a.option.deliveryCompanyId) || 0) - (Number(b.option.deliveryCompanyId) || 0);
  });

  return candidates[0];
}

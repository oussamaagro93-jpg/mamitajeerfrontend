// Pure helpers for the storefront shopping cart. Keeping the cart logic here
// makes it reusable by the context, the cart page and the checkout page, and
// lets us unit-test quantity/store validation without a browser.

export var CART_STORAGE_KEY = 'tajer.storefront.cart.v1';
export var MAX_CART_LINES = 50;

export function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function toPositiveInt(value, fallback) {
  var parsed = parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return parsed;
}

export function normalizeStock(value) {
  if (value === undefined || value === null || value === '') return null;
  var parsed = parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

export function getProductImage(product) {
  if (!product) return null;
  if (product.image) return product.image;
  if (product.images && product.images.length > 0) {
    var primary = product.images.find(function (image) { return image.isPrimary; });
    return (primary || product.images[0]).url || null;
  }
  return null;
}

export function buildCartItem(product, quantity) {
  var stock = normalizeStock(product.quantity);
  var requested = toPositiveInt(quantity, 1);
  if (stock !== null && requested > stock) requested = stock;

  return {
    productId: parseInt(product.id, 10),
    slug: product.slug || '',
    name: product.name || '',
    price: roundMoney(product.price),
    comparePrice: product.comparePrice !== undefined && product.comparePrice !== null
      ? roundMoney(product.comparePrice)
      : null,
    image: getProductImage(product),
    quantity: Math.max(0, requested),
    stock: stock,
    categoryId: product.categoryId || (product.category && product.category.id) || null,
    categoryName: (product.category && product.category.name) || null,
    adminId: product.adminId ? parseInt(product.adminId, 10) : null,
    deliveryCompanyId: product.deliveryCompanyId ? parseInt(product.deliveryCompanyId, 10) : null,
    couponCode: (product.coupon && product.coupon.code) || null,
    available: stock === null || stock > 0,
  };
}

export function sanitizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(function (item) { return item && Number.isInteger(parseInt(item.productId, 10)); })
    .map(function (item) {
      var quantity = toPositiveInt(item.quantity, 1);
      var stock = normalizeStock(item.stock);
      if (stock !== null && quantity > stock) quantity = stock;
      return {
        productId: parseInt(item.productId, 10),
        slug: item.slug || '',
        name: item.name || '',
        price: roundMoney(item.price),
        comparePrice: item.comparePrice !== undefined && item.comparePrice !== null
          ? roundMoney(item.comparePrice)
          : null,
        image: item.image || null,
        quantity: quantity,
        stock: stock,
        categoryId: item.categoryId || null,
        categoryName: item.categoryName || null,
        adminId: item.adminId ? parseInt(item.adminId, 10) : null,
        deliveryCompanyId: item.deliveryCompanyId ? parseInt(item.deliveryCompanyId, 10) : null,
        couponCode: item.couponCode || null,
        available: item.available !== false && quantity > 0 && (stock === null || stock > 0),
      };
    })
    .filter(function (item) { return item.quantity > 0; });
}

function cloneItems(items) {
  return (items || []).map(function (item) { return { ...item }; });
}

export function addItemToCart(items, product, quantity) {
  var current = cloneItems(items);
  var requested = toPositiveInt(quantity, 1);
  var stock = normalizeStock(product.quantity);

  if (stock !== null && stock <= 0) {
    return { items: current, error: 'outOfStock' };
  }

  var productAdminId = product.adminId || null;
  var otherStore = current.find(function (item) {
    return item.adminId && productAdminId && item.adminId !== productAdminId;
  });
  if (otherStore) {
    return { items: current, error: 'differentStore' };
  }

  var index = current.findIndex(function (item) {
    return parseInt(item.productId, 10) === parseInt(product.id, 10);
  });

  if (index === -1 && current.length >= MAX_CART_LINES) {
    return { items: current, error: 'cartFull' };
  }

  var error = null;
  var item = buildCartItem(product, requested);
  if (index === -1) {
    current.push(item);
  } else {
    var nextQuantity = toPositiveInt(current[index].quantity, 1) + requested;
    if (stock !== null && nextQuantity > stock) {
      nextQuantity = stock;
      error = 'maxStock';
    }
    current[index] = {
      ...current[index],
      ...item,
      quantity: nextQuantity,
      available: nextQuantity > 0,
    };
  }

  return {
    items: current,
    error: error,
    item: current[index === -1 ? current.length - 1 : index],
  };
}

export function updateItemQuantity(items, productId, quantity) {
  var current = cloneItems(items);
  var index = current.findIndex(function (item) {
    return parseInt(item.productId, 10) === parseInt(productId, 10);
  });
  if (index === -1) return { items: current, error: null };

  var stock = normalizeStock(current[index].stock);
  if (stock !== null && stock <= 0) {
    return { items: current, error: 'outOfStock' };
  }

  var nextQuantity = parseInt(quantity, 10);
  if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
    return { items: current, error: 'invalidQuantity' };
  }

  var error = null;
  if (stock !== null && nextQuantity > stock) {
    nextQuantity = stock;
    error = 'maxStock';
  }

  current[index] = {
    ...current[index],
    quantity: nextQuantity,
    available: nextQuantity > 0,
  };
  return { items: current, error: error };
}

export function removeItemFromCart(items, productId) {
  return (items || []).filter(function (item) {
    return parseInt(item.productId, 10) !== parseInt(productId, 10);
  }).map(function (item) { return { ...item }; });
}

export function cartItemCount(items) {
  return (items || []).reduce(function (sum, item) {
    return sum + (toPositiveInt(item.quantity, 0) || 0);
  }, 0);
}

export function cartSubtotal(items) {
  return roundMoney((items || []).reduce(function (sum, item) {
    if (item.available === false) return sum;
    return sum + roundMoney(item.price) * toPositiveInt(item.quantity, 0);
  }, 0));
}

export function cartHasUnavailableItems(items) {
  return (items || []).some(function (item) { return item.available === false; });
}

export function cartCheckoutItems(items) {
  return (items || []).filter(function (item) {
    return item.available !== false && toPositiveInt(item.quantity, 0) > 0;
  });
}

export function loadCart(storage) {
  if (!storage) return [];
  try {
    var raw = storage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return sanitizeCartItems(JSON.parse(raw));
  } catch (error) {
    return [];
  }
}

export function saveCart(storage, items) {
  if (!storage) return;
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(items || []));
  } catch (error) {
    // Storage may be unavailable (private mode / quota). The in-memory cart
    // still works for the current session.
  }
}

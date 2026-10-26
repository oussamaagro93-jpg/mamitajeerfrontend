import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import AddToCartButton from './AddToCartButton';
import { getProductImage } from '../../utils/cart';

class ProductTile extends React.Component {
  render() {
    const { product, t, showCategory } = this.props;
    if (!product) return null;

    const image = getProductImage(product);
    const stock = parseInt(product.quantity, 10);
    const soldOut = Number.isInteger(stock) && stock <= 0;
    const price = parseFloat(product.price) || 0;
    const comparePrice = product.comparePrice ? parseFloat(product.comparePrice) : null;
    const categoryName = (product.category && product.category.name) || product.categoryName || null;

    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-purple-100/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <Link
          to={'/products/' + product.slug}
          className="relative block aspect-square overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50"
        >
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingBagIcon className="h-16 w-16 text-purple-200" />
            </div>
          )}

          {soldOut && (
            <span className="absolute left-3 top-3 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {t('cart.outOfStock')}
            </span>
          )}

          {!soldOut && Number.isInteger(stock) && stock > 0 && stock <= 5 && (
            <span className="absolute left-3 top-3 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
              {t('cart.onlyXLeft', { count: stock })}
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
          {showCategory && categoryName && (
            <span className="w-fit rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-purple-700 ring-1 ring-purple-100">
              {categoryName}
            </span>
          )}

          <Link
            to={'/products/' + product.slug}
            className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-gray-900 transition-colors hover:text-purple-700 sm:text-base"
          >
            {product.name}
          </Link>

          <div className="mt-auto flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-purple-700 sm:text-lg">
                {price.toFixed(2)} DA
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-xs text-gray-400 line-through">
                  {comparePrice.toFixed(2)} DA
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={'/products/' + product.slug}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-purple-100 bg-white px-3 py-2 text-xs font-bold text-purple-700 transition-all hover:border-purple-300 hover:bg-purple-50 active:scale-95"
            >
              {t('cart.view')}
            </Link>
            <div className="flex-1">
              <AddToCartButton product={product} full={false} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#5B21B6] to-[#6C3DF2] px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
          </div>
        </div>
      </article>
    );
  }
}

export default withTranslation()(ProductTile);

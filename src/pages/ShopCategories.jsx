import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { categoryAPI } from '../api';
import StorefrontHeader from '../components/storefront/StorefrontHeader';

class ShopCategories extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchCategories();
  }

  fetchCategories() {
    const self = this;
    this.setState({ loading: true, error: null });
    categoryAPI.getAll({ page: 1, limit: 100, isActive: true })
      .then(function (res) {
        const data = res.data.data || {};
        document.title = self.props.t('shop.categoriesTitle') + ' - ' + self.props.t('app.name');
        self.setState({ categories: data.categories || [], loading: false });
      })
      .catch(function () {
        self.setState({ loading: false, error: self.props.t('shop.loadError') });
      });
  }

  renderCategoryCard(category) {
    const t = this.props.t;
    const count = Number(category.productCount) || 0;
    return (
      <Link
        key={category.id}
        to={'/categories/' + category.id}
        className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-purple-100/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-50 via-white to-indigo-50">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-purple-500 shadow-sm ring-1 ring-purple-100">
                <Squares2X2Icon className="h-8 w-8" />
              </div>
            </div>
          )}
          <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-purple-700 shadow-sm backdrop-blur-sm">
            {t('shop.productsCount', { count: count })}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-purple-700 sm:text-lg">
              {category.name}
            </h3>
            {category.description && (
              <p className="mt-1 line-clamp-2 text-xs text-gray-500 sm:text-sm">
                {category.description}
              </p>
            )}
          </div>
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-700 transition-all group-hover:bg-[#6C3DF2] group-hover:text-white">
            {this.props.i18n && this.props.i18n.language === 'ar'
              ? <ChevronLeftIcon className="h-4 w-4" />
              : <ChevronRightIcon className="h-4 w-4" />}
          </span>
        </div>
      </Link>
    );
  }

  renderSkeleton() {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(function (key) {
          return (
            <div key={key} className="overflow-hidden rounded-3xl bg-white ring-1 ring-purple-100/80">
              <div className="aspect-[4/3] animate-pulse bg-purple-50/70" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-2/3 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-3 w-1/3 animate-pulse rounded-lg bg-gray-100" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const t = this.props.t;
    const { categories, loading, error } = this.state;
    const orderNumber = (this.props.match && this.props.match.params && this.props.match.params.orderNumber)
      || this.props.orderNumber;

    return (
      <div className="product-page-bg min-h-screen">
        <StorefrontHeader
          showMenu={false}
          onSearchToggle={function () {}}
          onLogoClick={function () { window.location.href = '/'; }}
        />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <section className="product-reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B21B6] via-[#6C3DF2] to-[#7C4DFF] px-5 py-8 text-white shadow-xl shadow-purple-900/20 sm:px-8 sm:py-10">
            <div className="relative z-10 max-w-2xl">
              {orderNumber && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20">
                  <CheckCircleIcon className="h-4 w-4" />
                  {t('shop.orderConfirmed')}
                </div>
              )}
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                {orderNumber ? t('shop.orderThanks') : t('shop.categoriesTitle')}
              </h1>
              <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">
                {orderNumber ? t('shop.orderThanksSubtitle') : t('shop.categoriesSubtitle')}
              </p>
              {orderNumber && (
                <p className="mt-4 inline-block rounded-xl bg-white/10 px-4 py-2 font-mono text-sm font-bold tracking-wide ring-1 ring-white/20">
                  {orderNumber}
                </p>
              )}
            </div>
            <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 right-24 h-44 w-44 rounded-full bg-pink-300/20 blur-2xl" />
          </section>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 sm:mt-8">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">
                {t('shop.browseCategories')}
              </h2>
              {!loading && categories.length > 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  {t('shop.categoriesAvailable', { count: categories.length })}
                </p>
              )}
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition-all hover:border-purple-300 hover:bg-purple-50"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              {t('shop.backToShop')}
            </Link>
          </div>

          <div className="mt-5">
            {loading && this.renderSkeleton()}

            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm font-medium text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={this.fetchCategories.bind(this)}
                  className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  {t('shop.retry')}
                </button>
              </div>
            )}

            {!loading && !error && categories.length === 0 && (
              <div className="rounded-3xl border border-dashed border-purple-200 bg-white/70 p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
                  <Squares2X2Icon className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{t('shop.noCategories')}</h3>
                <p className="mt-2 text-sm text-gray-500">{t('shop.noCategoriesHint')}</p>
                <Link
                  to="/"
                  className="mt-5 inline-flex rounded-xl bg-[#6C3DF2] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition-all hover:bg-[#5B21B6]"
                >
                  {t('shop.backToShop')}
                </Link>
              </div>
            )}

            {!loading && !error && categories.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
                {categories.map(function (category) {
                  return this.renderCategoryCard(category);
                }.bind(this))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
}

export default withTranslation()(ShopCategories);

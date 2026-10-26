import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { categoryAPI, productAPI } from '../api';
import StorefrontHeader from '../components/storefront/StorefrontHeader';
import ProductTile from '../components/storefront/ProductTile';

class ShopCategoryProducts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      category: null,
      products: [],
      loading: true,
      notFound: false,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.fetchData();
    }
  }

  fetchData() {
    const self = this;
    const categoryId = this.props.match.params.id;
    this.setState({ loading: true, error: null, notFound: false });

    Promise.all([
      categoryAPI.getById(categoryId),
      productAPI.getAll({
        categoryId: categoryId,
        status: 'published',
        limit: 500,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }),
    ]).then(function (responses) {
      const category = responses[0].data.data.category;
      const products = responses[1].data.data.products || [];
      if (category.isActive === false) {
        self.setState({ loading: false, notFound: true });
        return;
      }
      document.title = (category.name || self.props.t('shop.categoriesTitle')) + ' - ' + self.props.t('app.name');
      self.setState({ category: category, products: products, loading: false });
    }).catch(function (error) {
      const status = error && error.response && error.response.status;
      self.setState({ loading: false, notFound: status === 404, error: status === 404 ? null : self.props.t('shop.loadError') });
    });
  }

  renderSkeleton() {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(function (key) {
          return (
            <div key={key} className="overflow-hidden rounded-2xl bg-white ring-1 ring-purple-100/80">
              <div className="aspect-square animate-pulse bg-purple-50/70" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-gray-100" />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const t = this.props.t;
    const { category, products, loading, notFound, error } = this.state;

    if (!loading && notFound) {
      return (
        <div className="product-page-bg min-h-screen">
          <StorefrontHeader showMenu={false} onSearchToggle={function () {}} onLogoClick={function () { window.location.href = '/'; }} />
          <main className="mx-auto max-w-3xl px-4 py-16 text-center">
            <div className="product-surface p-10">
              <Squares2X2Icon className="mx-auto h-14 w-14 text-purple-300" />
              <h1 className="mt-4 text-2xl font-extrabold text-gray-900">{t('shop.categoryNotFound')}</h1>
              <p className="mt-2 text-sm text-gray-500">{t('shop.categoryNotFoundHint')}</p>
              <Link to="/categories" className="mt-6 inline-flex rounded-xl bg-[#6C3DF2] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-900/20">
                {t('shop.backToCategories')}
              </Link>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="product-page-bg min-h-screen">
        <StorefrontHeader showMenu={false} onSearchToggle={function () {}} onLogoClick={function () { window.location.href = '/'; }} />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link to="/categories" className="inline-flex items-center gap-1 font-semibold text-purple-700 transition-colors hover:text-purple-900">
              <ChevronLeftIcon className="h-4 w-4" />
              {t('shop.backToCategories')}
            </Link>
            {category && (
              <>
                <span className="text-gray-300">/</span>
                <span className="truncate font-medium text-gray-700">{category.name}</span>
              </>
            )}
          </nav>

          {loading ? (
            <div className="mb-6 overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-purple-100/80">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 animate-pulse rounded-2xl bg-purple-50" />
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-1/2 animate-pulse rounded-lg bg-gray-100" />
                  <div className="h-4 w-1/3 animate-pulse rounded-lg bg-gray-100" />
                </div>
              </div>
            </div>
          ) : category ? (
            <section className="product-reveal mb-6 flex flex-col gap-4 overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-purple-100/80 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-center gap-4">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover ring-1 ring-purple-100 sm:h-24 sm:w-24" />
                ) : (
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-500 ring-1 ring-purple-100 sm:h-24 sm:w-24">
                    <Squares2X2Icon className="h-10 w-10" />
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-gray-500">{category.description}</p>
                  )}
                  <p className="mt-2 text-sm font-semibold text-purple-700">
                    {t('shop.productsCount', { count: products.length })}
                  </p>
                </div>
              </div>
              <Link
                to="/categories"
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2 text-sm font-semibold text-purple-700 transition-all hover:border-purple-300 hover:bg-purple-50"
              >
                <Squares2X2Icon className="h-4 w-4" />
                {t('shop.allCategories')}
              </Link>
            </section>
          ) : null}

          {loading && this.renderSkeleton()}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-medium text-red-700">{error}</p>
              <button type="button" onClick={this.fetchData.bind(this)} className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                {t('shop.retry')}
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="rounded-3xl border border-dashed border-purple-200 bg-white/70 p-10 text-center">
              <Squares2X2Icon className="mx-auto h-14 w-14 text-purple-200" />
              <h2 className="mt-4 text-lg font-bold text-gray-900">{t('shop.noProducts')}</h2>
              <p className="mt-2 text-sm text-gray-500">{t('shop.noProductsHint')}</p>
              <Link to="/categories" className="mt-5 inline-flex rounded-xl bg-[#6C3DF2] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-900/20">
                {t('shop.backToCategories')}
              </Link>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
              {products.map(function (product) {
                return <ProductTile key={product.id} product={product} showCategory={false} />;
              })}
            </div>
          )}
        </main>
      </div>
    );
  }
}

export default withTranslation()(ShopCategoryProducts);

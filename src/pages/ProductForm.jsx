import React from 'react';
import { withTranslation } from 'react-i18next';
import { productAPI, categoryAPI, brandAPI, couponAPI } from '../api';
import { publicShippingAPI } from '../api/shipping';
import { notify } from '../components/common/Toast';
import { PhotoIcon, EyeIcon, ClipboardIcon, XMarkIcon, TrashIcon, StarIcon, ChevronUpIcon, ChevronDownIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import ProductPicker from '../components/admin/ProductPicker';

class ProductForm extends React.Component {
  constructor(props) {
    super(props);
    this.fileInputRef = React.createRef();
    this.state = {
      loading: false,
      saving: false,
      uploading: false,
      product: null,
      categories: [],
      brands: [],
      deliveryCompanies: [],
      coupons: [],
      form: {
        name: '', sku: '', price: '', comparePrice: '', costPrice: '',
        quantity: '', categoryId: '', brandId: '', deliveryCompanyId: '', couponId: '', description: '',
        shortDescription: '', status: 'draft', weight: '', vendor: '',
      },
      selectedFiles: [],
      imagePreviews: [],
      relatedIds: [],
      relatedProducts: [],
      pickerOpen: false,
    };
  }

  componentDidMount() {
    var id = this.props.match.params.id;
    var self = this;
    if (id) {
      productAPI.getById(id).then(function (res) {
        var p = res.data.data.product;
        self.setState({
          product: p,
          form: {
            name: p.name || '',
            sku: p.sku || '',
            price: p.price || '',
            comparePrice: p.comparePrice || '',
            costPrice: p.costPrice || '',
            quantity: p.quantity || '',
            categoryId: p.categoryId || '',
            brandId: p.brandId || '',
            deliveryCompanyId: p.deliveryCompanyId || '',
            couponId: p.couponId || '',
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            status: p.status || 'draft',
            weight: p.weight || '',
            vendor: p.vendor || '',
          },
        });
        if (p.relatedProducts && p.relatedProducts.length > 0) {
          self.setState({
            relatedIds: p.relatedProducts.map(function (rp) { return rp.id; }),
            relatedProducts: p.relatedProducts,
          });
        }
      }).catch(function () {});
    }
    categoryAPI.getAll({ limit: 100 }).then(function (res) {
      self.setState({ categories: res.data.data.categories || [] });
    }).catch(function () {});
    brandAPI.getAll({ limit: 100 }).then(function (res) {
      self.setState({ brands: res.data.data.brands || [] });
    }).catch(function () {});
    publicShippingAPI.getDeliveryCompanies().then(function (res) {
      self.setState({ deliveryCompanies: res.data.data.companies || [] });
    }).catch(function () {});
    couponAPI.getAll({ limit: 500 }).then(function (res) {
      self.setState({ coupons: res.data.data.coupons || [] });
    }).catch(function () {});
  }

  handleChange(field, value) {
    this.setState(function (prev) {
      return { form: Object.assign({}, prev.form, (function () { var o = {}; o[field] = value; return o; })()) };
    });
  }

  handleImagesSelect(e) {
    var files = Array.from(e.target.files);
    if (files.length === 0) return;
    var previews = files.map(function (f) { return URL.createObjectURL(f); });
    this.setState(function (prev) {
      return {
        selectedFiles: prev.selectedFiles.concat(files),
        imagePreviews: prev.imagePreviews.concat(previews),
      };
    });
    if (this.fileInputRef.current) {
      this.fileInputRef.current.value = '';
    }
  }

  handleRemoveSelectedFile(index) {
    var self = this;
    URL.revokeObjectURL(self.state.imagePreviews[index]);
    self.setState(function (prev) {
      var files = prev.selectedFiles.slice();
      var previews = prev.imagePreviews.slice();
      files.splice(index, 1);
      previews.splice(index, 1);
      return { selectedFiles: files, imagePreviews: previews };
    });
  }

  handleUploadImages() {
    var self = this;
    var id = self.state.product ? self.state.product.id : null;
    if (!id || self.state.selectedFiles.length === 0) return;

    self.setState({ uploading: true });
    var fd = new FormData();
    self.state.selectedFiles.forEach(function (f) {
      fd.append('images', f);
    });

    productAPI.uploadImages(id, fd).then(function (res) {
      self.setState(function (prev) {
        prev.imagePreviews.forEach(function (p) { try { URL.revokeObjectURL(p); } catch (e) {} });
        return {
          selectedFiles: [],
          imagePreviews: [],
          uploading: false,
        };
      });
      self.refreshProduct();
      notify(self.props.t('products.imageUploaded'));
    }).catch(function (err) {
      notify(err.response?.data?.message || self.props.t('common.error'), 'error');
      self.setState({ uploading: false });
    });
  }

  refreshProduct() {
    var self = this;
    var id = self.props.match.params.id;
    if (!id) return;
    productAPI.getById(id).then(function (res) {
      self.setState({ product: res.data.data.product });
    }).catch(function () {});
  }

  handleDeleteImage(imageId) {
    var self = this;
    var id = self.state.product.id;
    productAPI.deleteImage(id, imageId).then(function () {
      notify(self.props.t('products.imageDeleted'));
      self.refreshProduct();
    }).catch(function (err) {
      notify(err.response?.data?.message || self.props.t('common.error'), 'error');
    });
  }

  handleSetPrimary(imageId) {
    var self = this;
    var id = self.state.product.id;
    productAPI.updateImage(id, imageId, { isPrimary: true }).then(function () {
      notify(self.props.t('products.primaryImageSet'));
      self.refreshProduct();
    }).catch(function (err) {
      notify(err.response?.data?.message || self.props.t('common.error'), 'error');
    });
  }

  handleImageAltChange(imageId, alt) {
    var self = this;
    var id = self.state.product.id;
    productAPI.updateImage(id, imageId, { alt: alt }).then(function () {
      self.refreshProduct();
    }).catch(function () {});
  }

  handleMoveImage(imageId, direction) {
    var self = this;
    var images = self.state.product.images;
    var idx = images.findIndex(function (i) { return i.id === imageId; });
    if (idx === -1) return;
    var targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    var updatedImages = images.slice();
    var temp = updatedImages[idx];
    updatedImages[idx] = updatedImages[targetIdx];
    updatedImages[targetIdx] = temp;

    var self2 = self;
    updatedImages.forEach(function (img, i) {
      productAPI.updateImage(self2.state.product.id, img.id, { sortOrder: i }).catch(function () {});
    });

    self.refreshProduct();
  }

  handleOpenPicker() {
    this.setState({ pickerOpen: true });
  }

  handleRelatedConfirm(ids) {
    var self = this;
    var currentIds = self.state.relatedIds;

    var added = ids.filter(function (id) { return currentIds.indexOf(id) === -1; });
    var removed = currentIds.filter(function (id) { return ids.indexOf(id) === -1; });

    if (added.length === 0 && removed.length === 0) {
      self.setState({ pickerOpen: false });
      return;
    }

    if (added.length > 0) {
      productAPI.getAll({ limit: 50, status: 'published' }).then(function (res) {
        var allProducts = res.data.data.products || [];
        var addedProducts = allProducts.filter(function (p) { return added.indexOf(p.id) !== -1; });
        var remaining = self.state.relatedProducts.filter(function (rp) { return ids.indexOf(rp.id) !== -1; });
        self.setState({
          relatedIds: ids,
          relatedProducts: remaining.concat(addedProducts),
          pickerOpen: false,
        });
      }).catch(function () {
        self.setState({
          relatedIds: ids,
          pickerOpen: false,
        });
      });
    } else {
      var remaining = self.state.relatedProducts.filter(function (rp) { return ids.indexOf(rp.id) !== -1; });
      self.setState({
        relatedIds: ids,
        relatedProducts: remaining,
        pickerOpen: false,
      });
    }
  }

  handleRemoveRelated(id) {
    var self = this;
    self.setState(function (prev) {
      return {
        relatedIds: prev.relatedIds.filter(function (rid) { return rid !== id; }),
        relatedProducts: prev.relatedProducts.filter(function (rp) { return rp.id !== id; }),
      };
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    var self = this;
    self.setState({ saving: true });
    var id = self.props.match.params.id;
    var form = self.state.form;

    var relatedIds = self.state.relatedIds;

    var promise = id ? productAPI.update(id, form) : productAPI.create(form);
    promise.then(function (res) {
      var savedProduct = res.data.data.product;

      var saveRelatedPromise = (savedProduct && savedProduct.id && relatedIds.length > 0)
        ? productAPI.setRelated(savedProduct.id, relatedIds)
        : Promise.resolve();

      saveRelatedPromise.then(function () {
        notify(id ? self.props.t('products.updated') : self.props.t('products.created'));

        if (!id && savedProduct && savedProduct.id) {
          self.setState({ product: savedProduct });
          self.props.history.push('/admin/products/' + savedProduct.id + '/edit');
        } else {
          self.setState({ product: savedProduct });
          self.props.history.push('/admin/products');
        }
      });
    }).catch(function (err) {
      var msg = err.response?.data?.message || self.props.t('common.error');
      notify(msg, 'error');
      self.setState({ saving: false });
    });
  }

  render() {
    var self = this;
    var t = this.props.t;
    var isEdit = !!this.props.match.params.id;
    var form = this.state.form;
    var categories = this.state.categories;
    var brands = this.state.brands;
    var deliveryCompanies = this.state.deliveryCompanies;
    var coupons = this.state.coupons;
    var product = this.state.product;
    var images = (product && product.images) || [];
    var storefrontUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_STOREFRONT_URL) || window.location.origin;

    return React.createElement('div', { className: 'max-w-4xl mx-auto space-y-6' },
      React.createElement('div', { className: 'flex items-center justify-between' },
        React.createElement('div', null,
          React.createElement('h1', { className: 'text-2xl font-bold text-gray-900 dark:text-white' }, isEdit ? t('products.editProduct') : t('products.newProduct')),
          React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400 mt-1' }, isEdit ? t('products.editProductSubtitle') : t('products.addProductSubtitle'))
        )
      ),

      // Image upload section - multi-image gallery
      React.createElement('div', { className: 'card p-6 space-y-4' },
        React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 dark:text-white' }, t('products.images')),

        // Gallery of existing images
        images.length > 0 && React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' },
          images.map(function (img, idx) {
            return React.createElement('div', {
              key: img.id,
              className: 'relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700',
            },
              React.createElement('img', { src: img.url, alt: img.alt || '', className: 'w-full h-32 object-cover' }),
              img.isPrimary && React.createElement('span', { className: 'absolute top-1 left-1 inline-flex items-center px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-semibold rounded' },
                React.createElement(StarIcon, { className: 'w-3 h-3 mr-0.5' }),
                t('products.primary')
              ),
              React.createElement('div', { className: 'absolute inset-x-0 bottom-0 flex justify-center space-x-1 p-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' },
                !img.isPrimary && React.createElement('button', {
                  type: 'button',
                  onClick: function () { self.handleSetPrimary(img.id); },
                  className: 'w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white text-gray-700 hover:text-yellow-600',
                  title: t('products.setPrimary'),
                },
                  React.createElement(StarIcon, { className: 'w-4 h-4' })
                ),
                idx > 0 && React.createElement('button', {
                  type: 'button',
                  onClick: function () { self.handleMoveImage(img.id, -1); },
                  className: 'w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white text-gray-700',
                  title: t('products.moveUp'),
                },
                  React.createElement(ChevronUpIcon, { className: 'w-4 h-4' })
                ),
                idx < images.length - 1 && React.createElement('button', {
                  type: 'button',
                  onClick: function () { self.handleMoveImage(img.id, 1); },
                  className: 'w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white text-gray-700',
                  title: t('products.moveDown'),
                },
                  React.createElement(ChevronDownIcon, { className: 'w-4 h-4' })
                ),
                React.createElement('button', {
                  type: 'button',
                  onClick: function () { self.handleDeleteImage(img.id); },
                  className: 'w-7 h-7 bg-red-500/90 rounded-full flex items-center justify-center hover:bg-red-500 text-white',
                  title: t('products.deleteImage'),
                },
                  React.createElement(TrashIcon, { className: 'w-4 h-4' })
                )
              ),
              React.createElement('input', {
                type: 'text',
                defaultValue: img.alt || '',
                placeholder: t('products.imageAlt'),
                onBlur: function (e) { self.handleImageAltChange(img.id, e.target.value); },
                className: 'w-full px-2 py-1 text-xs border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none',
              })
            );
          }.bind(this))
        ),

        // Selected file previews (pending upload)
        this.state.imagePreviews.length > 0 && React.createElement('div', { className: 'space-y-2' },
          React.createElement('p', { className: 'text-sm font-medium text-gray-700 dark:text-gray-300' }, t('products.filesToUpload')),
          React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' },
            this.state.imagePreviews.map(function (preview, idx) {
              return React.createElement('div', { key: idx, className: 'relative rounded-lg overflow-hidden border border-dashed border-primary-400' },
                React.createElement('img', { src: preview, alt: '', className: 'w-full h-32 object-cover' }),
                React.createElement('button', {
                  type: 'button',
                  onClick: function () { self.handleRemoveSelectedFile(idx); },
                  className: 'absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600',
                },
                  React.createElement(XMarkIcon, { className: 'w-4 h-4' })
                )
              );
            })
          )
        ),

        // Upload controls
        React.createElement('div', { className: 'flex items-center space-x-3' },
          React.createElement('label', { className: 'cursor-pointer inline-flex items-center px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors' },
            React.createElement(PhotoIcon, { className: 'w-5 h-5 mr-2' }),
            React.createElement('span', null, t('products.chooseImages')),
            React.createElement('input', {
              ref: this.fileInputRef,
              type: 'file',
              multiple: true,
              accept: 'image/jpeg,image/jpg,image/png,image/webp,image/avif',
              onChange: this.handleImagesSelect.bind(this),
              className: 'hidden',
            })
          ),
          this.state.selectedFiles.length > 0 && isEdit && React.createElement('button', {
            type: 'button',
            onClick: this.handleUploadImages.bind(this),
            disabled: this.state.uploading,
            className: 'btn-primary text-sm',
          },
            this.state.uploading ? t('products.uploading') : t('products.uploadImages', { count: this.state.selectedFiles.length })
          ),
          this.state.selectedFiles.length > 0 && !isEdit && React.createElement('p', { className: 'text-xs text-gray-500' }, t('products.saveFirst')),
          React.createElement('p', { className: 'text-xs text-gray-500' }, t('products.imageInfo'))
        )
      ),

      // Related Products Section
      React.createElement('div', { className: 'card p-6 space-y-4' },
        React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 dark:text-white' }, t('products.relatedProducts')),

        this.state.relatedProducts.length > 0 && React.createElement('div', { className: 'flex flex-wrap gap-3' },
          this.state.relatedProducts.map(function (rp) {
            var img = rp.image || (rp.images && rp.images.length > 0 ? rp.images[0].url : null);
            return React.createElement('div', {
              key: rp.id,
              className: 'flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700',
            },
              React.createElement('div', { className: 'w-8 h-8 rounded bg-gray-200 dark:bg-gray-600 flex-shrink-0 overflow-hidden' },
                img
                  ? React.createElement('img', { src: img, alt: rp.name, className: 'w-full h-full object-cover' })
                  : React.createElement('div', { className: 'w-full h-full flex items-center justify-center' },
                      React.createElement(ShoppingBagIcon, { className: 'w-4 h-4 text-gray-400' })
                    )
              ),
              React.createElement('span', { className: 'text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]' }, rp.name),
              React.createElement('button', {
                onClick: function () { self.handleRemoveRelated(rp.id); },
                className: 'p-0.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0',
                title: t('products.removeRelated'),
              },
                React.createElement(XMarkIcon, { className: 'w-4 h-4' })
              )
            );
          })
        ),

        this.state.relatedProducts.length === 0 && React.createElement('p', { className: 'text-sm text-gray-500 dark:text-gray-400' },
          t('products.noRelatedProducts')
        ),

        React.createElement('button', {
          type: 'button',
          onClick: this.handleOpenPicker.bind(this),
          className: 'btn-secondary text-sm inline-flex items-center',
        },
          React.createElement(PlusIcon, { className: 'w-4 h-4 mr-1.5' }),
          t('products.addRelatedProducts')
        ),

        React.createElement(ProductPicker, {
          open: this.state.pickerOpen,
          selectedIds: this.state.relatedIds,
          onConfirm: this.handleRelatedConfirm.bind(this),
          onClose: function () { this.setState({ pickerOpen: false }); }.bind(this),
        })
      ),

      // Product form - submits as JSON
      React.createElement('form', { onSubmit: this.handleSubmit.bind(this), className: 'space-y-6' },

        // Basic Information
        React.createElement('div', { className: 'card p-6 space-y-4' },
          React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 dark:text-white' }, t('products.basicInformation')),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.productName')),
              React.createElement('input', { value: form.name, onChange: function (e) { this.handleChange('name', e.target.value); }.bind(this), className: 'input-field', required: true })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.sku')),
              React.createElement('input', { value: form.sku, onChange: function (e) { this.handleChange('sku', e.target.value); }.bind(this), className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.category')),
              React.createElement('select', { value: form.categoryId, onChange: function (e) { this.handleChange('categoryId', e.target.value); }.bind(this), className: 'input-field' },
                React.createElement('option', { value: '' }, t('products.selectCategory')),
                categories.map(function (cat) { return React.createElement('option', { key: cat.id, value: cat.id }, cat.name); })
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.brand')),
              React.createElement('select', { value: form.brandId, onChange: function (e) { this.handleChange('brandId', e.target.value); }.bind(this), className: 'input-field' },
                React.createElement('option', { value: '' }, t('products.selectBrand')),
                brands.map(function (b) { return React.createElement('option', { key: b.id, value: b.id }, b.name); })
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.deliveryCompany')),
              React.createElement('select', { value: form.deliveryCompanyId, onChange: function (e) { this.handleChange('deliveryCompanyId', e.target.value); }.bind(this), className: 'input-field' },
                React.createElement('option', { value: '' }, t('products.selectDeliveryCompany')),
                deliveryCompanies.map(function (company) { return React.createElement('option', { key: company.id, value: company.id }, company.name); })
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.coupon')),
              React.createElement('select', { value: form.couponId, onChange: function (e) { this.handleChange('couponId', e.target.value); }.bind(this), className: 'input-field' },
                React.createElement('option', { value: '' }, t('products.selectCoupon')),
                coupons.map(function (coupon) { return React.createElement('option', { key: coupon.id, value: coupon.id }, coupon.code); })
              )
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.price')),
              React.createElement('input', { type: 'number', step: '0.01', value: form.price, onChange: function (e) { this.handleChange('price', e.target.value); }.bind(this), className: 'input-field', required: true })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.comparePrice')),
              React.createElement('input', { type: 'number', step: '0.01', value: form.comparePrice, onChange: function (e) { this.handleChange('comparePrice', e.target.value); }.bind(this), className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.costPrice')),
              React.createElement('input', { type: 'number', step: '0.01', value: form.costPrice, onChange: function (e) { this.handleChange('costPrice', e.target.value); }.bind(this), className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.quantity')),
              React.createElement('input', { type: 'number', value: form.quantity, onChange: function (e) { this.handleChange('quantity', e.target.value); }.bind(this), className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.vendor')),
              React.createElement('input', { value: form.vendor, onChange: function (e) { this.handleChange('vendor', e.target.value); }.bind(this), className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.weight')),
              React.createElement('input', { type: 'number', step: '0.01', value: form.weight, onChange: function (e) { this.handleChange('weight', e.target.value); }.bind(this), className: 'input-field' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'label' }, t('products.status')),
              React.createElement('select', { value: form.status, onChange: function (e) { this.handleChange('status', e.target.value); }.bind(this), className: 'input-field' },
                React.createElement('option', { value: 'draft' }, t('products.draft')),
                React.createElement('option', { value: 'published' }, t('products.published')),
                React.createElement('option', { value: 'archived' }, t('products.archived'))
              )
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('products.shortDescription')),
            React.createElement('textarea', { value: form.shortDescription, onChange: function (e) { this.handleChange('shortDescription', e.target.value); }.bind(this), rows: 2, className: 'input-field' })
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'label' }, t('products.description')),
            React.createElement('textarea', { value: form.description, onChange: function (e) { this.handleChange('description', e.target.value); }.bind(this), rows: 4, className: 'input-field' })
          )
        ),

        // Public URL Section
        isEdit && product && product.slug && React.createElement('div', { className: 'card p-6 space-y-4' },
          React.createElement('h2', { className: 'text-lg font-semibold text-gray-900 dark:text-white' }, t('products.publicUrl')),
          React.createElement('div', { className: 'flex items-center space-x-3' },
            React.createElement('code', { className: 'flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 truncate' },
              storefrontUrl + '/products/' + product.slug
            ),
            React.createElement('button', {
              onClick: function () { window.open(storefrontUrl + '/products/' + product.slug, '_blank'); }.bind(this),
              className: 'btn-secondary !p-2',
              title: t('products.preview'),
            },
              React.createElement(EyeIcon, { className: 'w-5 h-5' })
            ),
            React.createElement('button', {
              onClick: function () {
                navigator.clipboard.writeText(storefrontUrl + '/products/' + product.slug).then(function () {
                  notify(t('products.linkCopied'));
                }).catch(function () {
                  notify(t('products.copyFailed'), 'error');
                });
              }.bind(this),
              className: 'btn-secondary !p-2',
              title: t('products.copyLink'),
            },
              React.createElement(ClipboardIcon, { className: 'w-5 h-5' })
            )
          )
        ),

        // Actions
        React.createElement('div', { className: 'flex justify-end space-x-3' },
          React.createElement('button', { type: 'button', onClick: function () { this.props.history.push('/admin/products'); }.bind(this), className: 'btn-secondary' }, t('common.cancel')),
          React.createElement('button', { type: 'submit', disabled: this.state.saving, className: 'btn-primary' },
            this.state.saving ? t('products.saving') : (isEdit ? t('products.updateProduct') : t('products.createProduct'))
          )
        )
      )
    );
  }
}

export default withTranslation()(ProductForm);
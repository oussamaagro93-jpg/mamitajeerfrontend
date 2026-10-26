import React from 'react';
import { withTranslation } from 'react-i18next';
import { ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

class ProductCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentImage: 0,
      zoom: false,
      zoomX: 0,
      zoomY: 0,
      lightbox: false,
    };
    this.imageRef = React.createRef();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.product !== this.props.product) {
      this.setState({ currentImage: 0, zoom: false, lightbox: false });
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  handleKeyDown(e) {
    var images = this._getImages();
    if (images.length < 2) return;
    if (e.key === 'ArrowLeft') {
      this.goToPrev();
    } else if (e.key === 'ArrowRight') {
      this.goToNext();
    } else if (e.key === 'Escape') {
      this.setState({ lightbox: false, zoom: false });
    }
  }

  _getImages() {
    var product = this.props.product;
    if (!product) return [];
    var images = product.images || [];
    if (product.image && images.length === 0) {
      images = [{ url: product.image, alt: product.name }];
    }
    return images;
  }

  goToPrev() {
    var images = this._getImages();
    if (images.length < 2) return;
    this.setState(function (state) {
      return { currentImage: (state.currentImage - 1 + images.length) % images.length, zoom: false };
    });
  }

  goToNext() {
    var images = this._getImages();
    if (images.length < 2) return;
    this.setState(function (state) {
      return { currentImage: (state.currentImage + 1) % images.length, zoom: false };
    });
  }

  selectImage(index) {
    this.setState({ currentImage: index, zoom: false });
  }

  handleMouseMove(e) {
    var rect = this.imageRef.current.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width) * 100;
    var y = ((e.clientY - rect.top) / rect.height) * 100;
    this.setState({ zoomX: x, zoomY: y, zoom: true });
  }

  handleMouseLeave() {
    this.setState({ zoom: false });
  }

  openLightbox() {
    this.setState({ lightbox: true, zoom: false });
  }

  closeLightbox() {
    this.setState({ lightbox: false });
  }

  _cloudinaryTransform(url, width, height, crop) {
    if (!url || !url.includes('cloudinary.com')) return url;
    var parts = url.split('/upload/');
    if (parts.length < 2) return url;
    var transforms = [];
    if (width) transforms.push('w_' + width);
    if (height) transforms.push('h_' + height);
    if (crop) transforms.push('c_' + crop);
    transforms.push('f_auto', 'q_auto');
    return parts[0] + '/upload/' + transforms.join(',') + '/' + parts[1];
  }

  render() {
    var t = this.props.t;
    var product = this.props.product;
    if (!product) return null;

    var images = this._getImages();
    var currentImage = images.length > 0 ? images[this.state.currentImage] : null;
    var hasMultipleImages = images.length > 1;

    var mainImageSrc = currentImage
      ? this._cloudinaryTransform(currentImage.url, 800, 800, 'fit')
      : null;

    var zoomImageSrc = currentImage
      ? this._cloudinaryTransform(currentImage.url, 1200, 1200, 'fit')
      : null;

    return React.createElement('div', { className: 'group bg-white rounded-3xl overflow-hidden shadow-xl shadow-purple-900/5 ring-1 ring-purple-100/80' },

      // Main Content: Image + Info
      React.createElement('div', { className: 'flex flex-col md:flex-row' },

        // Left: Gallery Section
        React.createElement('div', { className: 'w-full md:w-1/2 lg:w-5/12 relative' },

          // Main Image Container
          React.createElement('div', {
            className: 'relative bg-gradient-to-br from-purple-50 via-white to-indigo-50 overflow-hidden cursor-crosshair',
            onMouseMove: this.handleMouseMove,
            onMouseLeave: this.handleMouseLeave,
          },
            currentImage
              ? React.createElement('img', {
                  ref: this.imageRef,
                  src: mainImageSrc,
                  alt: currentImage.alt || product.name,
                  className: 'w-full aspect-square object-contain select-none transition-transform duration-500 ease-out group-hover:scale-[1.02]',
                  onClick: this.openLightbox.bind(this),
                  loading: 'lazy',
                })
              : React.createElement('div', { className: 'w-full aspect-square flex items-center justify-center' },
                  React.createElement(ShoppingBagIcon, { className: 'w-24 h-24 text-gray-300' })
                ),

            // Zoom Lens
            this.state.zoom && currentImage && React.createElement('div', {
              className: 'absolute inset-0 pointer-events-none',
              style: {
                backgroundImage: 'url(' + zoomImageSrc + ')',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '200% 200%',
                backgroundPosition: this.state.zoomX + '% ' + this.state.zoomY + '%',
              },
            }),

            // Navigation Arrows (overlay)
            hasMultipleImages && React.createElement(React.Fragment, null,
              React.createElement('button', {
                onClick: this.goToPrev.bind(this),
                className: 'absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all z-10',
                'aria-label': t('common.previous'),
              },
                React.createElement(ChevronLeftIcon, { className: 'w-5 h-5 text-gray-700' })
              ),
              React.createElement('button', {
                onClick: this.goToNext.bind(this),
                className: 'absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 active:scale-95 transition-all z-10',
                'aria-label': t('common.next'),
              },
                React.createElement(ChevronRightIcon, { className: 'w-5 h-5 text-gray-700' })
              )
            ),

            // Expand button
            currentImage && React.createElement('button', {
              onClick: this.openLightbox.bind(this),
              className: 'absolute top-3 right-3 w-9 h-9 bg-white/85 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 active:scale-95 transition-all z-10',
              'aria-label': t('storefront.gallery.expand'),
            },
              React.createElement('svg', { className: 'w-4 h-4 text-gray-700', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 2 },
                React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', d: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' })
              )
            )
          ),

          // Image Counter Badge
          hasMultipleImages && React.createElement('div', {
            className: 'absolute top-3 left-3 bg-gray-950/55 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full z-10',
          },
            (this.state.currentImage + 1) + ' / ' + images.length
          ),

          // Thumbnails
          hasMultipleImages && React.createElement('div', { className: 'flex gap-2 px-3 py-3 overflow-x-auto scrollbar-hide bg-gradient-to-b from-white to-purple-50/60' },
            images.map(function (img, i) {
              var isActive = i === this.state.currentImage;
              return React.createElement('button', {
                key: i,
                onClick: this.selectImage.bind(this, i),
                className: 'flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all hover:-translate-y-0.5 ' +
                  (isActive ? 'border-[#6C3DF2] shadow-md ring-2 ring-[#6C3DF2]/30' : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'),
              },
                React.createElement('img', {
                  src: this._cloudinaryTransform(img.url, 120, 120, 'fill'),
                  alt: img.alt || product.name,
                  className: 'w-full h-full object-cover',
                  loading: 'lazy',
                })
              );
            }.bind(this))
          )
        ),

        // Right: Product Info
        React.createElement('div', { className: 'flex-1 p-5 sm:p-6 lg:p-8 flex flex-col justify-center gap-3 sm:gap-4' },
          product.category && product.category.name
            ? React.createElement('div', null,
                React.createElement('span', {
                  className: 'inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-700 ring-1 ring-purple-100',
                }, product.category.name)
              )
            : null,
          React.createElement('h1', { className: 'text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight' }, product.name),
          React.createElement('p', { className: 'text-sm sm:text-base text-gray-600 leading-relaxed' }, product.description || '')
        )
      ),

      // Lightbox Overlay
      this.state.lightbox && currentImage && React.createElement('div', {
        className: 'fixed inset-0 z-[100] bg-black/90 flex items-center justify-center',
        onClick: this.closeLightbox.bind(this),
      },
        React.createElement('div', {
          className: 'relative max-w-[90vw] max-h-[90vh]',
          onClick: function (e) { e.stopPropagation(); },
        },
          // Close button
          React.createElement('button', {
            onClick: this.closeLightbox.bind(this),
            className: 'absolute -top-12 right-0 text-white/80 hover:text-white transition-colors',
            'aria-label': t('common.close'),
          },
            React.createElement(XMarkIcon, { className: 'w-8 h-8' })
          ),

          // Lightbox image
          React.createElement('img', {
            src: this._cloudinaryTransform(currentImage.url, 1600, 1600, 'fit'),
            alt: currentImage.alt || product.name,
            className: 'max-w-full max-h-[85vh] object-contain rounded-lg',
          }),

          // Lightbox nav
          hasMultipleImages && React.createElement(React.Fragment, null,
            React.createElement('button', {
              onClick: function (e) { e.stopPropagation(); this.goToPrev(); }.bind(this),
              className: 'absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors',
            },
              React.createElement(ChevronLeftIcon, { className: 'w-6 h-6 text-white' })
            ),
            React.createElement('button', {
              onClick: function (e) { e.stopPropagation(); this.goToNext(); }.bind(this),
              className: 'absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors',
            },
              React.createElement(ChevronRightIcon, { className: 'w-6 h-6 text-white' })
            ),
            React.createElement('div', {
              className: 'absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-sm',
            },
              (this.state.currentImage + 1) + ' / ' + images.length
            )
          )
        )
      )
    );
  }
}

export default withTranslation()(ProductCard);

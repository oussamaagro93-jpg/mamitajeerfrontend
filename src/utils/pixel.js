import { API_BASE_URL } from '../api/config';

var pixelId = null;
var initialized = false;
var consentGiven = false;

function getPixelId() {
  if (pixelId) return pixelId;
  try {
    pixelId = import.meta.env.VITE_META_PIXEL_ID;
  } catch (e) {
    pixelId = null;
  }
  return pixelId;
}

function loadPixelScript(id) {
  if (typeof window === 'undefined') return;
  if (window.fbq) return;
  var n = window.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  var firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(script, firstScript);
  window.fbq('init', id);
}

var MetaPixel = {
  init: function () {
    if (initialized) return;
    var id = getPixelId();
    if (!id || id === 'your_pixel_id') {
      return;
    }
    initialized = true;
    loadPixelScript(id);

    if (consentGiven) {
      window.fbq('consent', 'grant');
    }
  },

  setConsent: function (granted) {
    consentGiven = granted;
    if (initialized && window.fbq) {
      window.fbq('consent', granted ? 'grant' : 'revoke');
    }
  },

  pageView: function () {
    if (!initialized) { this.init(); }
    if (!initialized) { return; }
    window.fbq('track', 'PageView');
    this.sendToServer('PageView', {});
  },

  viewContent: function (params) {
    if (!initialized) { this.init(); }
    if (!initialized) { return; }
    window.fbq('track', 'ViewContent', params);
    this.sendToServer('ViewContent', params);
  },

  addToCart: function (params) {
    if (!initialized) { this.init(); }
    if (!initialized) { return; }
    window.fbq('track', 'AddToCart', params);
    this.sendToServer('AddToCart', params);
  },

  initiateCheckout: function (params, userData) {
    if (!initialized) { this.init(); }
    if (!initialized) { this.sendToServer('InitiateCheckout', params, userData); return; }
    window.fbq('track', 'InitiateCheckout', params);
    this.sendToServer('InitiateCheckout', params, userData);
  },

  purchase: function (params, userData) {
    if (!initialized) { this.init(); }
    if (!initialized) { this.sendToServer('Purchase', params, userData); return; }
    window.fbq('track', 'Purchase', params);
    this.sendToServer('Purchase', params, userData);
  },

  sendToServer: function (eventName, params, userData) {
    var payload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.event_id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
      custom_data: params,
      user_data: userData || {},
      meta_browser_data: {
        fbp: this.getFbp(),
        fbc: this.getFbc(),
        client_user_agent: navigator.userAgent,
      },
    };

    if (params.event_id) { delete payload.custom_data.event_id; }

    try {
      fetch(`${API_BASE_URL}/meta/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {});
    } catch (e) {}
  },

  getFbp: function () {
    if (typeof document === 'undefined') return null;
    var match = document.cookie.match(/_fbp=([^;]+)/);
    return match ? match[1] : null;
  },

  getFbc: function () {
    if (typeof document === 'undefined') return null;
    var match = document.cookie.match(/_fbc=([^;]+)/);
    if (match) return match[1];
    var urlParams = new URLSearchParams(window.location.search);
    var fbclid = urlParams.get('fbclid');
    if (fbclid) {
      return 'fb.1.' + Date.now() + '.' + fbclid;
    }
    return null;
  },

  generateEventId: function () {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },
};

export default MetaPixel;

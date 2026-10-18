// Single source of truth for the backend API location.
//
// By default this is a SAME-ORIGIN relative path:
//   - Local dev:  Vite's dev-server proxy (vite.config.js) forwards /api to
//                 http://localhost:5000.
//   - Production: the frontend's vercel.json rewrite proxies /api/* to the
//                 deployed backend, so the browser never makes a cross-origin
//                 request and CORS is not involved.
//
// Optionally set VITE_API_URL to call a backend origin directly (this bypasses
// the rewrite/proxy and would require CORS on the backend). Leave it empty to
// use the proxy.
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

const override = String(env.VITE_API_URL || '').replace(/\/+$/, '');

export const SERVER_URL = override;

export const API_BASE_URL = `${override}/api/v1`;

export default API_BASE_URL;

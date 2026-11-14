// No Cloudflare database or identity bindings are available on Vercel.
// Fail closed until a Vercel-compatible backend is configured.
export const env: Cloudflare.Env = {};

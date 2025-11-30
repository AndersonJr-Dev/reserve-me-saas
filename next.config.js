/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    let supabaseOrigin = ''
    try {
      if (supabaseUrl) {
        const u = new URL(supabaseUrl)
        supabaseOrigin = `${u.protocol}//${u.host}`
      }
    } catch {}
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https: data:; connect-src 'self' " + (supabaseOrigin || 'https:') + " https://api.stripe.com https://checkout.stripe.com wss:; frame-ancestors 'self'; frame-src 'self' https://js.stripe.com https://checkout.stripe.com; base-uri 'self'" }
        ]
      }
    ]
  }
}

module.exports = nextConfig

const getEnvValue = (...names) => names.map((name) => process.env[name]).find(Boolean) ?? ''

export default function handler(request, response) {
  const supabaseUrl = getEnvValue('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL')
  const supabaseAnonKey = getEnvValue(
    'VITE_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY',
  )

  response.setHeader('Cache-Control', 'no-store')
  response.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
  })
}

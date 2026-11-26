export const isPagesPreview = import.meta.env.MODE === 'pages'

const configuredUrl = import.meta.env.VITE_FULL_APP_URL?.trim().replace(/\/+$/, '')
export const fullAppUrl = configuredUrl?.startsWith('https://') ? configuredUrl : undefined

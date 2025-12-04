import { defineEventHandler, getRequestIP, setResponseStatus, getHeader } from 'h3'

interface RateLimitRecord {
  count: number
  lastRequest: number
  blocked: boolean
  blockExpires: number
}

const rateLimit = new Map<string, RateLimitRecord>()
const WINDOW_SIZE = 60 * 1000 // 1 minuto
const MAX_REQUESTS = 60 // 60 requests por minuto
const BLOCK_DURATION = 5 * 60 * 1000 // 5 minutos de bloqueo si excede

// Limpiar registros antiguos cada 10 minutos
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimit.entries()) {
    if (now - record.lastRequest > WINDOW_SIZE * 2) {
      rateLimit.delete(key)
    }
  }
}, 10 * 60 * 1000)

export default defineEventHandler((event) => {
  const url = event.node.req.url

  // Solo aplicar a rutas API
  if (!url?.startsWith('/api/')) {
    return
  }

  // Obtener IP real (considerando proxies)
  const forwardedFor = getHeader(event, 'x-forwarded-for')
  const realIp = getHeader(event, 'x-real-ip')
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || getRequestIP(event) || 'unknown'

  const now = Date.now()

  let record = rateLimit.get(ip)

  // Crear nuevo registro si no existe
  if (!record) {
    record = { count: 0, lastRequest: now, blocked: false, blockExpires: 0 }
  }

  // Verificar si está bloqueado
  if (record.blocked && now < record.blockExpires) {
    setResponseStatus(event, 429)
    return {
      statusCode: 429,
      message: 'Demasiadas solicitudes. Por favor espera unos minutos.',
      retryAfter: Math.ceil((record.blockExpires - now) / 1000)
    }
  }

  // Desbloquear si ya pasó el tiempo
  if (record.blocked && now >= record.blockExpires) {
    record.blocked = false
    record.count = 0
  }

  // Resetear ventana si pasó el tiempo
  if (now - record.lastRequest > WINDOW_SIZE) {
    record.count = 0
    record.lastRequest = now
  }

  record.count++
  record.lastRequest = now

  // Verificar límite
  if (record.count > MAX_REQUESTS) {
    record.blocked = true
    record.blockExpires = now + BLOCK_DURATION
    rateLimit.set(ip, record)

    console.warn(`[Rate Limit] IP bloqueada: ${ip} - ${record.count} requests`)

    setResponseStatus(event, 429)
    return {
      statusCode: 429,
      message: 'Demasiadas solicitudes. Por favor espera unos minutos.',
      retryAfter: Math.ceil(BLOCK_DURATION / 1000)
    }
  }

  rateLimit.set(ip, record)

  // Agregar headers informativos
  event.node.res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString())
  event.node.res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - record.count).toString())
  event.node.res.setHeader('X-RateLimit-Reset', (record.lastRequest + WINDOW_SIZE).toString())
})

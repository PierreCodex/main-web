import { defineEventHandler, getRequestIP, setResponseStatus } from 'h3'

const rateLimit = new Map<string, { count: number, lastRequest: number }>()
const WINDOW_SIZE = 60 * 1000 // 1 minute
const MAX_REQUESTS = 60 // 60 requests per minute

export default defineEventHandler((event) => {
    const url = event.node.req.url

    // Only apply to API routes
    if (!url?.startsWith('/api/')) {
        return
    }

    const ip = getRequestIP(event) || 'unknown'
    const now = Date.now()

    const record = rateLimit.get(ip) || { count: 0, lastRequest: now }

    // Reset window if time passed
    if (now - record.lastRequest > WINDOW_SIZE) {
        record.count = 0
        record.lastRequest = now
    }

    record.count++
    rateLimit.set(ip, record)

    if (record.count > MAX_REQUESTS) {
        setResponseStatus(event, 429)
        return {
            statusCode: 429,
            message: 'Too Many Requests. Please try again later.'
        }
    }
})

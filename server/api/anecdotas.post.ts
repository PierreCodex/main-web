import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Esquema de validación
const anecdotaSchema = z.object({
  titulo: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .transform(val => val.trim()),
  subtitulo: z.string()
    .min(3, 'La descripción debe tener al menos 3 caracteres')
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .transform(val => val.trim()),
  departamento: z.string()
    .min(2, 'Selecciona un departamento válido')
    .max(100),
  distrito: z.string()
    .min(2, 'Ingresa un distrito válido')
    .max(100)
    .transform(val => val.trim()),
  edad: z.string()
    .min(1, 'Ingresa la edad')
    .max(3)
    .refine(val => {
      const num = parseInt(val)
      return num >= 18 && num <= 99
    }, 'La edad debe estar entre 18 y 99 años'),
  ocupacion: z.string().max(100).optional().nullable(),
  tiempo_relacion: z.string().max(100).optional().nullable(),
  periodo_infidelidad: z.string().max(100).optional().nullable(),
  datos_adicionales: z.string().max(2000).optional().nullable(),
  enlaces_pruebas: z.string().max(1000).optional().nullable(),
  pais: z.string().default('Perú')
})

// Lista de palabras prohibidas (básico)
const palabrasProhibidas = [
  'matar', 'asesinar', 'bomba', 'terrorista', 'suicid'
]

function contienePalabrasProhibidas(texto: string): boolean {
  const textoLower = texto.toLowerCase()
  return palabrasProhibidas.some(palabra => textoLower.includes(palabra))
}

// Sanitizar texto (remover HTML, scripts)
function sanitizarTexto(texto: string): string {
  return texto
    .replace(/<[^>]*>/g, '') // Remover HTML tags
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim()
}

export default defineEventHandler(async (event) => {
  // Solo permitir POST
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      message: 'Método no permitido'
    })
  }

  try {
    const body = await readBody(event)

    // Verificar honeypot (anti-bot)
    if (body.honeypot || body.website_url_check) {
      console.warn('Bot detectado via honeypot')
      throw createError({
        statusCode: 400,
        message: 'Solicitud inválida'
      })
    }

    // Sanitizar campos de texto
    const datosLimpios = {
      ...body,
      titulo: sanitizarTexto(body.titulo || ''),
      subtitulo: sanitizarTexto(body.subtitulo || ''),
      distrito: sanitizarTexto(body.distrito || ''),
      ocupacion: body.ocupacion ? sanitizarTexto(body.ocupacion) : null,
      datos_adicionales: body.datos_adicionales ? sanitizarTexto(body.datos_adicionales) : null
    }

    // Validar con Zod
    const resultado = anecdotaSchema.safeParse(datosLimpios)

    if (!resultado.success) {
      throw createError({
        statusCode: 400,
        message: resultado.error.errors[0]?.message || 'Datos inválidos'
      })
    }

    const datos = resultado.data

    // Verificar contenido prohibido
    const textoCompleto = `${datos.titulo} ${datos.subtitulo} ${datos.datos_adicionales || ''}`
    if (contienePalabrasProhibidas(textoCompleto)) {
      throw createError({
        statusCode: 400,
        message: 'El contenido contiene palabras no permitidas'
      })
    }

    // Crear cliente de Supabase con credenciales del servidor
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw createError({
        statusCode: 500,
        message: 'Error de configuración del servidor'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Insertar en la base de datos
    const { data, error } = await supabase
      .from('anecdotas')
      .insert({
        titulo: datos.titulo,
        subtitulo: datos.subtitulo,
        departamento: datos.departamento,
        distrito: datos.distrito,
        edad: datos.edad,
        ocupacion: datos.ocupacion,
        tiempo_relacion: datos.tiempo_relacion,
        periodo_infidelidad: datos.periodo_infidelidad,
        datos_adicionales: datos.datos_adicionales,
        enlaces_pruebas: datos.enlaces_pruebas,
        pais: datos.pais
      })
      .select()
      .single()

    if (error) {
      console.error('Error Supabase:', error)
      throw createError({
        statusCode: 500,
        message: 'Error al guardar la anécdota'
      })
    }

    return {
      success: true,
      data
    }

  } catch (error: any) {
    // Si ya es un error de createError, re-lanzarlo
    if (error.statusCode) {
      throw error
    }

    console.error('Error inesperado:', error)
    throw createError({
      statusCode: 500,
      message: 'Error interno del servidor'
    })
  }
})

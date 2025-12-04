import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Esquema de validación para votos
const votoSchema = z.object({
  anecdota_id: z.string().uuid('ID de anécdota inválido'),
  tipo: z.enum(['aprobar', 'refutar', 'denunciar'], {
    errorMap: () => ({ message: 'Tipo de voto inválido' })
  }),
  votante_id: z.string()
    .min(10, 'ID de votante inválido')
    .max(100),
  evidencia_refutacion: z.string().max(2000).optional().nullable(),
  motivo_denuncia: z.string().max(500).optional().nullable()
})

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

    // Validar con Zod
    const resultado = votoSchema.safeParse(body)

    if (!resultado.success) {
      throw createError({
        statusCode: 400,
        message: resultado.error.errors[0]?.message || 'Datos inválidos'
      })
    }

    const datos = resultado.data

    // Crear cliente de Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw createError({
        statusCode: 500,
        message: 'Error de configuración del servidor'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificar que la anécdota existe
    const { data: anecdota } = await supabase
      .from('anecdotas')
      .select('id')
      .eq('id', datos.anecdota_id)
      .single()

    if (!anecdota) {
      throw createError({
        statusCode: 404,
        message: 'Anécdota no encontrada'
      })
    }

    // Verificar si ya votó este usuario en esta anécdota
    const { data: votoExistente } = await supabase
      .from('votos')
      .select('id')
      .eq('anecdota_id', datos.anecdota_id)
      .eq('votante_id', datos.votante_id)
      .single()

    if (votoExistente) {
      throw createError({
        statusCode: 409,
        message: 'Ya has votado en esta anécdota'
      })
    }

    // Insertar voto
    const { data, error } = await supabase
      .from('votos')
      .insert({
        anecdota_id: datos.anecdota_id,
        tipo: datos.tipo,
        votante_id: datos.votante_id,
        evidencia_refutacion: datos.evidencia_refutacion || null,
        motivo_denuncia: datos.motivo_denuncia || null
      })
      .select()
      .single()

    if (error) {
      // Manejar error de duplicado
      if (error.code === '23505') {
        throw createError({
          statusCode: 409,
          message: 'Ya has votado en esta anécdota'
        })
      }

      console.error('Error Supabase:', error)
      throw createError({
        statusCode: 500,
        message: 'Error al registrar el voto'
      })
    }

    return {
      success: true,
      data
    }

  } catch (error: any) {
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

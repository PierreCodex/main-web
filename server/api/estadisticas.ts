import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)

    try {
        // Obtener todas las anécdotas con sus votos
        const { data: anecdotas, error: anecdotasError } = await supabase
            .from('anecdotas')
            .select('id, titulo, subtitulo, departamento, created_at')
            .order('created_at', { ascending: false })

        if (anecdotasError) throw anecdotasError

        // Obtener todos los votos
        const { data: votos, error: votosError } = await supabase
            .from('votos')
            .select('anecdota_id, tipo, motivo_denuncia')

        if (votosError) throw votosError

        // Procesar estadísticas por anécdota
        const anecdotasConVotos = anecdotas.map(anecdota => {
            const votosAnecdota = votos.filter(v => v.anecdota_id === anecdota.id)

            return {
                ...anecdota,
                votos: {
                    aprobar: votosAnecdota.filter(v => v.tipo === 'aprobar').length,
                    refutar: votosAnecdota.filter(v => v.tipo === 'refutar').length,
                    denunciar: votosAnecdota.filter(v => v.tipo === 'denunciar').length,
                    total: votosAnecdota.length
                }
            }
        })

        // Top 10 más aprobadas
        const masAprobadas = [...anecdotasConVotos]
            .sort((a, b) => b.votos.aprobar - a.votos.aprobar)
            .slice(0, 10)

        // Top 10 más refutadas
        const masRefutadas = [...anecdotasConVotos]
            .sort((a, b) => b.votos.refutar - a.votos.refutar)
            .slice(0, 10)

        // Top 10 más denunciadas
        const masDenunciadas = [...anecdotasConVotos]
            .sort((a, b) => b.votos.denunciar - a.votos.denunciar)
            .filter(a => a.votos.denunciar > 0)
            .slice(0, 10)

        // Top 10 más votadas (total)
        const masVotadas = [...anecdotasConVotos]
            .sort((a, b) => b.votos.total - a.votos.total)
            .slice(0, 10)

        // Trending (últimas 48 horas con más actividad)
        const hace48h = new Date()
        hace48h.setHours(hace48h.getHours() - 48)

        const trending = anecdotasConVotos
            .filter(a => new Date(a.created_at) >= hace48h)
            .sort((a, b) => b.votos.total - a.votos.total)
            .slice(0, 10)

        // Estadísticas por departamento
        const porDepartamento = anecdotas.reduce((acc, anecdota) => {
            const dept = anecdota.departamento || 'Sin especificar'
            acc[dept] = (acc[dept] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        const departamentosOrdenados = Object.entries(porDepartamento)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([departamento, count]) => ({ departamento, count }))

        // Estadísticas generales
        const estadisticasGenerales = {
            totalAnecdotas: anecdotas.length,
            totalVotos: votos.length,
            votosHoy: votos.filter(v => {
                const hoy = new Date()
                hoy.setHours(0, 0, 0, 0)
                return new Date(v.created_at) >= hoy
            }).length,
            ratioAprobacion: votos.length > 0
                ? ((votos.filter(v => v.tipo === 'aprobar').length / votos.length) * 100).toFixed(1)
                : 0,
            denunciasPendientes: votos.filter(v => v.tipo === 'denunciar').length
        }

        // Motivos de denuncia más comunes
        const motivosDenuncia = votos
            .filter(v => v.tipo === 'denunciar' && v.motivo_denuncia)
            .reduce((acc, voto) => {
                const motivo = voto.motivo_denuncia
                acc[motivo] = (acc[motivo] || 0) + 1
                return acc
            }, {} as Record<string, number>)

        const motivosOrdenados = Object.entries(motivosDenuncia)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([motivo, count]) => ({ motivo, count }))

        return {
            rankings: {
                masAprobadas,
                masRefutadas,
                masDenunciadas,
                masVotadas,
                trending
            },
            estadisticas: {
                generales: estadisticasGenerales,
                porDepartamento: departamentosOrdenados,
                motivosDenuncia: motivosOrdenados
            }
        }
    } catch (error: any) {
        console.error('Error obteniendo estadísticas:', error)
        throw createError({
            statusCode: 500,
            message: error.message || 'Error al obtener estadísticas'
        })
    }
})

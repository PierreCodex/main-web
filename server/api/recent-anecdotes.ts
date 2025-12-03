import { serverSupabaseClient } from '#supabase/server'

export default eventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)

    try {
        const { data, error } = await supabase
            .from('anecdotas')
            .select('id, titulo, departamento, created_at')
            .order('created_at', { ascending: false })
            .limit(5)

        if (error) throw error

        return data
    } catch (error: any) {
        console.error('Error fetching recent anecdotes:', error)
        return []
    }
})

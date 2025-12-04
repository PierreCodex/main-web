<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'
import type { Anecdota } from '~/types'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UAvatar = resolveComponent('UAvatar')

const supabase = useSupabaseClient()
const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
  id: 'titulo',
  value: ''
}])
const columnVisibility = ref()

// Cargar datos desde Supabase
const { data, status, refresh } = await useAsyncData<Anecdota[]>('anecdotas', async () => {
  console.log('Cargando anécdotas desde Supabase...')
  
  const { data, error } = await supabase
    .from('anecdotas')
    .select('*')
    .order('created_at', { ascending: false })
  
  console.log('Respuesta:', { data, error })
  
  if (error) {
    console.error('Error:', error)
    toast.add({ title: 'Error', description: error.message, color: 'error' })
    return []
  }
  
  return data || []
}, {
  default: () => [],
  server: false // Cargar solo en el cliente para evitar problemas de SSR
})

function getRowItems(row: Row<Anecdota>) {
  return [
    {
      type: 'label',
      label: 'Acciones'
    },
    {
      label: 'Copiar ID',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id)
        toast.add({
          title: 'Copiado',
          description: 'ID copiado al portapapeles'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Ver detalles',
      icon: 'i-lucide-eye',
      onSelect() {
        navigateTo(`/customers/${row.original.id}`)
      }
    }
  ]
}

// Función para formatear fecha
function formatDate(dateString: string) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Función para obtener la primera imagen de evidencia
function getFirstImage(enlaces_pruebas: string | null): string | null {
  if (!enlaces_pruebas) return null
  
  const enlaces = enlaces_pruebas.split(/[,\n]/).map(e => e.trim()).filter(e => e.length > 0)
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
  
  for (const url of enlaces) {
    const lowerUrl = url.toLowerCase()
    // Si es del bucket de evidencias de Supabase o tiene extensión de imagen
    if ((url.includes('supabase') && url.includes('/evidencias/')) ||
        imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return url
    }
  }
  return null
}

const columns: TableColumn<Anecdota>[] = [
  {
    id: 'avatar',
    header: '',
    cell: ({ row }) => {
      const imagen = getFirstImage(row.original.enlaces_pruebas)
      return h(UAvatar, {
        src: imagen || undefined,
        alt: row.original.titulo,
        icon: 'i-lucide-user',
        size: 'lg',
        class: 'ring-2 ring-rose-200 dark:ring-rose-800'
      })
    }
  },
  {
    accessorKey: 'titulo',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Título',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
      })
    },
    cell: ({ row }) => {
      return h('a', { 
        href: `/customers/${row.original.id}`,
        class: 'max-w-xs block hover:opacity-80 transition-opacity cursor-pointer',
        onClick: (e: Event) => {
          e.preventDefault()
          navigateTo(`/customers/${row.original.id}`)
        }
      }, [
        h('p', { class: 'font-medium text-highlighted truncate hover:underline' }, row.original.titulo),
        h('p', { class: 'text-sm text-muted truncate' }, row.original.subtitulo)
      ])
    }
  },
  {
    accessorKey: 'pais',
    header: 'País',
    cell: ({ row }) => row.original.pais || '-'
  },
  {
    accessorKey: 'departamento',
    header: 'Departamento',
    cell: ({ row }) => row.original.departamento || '-'
  },
  {
    accessorKey: 'distrito',
    header: 'Distrito',
    cell: ({ row }) => row.original.distrito || '-'
  },
  {
    accessorKey: 'edad',
    header: 'Edad',
    cell: ({ row }) => row.original.edad ? `${row.original.edad} años` : '-'
  },
  
  {
    accessorKey: 'created_at',
    header: 'Fecha',
    cell: ({ row }) => {
      return h(UBadge, { variant: 'subtle', color: 'neutral' }, () => 
        formatDate(row.original.created_at)
      )
    }
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'flex items-center justify-center w-full' },
        [
          h(UButton, {
            label: 'Ver chisme',
            icon: 'i-lucide-eye',
            variant: 'solid',
            size: 'xs',
            class: 'bg-rose-500 hover:bg-rose-600 text-white',
            onClick: () => {
              navigateTo(`/customers/${row.original.id}`)
            }
          })
        ]
      )
    }
  }
]

const departamentoFilter = ref('all')

const departamentos = [
  'Todos', 'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín',
  'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua',
  'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'
]

watch(() => departamentoFilter.value, (newVal) => {
  if (!table?.value?.tableApi) return

  const deptColumn = table.value.tableApi.getColumn('departamento')
  if (!deptColumn) return

  if (newVal === 'all' || newVal === 'Todos') {
    deptColumn.setFilterValue(undefined)
  } else {
    deptColumn.setFilterValue(newVal)
  }
})

const searchQuery = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn('titulo')?.getFilterValue() as string) || ''
  },
  set: (value: string) => {
    table.value?.tableApi?.getColumn('titulo')?.setFilterValue(value || undefined)
  }
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<template>
  <UDashboardPanel id="customers">
    <template #header>
      <UDashboardNavbar title="Anécdotas">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <CustomersAddModal @created="refresh" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          v-model="searchQuery"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Buscar por título..."
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <CustomersDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
            <UButton
              v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
              label="Delete"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
            >
              <template #trailing>
                <UKbd>
                  {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                </UKbd>
              </template>
            </UButton>
          </CustomersDeleteModal>

          <USelect
            v-model="departamentoFilter"
            :items="departamentos.map(d => ({ label: d, value: d === 'Todos' ? 'all' : d }))"
            :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            placeholder="Departamento"
            class="min-w-36"
          />
          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Display"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="shrink-0"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }"
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

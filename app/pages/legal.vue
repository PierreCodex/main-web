<script setup lang="ts">
</script>

<template>
  <UDashboardPanel id="legal">
    <template #header>
      <UDashboardNavbar title="Legal y Privacidad">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-3xl mx-auto space-y-8">
        <!-- Aviso Legal -->
        <UPageCard variant="subtle">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-scale" class="size-5 text-primary" />
              <h2 class="font-semibold text-highlighted">Aviso Legal</h2>
            </div>
          </template>

          <div class="prose prose-sm dark:prose-invert max-w-none space-y-4">
            <p>
              Este sitio web es una plataforma de <strong>entretenimiento</strong> que permite a los usuarios compartir 
              <strong>anécdotas ficticias e inventadas</strong>. Todo el contenido publicado debe ser considerado como 
              <strong>ficción</strong> y no representa hechos reales.
            </p>
            <p>
              La plataforma <strong>NO verifica</strong> la identidad de los usuarios ni la veracidad de la información 
              publicada. Cualquier similitud con personas reales, vivas o fallecidas, es pura coincidencia.
            </p>
          </div>
        </UPageCard>

        <!-- Responsabilidad del Usuario -->
        <UPageCard variant="subtle">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-user-check" class="size-5 text-primary" />
              <h2 class="font-semibold text-highlighted">Responsabilidad del Usuario</h2>
            </div>
          </template>

          <div class="prose prose-sm dark:prose-invert max-w-none">
            <p>Al utilizar esta plataforma, el usuario acepta que:</p>
            <ul class="space-y-2">
              <li>Todo el contenido que publique debe ser <strong>ficticio e inventado</strong></li>
              <li>Es el <strong>único responsable</strong> del contenido que publica</li>
              <li>No publicará información personal real de terceros</li>
              <li>No utilizará la plataforma para difamar, acosar o dañar a personas reales</li>
              <li>La plataforma puede eliminar contenido que viole estas normas</li>
            </ul>
          </div>
        </UPageCard>

        <!-- Política de Privacidad -->
        <UPageCard variant="subtle">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield" class="size-5 text-primary" />
              <h2 class="font-semibold text-highlighted">Política de Privacidad</h2>
            </div>
          </template>

          <div class="prose prose-sm dark:prose-invert max-w-none space-y-4">
            <h4>Datos que recopilamos:</h4>
            <ul class="space-y-1">
              <li>Información proporcionada voluntariamente al crear anécdotas</li>
              <li>Datos técnicos básicos (IP, navegador) para prevenir abusos</li>
              <li>Votos y denuncias para moderar el contenido</li>
            </ul>

            <h4>Uso de la información:</h4>
            <ul class="space-y-1">
              <li>Mostrar el contenido en la plataforma</li>
              <li>Prevenir abusos y contenido inapropiado</li>
              <li>Mejorar la experiencia del usuario</li>
            </ul>

            <h4>No compartimos:</h4>
            <p>
              No vendemos, intercambiamos ni transferimos información personal a terceros, 
              excepto cuando sea requerido por ley.
            </p>
          </div>
        </UPageCard>

        <!-- Términos de Uso -->
        <UPageCard variant="subtle">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-file-text" class="size-5 text-primary" />
              <h2 class="font-semibold text-highlighted">Términos de Uso</h2>
            </div>
          </template>

          <div class="prose prose-sm dark:prose-invert max-w-none space-y-4">
            <p>Al usar este sitio, aceptas:</p>
            <ul class="space-y-2">
              <li>Que todo el contenido es <strong>ficticio</strong> y con fines de entretenimiento</li>
              <li>No usar la plataforma para actividades ilegales</li>
              <li>No publicar contenido que infrinja derechos de terceros</li>
              <li>Que la plataforma puede modificar o eliminar contenido sin previo aviso</li>
              <li>Que la plataforma no se hace responsable por el contenido publicado por usuarios</li>
            </ul>
          </div>
        </UPageCard>

        <!-- Contacto -->
        <UPageCard variant="subtle">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-mail" class="size-5 text-primary" />
              <h2 class="font-semibold text-highlighted">Contacto</h2>
            </div>
          </template>

          <div class="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Para consultas legales, solicitudes de eliminación de contenido o cualquier 
              otra inquietud, puedes contactarnos a través de nuestros canales oficiales.
            </p>
          </div>
        </UPageCard>

        <!-- Última actualización -->
        <p class="text-xs text-muted text-center pb-8">
          Última actualización: Diciembre 2025
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>

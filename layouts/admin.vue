<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'

const route = useRoute()
const sidebarOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false
  },
)
</script>

<template>
  <div class="flex min-h-screen bg-surface text-foreground">
    <!-- Fond mobile quand menu ouvert -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <button
        v-if="sidebarOpen"
        type="button"
        class="fixed inset-0 z-40 bg-ink/50 md:hidden"
        aria-label="Fermer le menu"
        @click="sidebarOpen = false"
      />
    </Transition>

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-[min(100%,18rem)] flex-col border-r border-ink/10 bg-paper shadow-xl transition-transform duration-200 ease-out dark:border-white/10 dark:bg-night md:static md:w-64 md:shrink-0 md:translate-x-0 md:shadow-none"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <div class="flex items-center justify-end border-b border-ink/10 px-2 py-2 dark:border-white/10 md:hidden">
        <button
          type="button"
          class="rounded-wax p-2 text-muted hover:bg-ink/5 hover:text-ink dark:hover:bg-white/10"
          aria-label="Fermer"
          @click="sidebarOpen = false"
        >
          <X class="h-5 w-5" />
        </button>
      </div>
      <AdminSidebar @close="sidebarOpen = false" />
    </aside>

    <div class="flex min-h-screen flex-1 flex-col md:min-w-0">
      <header
        class="sticky top-0 z-30 flex items-center gap-3 border-b border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-night/95 md:hidden"
      >
        <button
          type="button"
          class="rounded-wax p-2 text-ink dark:text-paper"
          aria-label="Ouvrir le menu"
          @click="sidebarOpen = true"
        >
          <Menu class="h-5 w-5" />
        </button>
        <span class="font-serif text-sm tracking-[0.2em] text-ink dark:text-paper">Gestion WAXTU</span>
      </header>

      <main class="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
}>()

const emit = defineEmits<{
  close: []
}>()

watch(
  () => props.open,
  (v) => {
    if (!import.meta.client) return
    document.body.classList.toggle('overflow-hidden', v)
  },
  { immediate: true },
)

onUnmounted(() => {
  if (import.meta.client) document.body.classList.remove('overflow-hidden')
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm dark:bg-black/60"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>
    <Transition
      enter-active-class="transition-transform duration-200 ease-out"
      leave-active-class="transition-transform duration-200 ease-in"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="open"
        class="fixed inset-y-0 right-0 z-[101] flex w-full max-w-lg flex-col border-l border-ink/10 bg-paper shadow-2xl dark:border-white/10 dark:bg-night"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <header class="flex shrink-0 items-center justify-between gap-3 border-b border-ink/10 px-4 py-4 dark:border-white/10">
          <h2 class="min-w-0 font-serif text-lg text-ink dark:text-paper">
            {{ title }}
          </h2>
          <button
            type="button"
            class="rounded-wax p-2 text-muted transition hover:bg-ink/5 hover:text-ink dark:hover:bg-white/10 dark:hover:text-paper"
            aria-label="Fermer"
            @click="emit('close')"
          >
            <span class="text-xl leading-none" aria-hidden="true">×</span>
          </button>
        </header>
        <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <slot />
        </div>
        <footer
          v-if="$slots.footer"
          class="shrink-0 border-t border-ink/10 px-4 py-4 dark:border-white/10"
        >
          <slot name="footer" />
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

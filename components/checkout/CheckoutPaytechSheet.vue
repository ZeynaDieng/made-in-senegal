<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  url: string | null
  title: string
  hint: string
  fullPageLabel: string
}>()

const emit = defineEmits<{ close: [] }>()

const touchStartY = ref<number | null>(null)
const touchCurrentY = ref<number | null>(null)
const DRAG_MAX = 180
const dragOffset = ref(0)
const isDragging = ref(false)

const backdropOpacity = computed(() => {
  if (!props.open) return 0
  const base = 0.6
  const t = Math.min(1, dragOffset.value / DRAG_MAX)
  return base * (1 - 0.82 * t)
})

function onTouchStart(e: Event) {
  const te = e as TouchEvent
  touchStartY.value = te.touches[0]?.clientY ?? null
  touchCurrentY.value = touchStartY.value
  isDragging.value = true
}

function onTouchMove(e: Event) {
  if (touchStartY.value == null) return
  const te = e as TouchEvent
  touchCurrentY.value = te.touches[0]?.clientY ?? touchCurrentY.value
  const delta = (touchCurrentY.value ?? 0) - touchStartY.value
  dragOffset.value = Math.max(0, Math.min(delta, DRAG_MAX))
}

function onTouchEnd(e?: Event) {
  const te = e as TouchEvent | undefined
  const endY = te?.changedTouches?.[0]?.clientY
  if (touchStartY.value != null) {
    const current = endY ?? touchCurrentY.value
    if (current != null) {
      const delta = current - touchStartY.value
      if (delta > 72) emit('close')
    }
  }
  dragOffset.value = 0
  isDragging.value = false
  touchStartY.value = null
  touchCurrentY.value = null
}

function closeSheet() {
  emit('close')
}

function openFullPage() {
  const u = props.url?.trim()
  if (u) window.location.assign(u)
}

watch(
  () => props.open,
  (v) => {
    if (import.meta.client) {
      document.body.classList.toggle('overflow-hidden', v)
    }
  },
  { flush: 'post' },
)

onUnmounted(() => {
  if (import.meta.client) document.body.classList.remove('overflow-hidden')
})
</script>

<template>
  <Teleport to="body">
    <template v-if="open && url">
      <div
        class="fixed inset-0 z-[100] bg-ink backdrop-blur-sm"
        :class="[
          !open ? 'pointer-events-none' : '',
          isDragging ? '' : 'transition-opacity duration-500 ease-out',
        ]"
        :style="{ opacity: backdropOpacity }"
        @click.self="closeSheet"
      />
      <div
        class="fixed inset-x-0 bottom-0 z-[110] flex h-[92vh] w-full flex-col border-t border-ink/10 bg-paper shadow-lift transition-transform duration-500 ease-expo dark:border-white/10 dark:bg-night dark:shadow-liftDark md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-w-lg md:border-t-0 md:border-l"
        :class="[
          open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full',
          !open ? 'pointer-events-none' : '',
        ]"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd($event)"
      >
        <div
          class="flex h-full min-h-0 flex-col"
          :class="isDragging ? '' : 'transition-transform duration-200 ease-out'"
          :style="{ transform: `translateY(${dragOffset}px)` }"
        >
          <div class="mx-auto mt-2 h-1 w-12 shrink-0 bg-ink/20 md:hidden dark:bg-white/20" />
          <div class="flex shrink-0 items-center justify-between border-b border-ink/5 px-4 py-3 md:px-6 md:py-4">
            <h2 class="font-serif text-xl tracking-tight text-ink dark:text-paper md:text-2xl">
              {{ title }}
            </h2>
            <button
              type="button"
              class="rounded-wax p-2 text-ink transition hover:rotate-90 dark:text-paper"
              :aria-label="'Fermer'"
              @click="closeSheet"
            >
              <X class="h-6 w-6" />
            </button>
          </div>
          <p class="shrink-0 border-b border-ink/5 px-4 py-2 text-center text-xs text-muted md:px-6">
            {{ hint }}
            <button
              type="button"
              class="ml-1 font-bold uppercase tracking-wider text-gold underline decoration-gold/40 underline-offset-2"
              @click="openFullPage"
            >
              {{ fullPageLabel }}
            </button>
          </p>
          <div class="relative min-h-0 flex-1 bg-surface dark:bg-ink/40">
            <iframe
              :key="url"
              :src="url"
              class="absolute inset-0 h-full w-full border-0"
              title="PayTech"
              referrerpolicy="no-referrer-when-downgrade"
              allow="payment *; fullscreen; clipboard-write"
            />
          </div>
        </div>
      </div>
    </template>
  </Teleport>
</template>

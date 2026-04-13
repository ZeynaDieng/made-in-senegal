<script setup lang="ts">
import { ShoppingBag, Trash2, X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import type { CmsPromotions } from '../../types/cms'
import { useCartStore } from '../../stores/cart'

defineProps<{
  sitePromotions?: CmsPromotions | null
}>()

const cart = useCartStore()
const cmsImg = useCmsImg()
const formatPrice = useFormatPrice()
const cartTouchStartY = ref<number | null>(null)
const cartTouchCurrentY = ref<number | null>(null)
const CART_DRAG_MAX = 180
const cartDragOffset = ref(0)
const isCartDragging = ref(false)

const cartBackdropOpacity = computed(() => {
  if (!cart.isOpen) return 0
  const base = 0.6
  const t = Math.min(1, cartDragOffset.value / CART_DRAG_MAX)
  return base * (1 - 0.82 * t)
})

function onCartTouchStart(e: Event) {
  const touchEvent = e as TouchEvent
  cartTouchStartY.value = touchEvent.touches[0]?.clientY ?? null
  cartTouchCurrentY.value = cartTouchStartY.value
  isCartDragging.value = true
}

function onCartTouchMove(e: Event) {
  if (cartTouchStartY.value == null) return
  const touchEvent = e as TouchEvent
  cartTouchCurrentY.value = touchEvent.touches[0]?.clientY ?? cartTouchCurrentY.value
  const delta = (cartTouchCurrentY.value ?? 0) - cartTouchStartY.value
  cartDragOffset.value = Math.max(0, Math.min(delta, CART_DRAG_MAX))
}

function onCartTouchEnd(e?: Event) {
  const touchEvent = e as TouchEvent | undefined
  const endY = touchEvent?.changedTouches?.[0]?.clientY
  if (cartTouchStartY.value != null) {
    const current = endY ?? cartTouchCurrentY.value
    if (current != null) {
      const delta = current - cartTouchStartY.value
      if (delta > 72) cart.close()
    }
  }
  cartDragOffset.value = 0
  isCartDragging.value = false
  cartTouchStartY.value = null
  cartTouchCurrentY.value = null
}
</script>

<template>
  <div
    class="fixed inset-0 z-[80] bg-ink backdrop-blur-sm"
    :class="[
      !cart.isOpen ? 'pointer-events-none' : '',
      isCartDragging ? '' : 'transition-opacity duration-500 ease-out',
    ]"
    :style="{ opacity: cartBackdropOpacity }"
    @click.self="cart.close()"
  />
  <div
    class="fixed inset-x-0 bottom-0 z-[90] flex h-[88vh] w-full flex-col border-t border-ink/10 bg-paper shadow-lift transition-transform duration-500 ease-expo dark:border-white/10 dark:bg-night dark:shadow-liftDark md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-w-md md:border-t-0"
    :class="[
      cart.isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full',
      !cart.isOpen ? 'pointer-events-none' : '',
    ]"
    @touchstart="onCartTouchStart"
    @touchmove="onCartTouchMove"
    @touchend="onCartTouchEnd($event)"
  >
    <div
      class="flex h-full flex-col"
      :class="isCartDragging ? '' : 'transition-transform duration-200 ease-out'"
      :style="{ transform: `translateY(${cartDragOffset}px)` }"
    >
      <div class="mx-auto mt-2 h-1 w-12 bg-ink/20 md:hidden dark:bg-white/20" />
      <div class="flex items-center justify-between border-b border-ink/5 p-4 md:p-8">
        <h3 class="font-serif text-2xl tracking-tight text-ink dark:text-paper">Votre Sélection</h3>
        <button
          type="button"
          class="rounded-wax p-2 text-ink transition hover:rotate-90 dark:text-paper"
          @click="cart.close()"
        >
          <X class="h-6 w-6" />
        </button>
      </div>
      <div class="flex-1 space-y-8 overflow-y-auto p-4 md:p-8">
        <template v-if="cart.lines.length === 0">
          <div
            class="flex h-full flex-col items-center justify-center gap-4 text-center opacity-40"
          >
            <ShoppingBag class="h-12 w-12" :stroke-width="1" />
            <p class="font-serif italic text-ink dark:text-paper">Votre écrin est vide pour le moment.</p>
          </div>
        </template>
        <template v-else>
          <div
            v-for="line in cart.lines"
            :key="line.id"
            class="flex animate-fade-in gap-4 md:gap-6"
          >
            <div class="h-32 w-24 overflow-hidden bg-surface">
              <img
                :src="cmsImg(line.product.images[0])"
                :alt="line.product.name"
                class="h-full w-full object-cover"
                loading="lazy"
              >
            </div>
            <div class="flex-1 py-2">
              <h4 class="font-serif text-lg text-ink dark:text-paper">{{ line.product.name }}</h4>
              <ProductPriceTag class="mb-4" :product="line.product" compact :site-promotions="sitePromotions" />
              <div class="flex items-center gap-4">
                <div class="flex items-center border border-ink/10 dark:border-white/10">
                  <button
                    type="button"
                    class="px-3 py-1 text-sm hover:bg-surface dark:hover:bg-white/5"
                    @click="cart.decrement(line.id)"
                  >
                    -
                  </button>
                  <span class="px-3 text-xs">{{ line.qty }}</span>
                  <button
                    type="button"
                    class="px-3 py-1 text-sm hover:bg-surface dark:hover:bg-white/5"
                    @click="cart.increment(line.id)"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  class="text-ink/30 transition hover:text-ink dark:text-white/40 dark:hover:text-white"
                  @click="cart.remove(line.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div v-if="cart.lines.length" class="space-y-4 bg-ink p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-white md:space-y-6 md:p-8">
        <div class="flex items-center justify-between font-serif text-xl">
          <span class="italic opacity-60">Sous-total</span>
          <span>{{ formatPrice(cart.subtotal) }}</span>
        </div>
        <NuxtLink
          to="/checkout"
          class="block w-full bg-gold py-5 text-center text-xs font-bold uppercase tracking-[0.3em] text-white transition duration-500 hover:bg-paper hover:text-ink"
          @click="cart.close()"
        >
          Valider la commande
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

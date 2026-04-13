<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = `admin-img-${Math.random().toString(36).slice(2, 9)}`
const busy = ref(false)
const error = ref<string | null>(null)
const cmsImg = useCmsImg()

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  error.value = null
  busy.value = true
  try {
    const url = await uploadAdminMedia(file)
    emit('update:modelValue', url)
  }
  catch (err: unknown) {
    const e2 = err as { data?: { message?: string }; message?: string }
    error.value = e2.data?.message || e2.message || 'Échec de l’envoi'
  }
  finally {
    busy.value = false
  }
}

function onUrlInput(e: Event) {
  const el = e.target
  emit('update:modelValue', el instanceof HTMLInputElement ? el.value : '')
}
</script>

<template>
  <div class="space-y-2">
    <span v-if="label" class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">{{ label }}</span>
    <div class="flex flex-wrap items-start gap-3">
      <div
        v-if="modelValue?.trim()"
        class="relative h-24 w-24 shrink-0 overflow-hidden rounded-wax border border-ink/10 bg-ink/5 dark:border-white/10"
      >
        <img :src="cmsImg(modelValue)" alt="" class="h-full w-full object-cover">
      </div>
      <div class="min-w-0 flex-1 space-y-2">
        <input
          :id="inputId"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          class="block w-full max-w-xs text-xs text-muted file:mr-3 file:rounded-wax file:border file:border-ink/15 file:bg-paper file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wider dark:file:border-white/15 dark:file:bg-ink"
          :disabled="busy"
          @change="onFile"
        >
        <p v-if="busy" class="text-xs text-gold">
          Envoi en cours…
        </p>
        <p v-if="error" class="text-xs text-red-500" role="alert">
          {{ error }}
        </p>
        <label class="block text-[10px] uppercase tracking-wider text-muted">
          URL (optionnel, collage)
          <input
            :value="modelValue"
            class="mt-1 w-full rounded-wax border border-ink/10 bg-transparent px-2 py-1.5 font-mono text-[11px] dark:border-white/10"
            placeholder="/uploads/waxtu/ ou https://"
            @input="onUrlInput"
          >
        </label>
      </div>
    </div>
  </div>
</template>

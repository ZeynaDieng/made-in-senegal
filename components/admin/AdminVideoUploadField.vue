<script setup lang="ts">
defineProps<{
  /** URL .mp4 actuelle (upload ou collage dans le champ lien ci-dessous). */
  modelValue: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  /** Fichier envoyé : vider le lien YouTube côté parent pour éviter deux sources actives. */
  'local-file': []
}>()

const inputId = `admin-vid-${Math.random().toString(36).slice(2, 9)}`
const busy = ref(false)
const error = ref<string | null>(null)

async function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  error.value = null
  busy.value = true
  try {
    const url = await uploadAdminVideo(file)
    emit('update:modelValue', url)
    emit('local-file')
  }
  catch (err: unknown) {
    const e2 = err as { data?: { message?: string }; message?: string }
    error.value = e2.data?.message || e2.message || 'Échec de l’envoi'
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <span v-if="label" class="block text-xs font-bold uppercase tracking-[0.28em] text-muted">{{ label }}</span>
    <p v-if="modelValue?.trim()" class="break-all font-mono text-[11px] text-muted">
      {{ modelValue }}
    </p>
    <input
      :id="inputId"
      type="file"
      accept="video/mp4,.mp4"
      class="block w-full max-w-md text-xs text-muted file:mr-3 file:rounded-wax file:border file:border-ink/15 file:bg-paper file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-wider dark:file:border-white/15 dark:file:bg-ink"
      :disabled="busy"
      @change="onFile"
    >
    <p v-if="busy" class="text-xs text-gold">
      Envoi en cours (les gros fichiers peuvent prendre une minute)…
    </p>
    <p v-if="error" class="text-xs text-red-500" role="alert">
      {{ error }}
    </p>
  </div>
</template>

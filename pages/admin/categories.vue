<script setup lang="ts">
import type { CmsCategory, WaxtuCms } from '../../types/cms'
import { uniqueCategoryId } from '../../utils/category-slug'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })

const cms = ref<WaxtuCms | null>(null)
const status = ref<string | null>(null)
const drawerOpen = ref(false)
const editing = ref<CmsCategory | null>(null)
const draftName = ref('')

async function load() {
  const token = localStorage.getItem('waxtu-admin-token')
  cms.value = await $fetch<WaxtuCms>('/api/cms/admin', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

onMounted(load)

function openAdd() {
  editing.value = null
  draftName.value = ''
  drawerOpen.value = true
}

function openEdit(c: CmsCategory) {
  editing.value = { ...c }
  draftName.value = c.name
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
  editing.value = null
  draftName.value = ''
}

function syncProductLabels() {
  if (!cms.value) return
  for (const p of cms.value.products) {
    const lab = cms.value.categories.find((c) => c.id === p.categoryId)
    if (lab) p.category = lab.name
  }
}

async function persist(message: string) {
  if (!cms.value || !import.meta.client) return
  const token = localStorage.getItem('waxtu-admin-token')
  if (!token) return
  try {
    cms.value = await $fetch<WaxtuCms>('/api/cms/admin', {
      method: 'PUT',
      body: cms.value,
      headers: { Authorization: `Bearer ${token}` },
    })
    await refreshNuxtData('waxtu-cms-public')
    status.value = message
    window.setTimeout(() => (status.value = null), 3200)
  }
  catch {
    status.value = 'Enregistrement impossible. Reconnectez-vous ou réessayez.'
    window.setTimeout(() => (status.value = null), 5000)
  }
}

async function saveDrawer() {
  if (!cms.value) return
  const name = draftName.value.trim()
  if (!name) {
    status.value = 'Indiquez un nom de catégorie.'
    window.setTimeout(() => (status.value = null), 2500)
    return
  }
  if (editing.value) {
    const c = cms.value.categories.find((x) => x.id === editing.value!.id)
    if (c) c.name = name
    syncProductLabels()
    await persist('Catégorie mise à jour.')
  }
  else {
    const id = uniqueCategoryId(name, cms.value.categories)
    cms.value.categories.push({ id, name })
    syncProductLabels()
    await persist('Catégorie ajoutée.')
  }
  closeDrawer()
}

async function removeCategory(c: CmsCategory) {
  if (!cms.value) return
  if (cms.value.categories.length <= 1) {
    status.value = 'Il doit rester au moins une catégorie.'
    window.setTimeout(() => (status.value = null), 3000)
    return
  }
  const fallback = cms.value.categories.find((x) => x.id !== c.id)
  if (!fallback) return
  const n = cms.value.products.filter((p) => p.categoryId === c.id).length
  if (!confirm(`Supprimer  ${c.name}  ? ${n} produit(s) seront rangés dans  ${fallback.name} .`)) return
  for (const p of cms.value.products) {
    if (p.categoryId === c.id) {
      p.categoryId = fallback.id
      p.category = fallback.name
    }
  }
  cms.value.categories = cms.value.categories.filter((x) => x.id !== c.id)
  await persist('Catégorie supprimée.')
}

const cell = 'border-b border-ink/10 px-3 py-3 text-sm dark:border-white/10'

useHead({ title: 'Catégories — Admin WAXTU' })
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.35em] text-gold">Boutique</p>
        <h1 class="font-serif text-3xl text-ink dark:text-paper md:text-4xl">
          Catégories
        </h1>
        <p class="mt-1 text-sm text-muted">
          Les catégories servent aux filtres de la page Boutique et au choix lors de la création d’un produit.
        </p>
      </div>
      <button
        type="button"
        class="rounded-wax bg-ink px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white dark:bg-paper dark:text-ink"
        @click="openAdd"
      >
        Ajouter
      </button>
    </div>

    <p v-if="status" class="text-sm text-gold">
      {{ status }}
    </p>

    <div v-if="cms" class="overflow-hidden rounded-wax border border-ink/10 bg-paper dark:border-white/10 dark:bg-ink">
      <table class="w-full text-left">
        <thead class="border-b border-ink/10 bg-ink/[0.03] text-xs font-bold uppercase tracking-[0.2em] text-muted dark:border-white/10 dark:bg-white/[0.04]">
          <tr>
            <th class="px-3 py-3">
              Nom affiché
            </th>
            <th class="hidden px-3 py-3 sm:table-cell">
              Identifiant
            </th>
            <th class="px-3 py-3 text-right" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in cms.categories" :key="c.id" class="hover:bg-gold/[0.06] dark:hover:bg-white/[0.04]">
            <td :class="cell + ' font-medium text-ink dark:text-paper'">
              {{ c.name }}
            </td>
            <td :class="cell + ' hidden font-mono text-xs text-muted sm:table-cell'">
              {{ c.id }}
            </td>
            <td :class="cell + ' text-right'">
              <button
                type="button"
                class="mr-2 rounded-wax border border-ink/15 px-2 py-1 text-[10px] font-bold uppercase dark:border-white/15"
                @click="openEdit(c)"
              >
                Modifier
              </button>
              <button
                type="button"
                class="rounded-wax border border-red-500/30 px-2 py-1 text-[10px] font-bold uppercase text-red-600 dark:text-red-300"
                @click="removeCategory(c)"
              >
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminDrawer :open="drawerOpen" :title="editing ? 'Modifier la catégorie' : 'Nouvelle catégorie'" @close="closeDrawer">
      <div class="space-y-4">
        <p v-if="editing" class="text-xs text-muted">
          L’identifiant technique reste <span class="font-mono text-ink dark:text-paper">{{ editing.id }}</span> (liens internes). Vous pouvez changer le nom affiché.
        </p>
        <label class="block text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Nom
          <input
            v-model="draftName"
            type="text"
            class="mt-1 w-full rounded-wax border border-ink/10 bg-transparent px-3 py-2 text-sm dark:border-white/10"
            placeholder="Ex. Maroquinerie"
          >
        </label>
      </div>
      <template #footer>
        <div class="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="rounded-wax border border-ink/15 px-4 py-2 text-xs font-bold uppercase dark:border-white/15"
            @click="closeDrawer"
          >
            Annuler
          </button>
          <button
            type="button"
            class="rounded-wax bg-ink px-4 py-2 text-xs font-bold uppercase text-white dark:bg-paper dark:text-ink"
            @click="saveDrawer"
          >
            Enregistrer
          </button>
        </div>
      </template>
    </AdminDrawer>
  </div>
</template>

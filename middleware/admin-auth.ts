export default defineNuxtRouteMiddleware((to) => {
  if (!import.meta.client) return
  if (!to.path.startsWith('/admin')) return
  if (to.path === '/admin/login') return
  const token = localStorage.getItem('waxtu-admin-token')
  if (!token) return navigateTo('/admin/login')
})

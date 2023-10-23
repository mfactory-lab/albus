import { createRouter, createWebHistory } from 'vue-router'
import type { App } from 'vue'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from '~pages'

const routes = setupLayouts(generatedRoutes)

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

// config router
export function setupRouter(app: App<Element>) {
  app.use(router)
}

import type { App } from 'vue'
import { createHead } from '@vueuse/head'
import { setupRouter } from '@/router'

export function install({ app }: { app: App<Element> }) {
  app.use(createHead())
  setupRouter(app)
}

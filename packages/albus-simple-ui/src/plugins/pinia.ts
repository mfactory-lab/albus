import { createPinia } from 'pinia'
import type { App } from 'vue'

export function install({ app }: { app: App<Element> }) {
  const pinia = createPinia()
  app.use(pinia)
}

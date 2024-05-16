import type { QuasarPluginOptions } from 'quasar'
import { Dark, Loading, LocalStorage, Notify, Quasar } from 'quasar'
import iconSet from 'quasar/icon-set/svg-eva-icons'
import type { App } from 'vue'

// Import Quasar css
import 'quasar/src/css/index.sass'

export function install({ app }: { app: App<Element> }) {
  app.use(Quasar, {
    plugins: {
      Notify,
      LocalStorage,
      Dark,
      Loading,
    },
    iconSet,
  } as QuasarPluginOptions)
}

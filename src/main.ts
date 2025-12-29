import { ClickScrollPlugin, OverlayScrollbars } from 'overlayscrollbars'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import toastification from 'vue-toastification'
import App from '@/App.vue'
import 'vue-toastification/dist/index.css'
import 'overlayscrollbars/overlayscrollbars.css'
import '@/assets/tailwind.css'
import '@/assets/style.css'

OverlayScrollbars.plugin(ClickScrollPlugin)

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(toastification)
app.use(pinia)

app.mount('#app')

import { createPinia } from 'pinia'
import toastification from 'vue-toastification'

import App from '@/App.vue'
import '@/assets/tailwind.css'
import 'vue-toastification/dist/index.css'

const app = createApp(App)

const pinia = createPinia()

app.use(toastification)
app.use(pinia)

app.mount('#app')

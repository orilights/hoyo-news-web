import toastification from 'vue-toastification'
import App from '@/App.vue'

import '@/assets/tailwind.css'
import 'vue-toastification/dist/index.css'

const app = createApp(App)

app.use(toastification)

app.mount('#app')

import './styles/tokens.css'
import './styles/base.css'
import '@fontsource/syne/700.css'
import '@fontsource/onest/400.css'
import '@fontsource/onest/500.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/ibm-plex-sans-arabic/400.css'
import '@fontsource/ibm-plex-sans-arabic/500.css'
import './styles/app.css'
import { createRoot } from 'react-dom/client'
import App from './App'
import { registerSW } from './sw-register'

registerSW()

createRoot(document.getElementById('root')!).render(<App />)

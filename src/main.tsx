import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { enterDemoModeFromUrl } from './lib/demo'

// Precisa rodar antes do app ler o operador salvo no navegador.
enterDemoModeFromUrl()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { App } from './App'
import './styles/app.css'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App pfad={location.pathname} />
  </StrictMode>
)

// Vorgerendert (Build) → hydrieren; im Dev-Server ist #root leer → neu rendern.
if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)

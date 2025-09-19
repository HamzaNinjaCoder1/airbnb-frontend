import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
// axios defaults are centralized in src/api.js
import { setupNotifications } from './push'
// Import notification test utilities in development
if (!import.meta.env.PROD) {
  import('./utils/notificationTest.js')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
if (import.meta.env.PROD && window.location.protocol === 'https:') {
  setupNotifications().catch(() => {});
}
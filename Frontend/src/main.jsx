import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

// One-time migration: clear any stale user session from localStorage
// (app now uses sessionStorage so sessions expire when the tab closes)
localStorage.removeItem('digilib_user');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

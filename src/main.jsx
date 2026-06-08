import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import ReactGA from 'react-ga4'
import App from './App.jsx'
import './i18n.js'
import './styles.css'

// Google Analytics 4: solo si VITE_GA_ID está definida (en Vercel para producción).
const GA_ID = import.meta.env.VITE_GA_ID
if (GA_ID) ReactGA.initialize(GA_ID)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

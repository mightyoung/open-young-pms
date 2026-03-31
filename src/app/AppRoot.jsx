import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppProviders from './providers'
import AppRoutes from './routes'

export default function AppRoot() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  )
}

import React from 'react'
import { AuthProvider } from '../contexts/AuthContext'
import { PermissionProvider } from '../contexts/PermissionContext'
import { useAuth } from '../hooks/useAuth'

function PermissionBridge({ children }) {
  const { user } = useAuth()
  return <PermissionProvider user={user}>{children}</PermissionProvider>
}

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <PermissionBridge>{children}</PermissionBridge>
    </AuthProvider>
  )
}

export default AppProviders

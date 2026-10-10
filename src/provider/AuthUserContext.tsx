'use client'
import { createContext, useContext } from 'react'
import useAppStore from '@/store'
import { AuthState } from '@/store/slices/auth.slice'
const authUserContext = createContext<AuthState | undefined>(undefined)

export function AuthUserProvider({ children }: { children: React.ReactNode }) {
  const user = useAppStore(state => state.auth.user);
  const isLoading = useAppStore(state => state.auth.isLoading);
  const isAuthenticated = useAppStore(state => state.auth.isAuthenticated);
  const token = useAppStore(state => state.auth.token);
  const refreshToken = useAppStore(state => state.auth.refreshToken);
  const error = useAppStore(state => state.auth.error);
  const loginAttempts = useAppStore(state => state.auth.loginAttempts);

  return (
    <authUserContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!isAuthenticated,
        isLoading: !!isLoading,
        token,
        refreshToken,
        error,
        loginAttempts,
      }}
    >
      {children}
    </authUserContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(authUserContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthUserProvider')
  }
  return context
}

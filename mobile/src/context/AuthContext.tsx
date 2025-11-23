import React from 'react'

interface AuthContextType {
  signIn: (token: string, user: any) => Promise<void>
  signOut: () => Promise<void>
  user: any
}

export const AuthContext = React.createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  user: null,
})


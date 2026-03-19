import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthPromptContextType {
  isOpen: boolean;
  openAuthPrompt: () => void;
  closeAuthPrompt: () => void;
}

const AuthPromptContext = createContext<AuthPromptContextType | undefined>(undefined);

export function AuthPromptProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openAuthPrompt = () => setIsOpen(true);
  const closeAuthPrompt = () => setIsOpen(false);

  return (
    <AuthPromptContext.Provider value={{ isOpen, openAuthPrompt, closeAuthPrompt }}>
      {children}
    </AuthPromptContext.Provider>
  );
}

export function useAuthPrompt() {
  const context = useContext(AuthPromptContext);
  if (context === undefined) {
    throw new Error('useAuthPrompt must be used within an AuthPromptProvider');
  }
  return context;
}

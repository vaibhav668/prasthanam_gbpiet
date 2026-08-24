import { createContext, useContext, useState, ReactNode } from 'react'

type TranslationKey = string

type Translations = Record<TranslationKey, string>

interface I18nContextType {
  locale: string
  setLocale: (locale: string) => void
  t: (key: TranslationKey) => string
}

const translations: Record<string, Translations> = {
  en: {
    'nav.home': 'Home',
    'nav.forum': 'Forum',
    'nav.chat': 'Chat',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'chat.welcome': 'Welcome to Chat',
    'chat.selectRoom': 'Select a chatroom to start messaging',
    'chat.noRooms': 'No chatrooms yet',
    'chat.typeMessage': 'Type a message...',
    'chat.connected': 'Connected',
    'chat.disconnected': 'Disconnected',
    'forum.noThreads': 'No threads yet',
    'forum.createThread': 'Create Thread',
    'forum.search': 'Search threads...',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.username': 'Username',
  },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState('en')

  const t = (key: TranslationKey): string => {
    return translations[locale]?.[key] || translations.en[key] || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Header from './components/Header'
import EventInfo from './components/EventInfo'
import RegistrationForm from './components/RegistrationForm'
import PaymentScreen from './components/PaymentScreen'
import AdminPanel from './components/AdminPanel'

export default function App() {
  const [view, setView] = useState('registro') // registro | pago | admin
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  function handleRegistered(r) {
    setResult(r)
    setView('pago')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetRegistro() {
    setResult(null)
    setView('registro')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      <Header view={view} setView={setView} isAdmin={!!session} />

      {view === 'registro' && <EventInfo />}

      <main className="mx-auto max-w-4xl px-4 pb-24 sm:px-6">
        {view === 'registro' && (
          <RegistrationForm onRegistered={handleRegistered} />
        )}
        {view === 'pago' && result && (
          <div className="pt-8">
            <PaymentScreen result={result} onDone={resetRegistro} />
          </div>
        )}
        {view === 'admin' && (
          <div className="pt-6">
            <AdminPanel session={session} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-cream/60">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-ink/50 sm:px-6">
        <span className="font-display text-lg text-wine">音葉</span>
        <p>Evento Otoha · Sistema de reservas</p>
      </div>
    </footer>
  )
}

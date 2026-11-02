import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BASE_PATH } from './config/env'
import { SiteProvider } from './context/site-context'
import { ContentDetailPage } from './pages/ContentDetail'
import { InformationPage } from './pages/Information'
import { LandingPage } from './pages/Landing'
import { QdiDevelopmentPage } from './pages/QdiDevelopment'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />
        <Route
          path="/informasi"
          element={
            <PageTransition>
              <InformationPage />
            </PageTransition>
          }
        />
        <Route
          path="/qdi"
          element={
            <PageTransition>
              <QdiDevelopmentPage />
            </PageTransition>
          }
        />
        <Route
          path="/konten/:slug"
          element={
            <PageTransition>
              <ContentDetailPage />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export function App() {
  const basename = BASE_PATH === '/' ? undefined : BASE_PATH.replace(/\/$/, '')

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <BrowserRouter basename={basename}>
          <SiteProvider>
            <AnimatedRoutes />
          </SiteProvider>
        </BrowserRouter>
      </MotionConfig>
    </QueryClientProvider>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'
import PortalAccess from './pages/PortalAccess'
import UserLayout from './components/UserLayout'
import UserHome from './pages/UserHome'
import UserBrowse from './pages/UserBrowse'
import About from './pages/About'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminAdvisories from './pages/AdminAdvisories'
import AdminEditor from './pages/AdminEditor'
import AdminLibrary from './pages/AdminLibrary'
import AdvisoryDetail from './pages/AdvisoryDetail'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortalAccess />} />

      <Route path="/user" element={<UserLayout />}>
        <Route index element={<UserHome />} />
        <Route path="watch" element={<UserBrowse section="watch" />} />
        <Route path="issues" element={<UserBrowse section="issues" />} />
        <Route path="advisories" element={<UserBrowse section="advisories" />} />
        <Route path="solutions" element={<UserBrowse section="solutions" />} />
        <Route path="videos" element={<UserBrowse section="videos" />} />
        <Route path="case-studies" element={<UserBrowse section="case-studies" />} />
        <Route path="about" element={<About />} />
        <Route path="content/:id" element={<AdvisoryDetail />} />
      </Route>

      <Route path="/advisories/:id" element={<AdvisoryDetail />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
      <Route path="/admin/advisories" element={<RequireAuth><AdminAdvisories /></RequireAuth>} />
      <Route path="/admin/advisories/new" element={<RequireAuth><AdminEditor /></RequireAuth>} />
      <Route path="/admin/advisories/:id/edit" element={<RequireAuth><AdminEditor /></RequireAuth>} />
      <Route path="/admin/library" element={<RequireAuth><AdminLibrary /></RequireAuth>} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}

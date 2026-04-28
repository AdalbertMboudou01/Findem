import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeContext';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Offers from './pages/Offers';
import Candidates from './pages/Candidates';
import CandidateDetail, { CandidateEmpty } from './pages/CandidateDetail';
import Chatbot from './pages/Chatbot';
import Entreprise from './pages/Entreprise';
import CandidateChatbot from './pages/CandidateChatbot';
import OfferSettings from './pages/OfferSettings';
import OfferPriority from './pages/OfferPriority';
import CompanyOnboarding from './pages/CompanyOnboarding';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-t-bg3">
        <div className="w-6 h-6 border-2 border-t-brand-80 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const requiresOnboarding = !user.onboardingCompleted;
  if (requiresOnboarding && location.pathname !== '/entreprise/setup') {
    return <Navigate to="/entreprise/setup" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/landing" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/apply/:jobId" element={<CandidateChatbot />} />

      {/* Protected */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/offers/:offerId/settings" element={<OfferSettings />} />
        <Route path="/offers/:offerId/priority" element={<OfferPriority />} />
        <Route path="/candidates" element={<Candidates />}>
          <Route index element={<CandidateEmpty />} />
          <Route path=":id" element={<CandidateDetail />} />
        </Route>
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/entreprise" element={<Entreprise />} />
        <Route path="/entreprise/setup" element={<CompanyOnboarding />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

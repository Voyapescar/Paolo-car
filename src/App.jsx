import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VehicleProvider } from './context/VehicleContext';
import { ConfigProvider } from './context/ConfigContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Fleet from './components/Fleet';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Fleet />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <VehicleProvider>
        <ConfigProvider>
          <Router>
            <div className="min-h-screen bg-obsidian-900">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </ConfigProvider>
      </VehicleProvider>
    </AuthProvider>
  );
}

export default App;

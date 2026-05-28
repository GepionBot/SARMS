import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/dashboard';
import Athletes from './pages/Athletes';
import AthleteProfile from './pages/AthleteProfile';
import AthleteForm from './pages/AthleteForm';
import Teams from './pages/Teams';
import TeamForm from './pages/TeamForm';
import Events from './pages/Events';
import EventForm from './pages/EventForm';
import EventDetail from './pages/EventDetail';
import Reports from './pages/Reports';
import Gallery from './pages/Gallery';
import UsersManagement from './pages/UsersManagement';
import PerformancePage from './pages/PerformancePage';
import AthleteSchedule from './pages/AthleteSchedule';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === 'admin') {
    return children;
  }

  if (!user.verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Account Pending Verification</h2>
          <p className="text-slate-500">Your account is awaiting administrator approval.</p>
          <a
            href="/"
            className="inline-block mt-4 mr-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Return to Home
          </a>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="inline-block mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : children;
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:ml-64 transition-all duration-300">
        <main className="pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/athletes" element={
          <ProtectedRoute>
            <AppLayout>
              <Athletes />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/athletes/add" element={
          <ProtectedRoute>
            <AppLayout>
              <AthleteForm />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/athletes/:id" element={
          <ProtectedRoute>
            <AppLayout>
              <AthleteProfile />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/athletes/:id/edit" element={
          <ProtectedRoute>
            <AppLayout>
              <AthleteForm />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/teams" element={
          <ProtectedRoute>
            <AppLayout>
              <Teams />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/teams/add" element={
          <ProtectedRoute>
            <AppLayout>
              <TeamForm />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/teams/:id/edit" element={
          <ProtectedRoute>
            <AppLayout>
              <TeamForm />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/events" element={
          <ProtectedRoute>
            <AppLayout>
              <Events />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/events/add" element={
          <ProtectedRoute>
            <AppLayout>
              <EventForm />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/events/:id/edit" element={
          <ProtectedRoute>
            <AppLayout>
              <EventForm />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/events/:id" element={
          <ProtectedRoute>
            <AppLayout>
              <EventDetail />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute>
            <AppLayout>
              <Reports />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/gallery" element={
          <ProtectedRoute>
            <AppLayout>
              <Gallery />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <AppLayout>
              <UsersManagement />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/performance" element={
          <ProtectedRoute>
            <AppLayout>
              <PerformancePage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
         <Route path="/performance/:id" element={
           <ProtectedRoute>
             <AppLayout>
               <PerformancePage />
             </AppLayout>
           </ProtectedRoute>
         } />
         
<Route path="/schedule" element={
            <ProtectedRoute>
              <AppLayout>
                <AthleteSchedule />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/my-profile" element={
            <ProtectedRoute>
              <AppLayout>
                <AthleteProfile isMyProfile={true} />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X,
  GraduationCap
} from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage || !user) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <GraduationCap className="text-blue-600" size={28} />
              <span className="font-bold text-xl text-slate-800">SARMS</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link 
                to="/about" 
                className="text-slate-600 hover:text-slate-800 font-medium"
              >
                About
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return null;
};

export default Header;

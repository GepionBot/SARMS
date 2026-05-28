import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Calendar, 
  Image, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  TrendingUp,
  CalendarDays
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['coach', 'sport_coordinator', 'athlete'] },
    { icon: TrendingUp, label: 'Performance', path: '/performance', roles: ['coach', 'sport_coordinator', 'athlete'] },
    { icon: CalendarDays, label: 'Schedule', path: '/schedule', roles: ['coach', 'sport_coordinator', 'athlete'] },
    { icon: Users, label: 'My Profile', path: '/my-profile', roles: ['athlete'] },
    { icon: Users, label: 'Athletes', path: '/athletes', roles: ['coach', 'sport_coordinator'] },
    { icon: Trophy, label: 'Teams', path: '/teams', roles: ['coach', 'sport_coordinator'] },
    { icon: Calendar, label: 'Events', path: '/events', roles: ['coach', 'sport_coordinator'] },
    { icon: Image, label: 'Gallery', path: '/gallery', roles: ['coach', 'sport_coordinator', 'athlete'] },
    { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['coach', 'sport_coordinator'] },
    { icon: Users, label: 'User Management', path: '/users', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`
        fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-40
        transition-transform duration-300 ease-in-out
        w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Trophy className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">SARMS</h1>
                <p className="text-xs text-slate-500">ACLC College</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive(item.path) 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }
                `}
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

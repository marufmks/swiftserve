import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, ChefHat, ShoppingBag, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { to: '/', icon: ShoppingBag, label: 'Menu', roles: ['customer'] },
    { to: '/kitchen', icon: ChefHat, label: 'Kitchen', roles: ['admin'] },
    { to: '/driver', icon: Truck, label: 'Driver', roles: ['driver', 'admin'] },
    { to: '/admin', icon: User, label: 'Admin', roles: ['admin'] },
  ];

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-orange-500">
            SwiftServe
          </Link>

          <div className="flex items-center space-x-6">
            {filteredNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:text-red-400 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

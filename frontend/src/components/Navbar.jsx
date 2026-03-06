import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX, HiUser, HiLogout, HiHome, HiViewGrid, HiHeart } from 'react-icons/hi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Predictnest</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Home</Link>
            <Link to="/rooms" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Rooms</Link>
            <Link to="/about" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">About</Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full pl-3 pr-4 py-2 transition-colors"
                >
                  <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{user.name?.[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name?.split(' ')[0]}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 fade-in">
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                      <HiViewGrid className="mr-3 text-gray-400" /> Dashboard
                    </Link>
                    <Link to="/dashboard/saved" onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                      <HiHeart className="mr-3 text-gray-400" /> Saved Rooms
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                        <HiUser className="mr-3 text-gray-400" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50">
                      <HiLogout className="mr-3" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm !py-2 !px-5">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 fade-in">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-primary-600">Home</Link>
            <Link to="/rooms" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-primary-600">Rooms</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-primary-600">About</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-primary-600">Dashboard</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-primary-600">Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="block py-2 text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-primary-600">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block py-2 text-primary-600 font-semibold">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

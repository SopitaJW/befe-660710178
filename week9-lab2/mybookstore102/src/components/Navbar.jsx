import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  SearchIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  LogoutIcon,
} from '@heroicons/react/outline';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(3);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('isAdminAuthenticated');
    setIsAdminAuthenticated(auth === 'true');
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 bg-viridian-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold text-viridian-600 group-hover:text-viridian-700 transition-colors">
              BookStore
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-gray-700 hover:text-viridian-600 transition-colors font-medium ${
                  isActive
                    ? 'text-viridian-600 border-b-2 border-viridian-600'
                    : ''
                }`
              }
            >
              หน้าแรก
            </NavLink>
            <NavLink
              to="/books"
              className={({ isActive }) =>
                `text-gray-700 hover:text-viridian-600 transition-colors font-medium ${
                  isActive
                    ? 'text-viridian-600 border-b-2 border-viridian-600'
                    : ''
                }`
              }
            >
              หนังสือ
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `text-gray-700 hover:text-viridian-600 transition-colors font-medium ${
                  isActive
                    ? 'text-viridian-600 border-b-2 border-viridian-600'
                    : ''
                }`
              }
            >
              หมวดหมู่
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-gray-700 hover:text-viridian-600 transition-colors font-medium ${
                  isActive
                    ? 'text-viridian-600 border-b-2 border-viridian-600'
                    : ''
                }`
              }
            >
              เกี่ยวกับเรา
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-gray-700 hover:text-viridian-600 transition-colors font-medium ${
                  isActive
                    ? 'text-viridian-600 border-b-2 border-viridian-600'
                    : ''
                }`
              }
            >
              ติดต่อ
            </NavLink>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-viridian-600 transition-colors">
              <SearchIcon className="h-6 w-6" />
            </button>

            <button className="relative p-2 text-gray-600 hover:text-viridian-600 transition-colors">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* 🔐 ถ้ายังไม่ล็อกอิน → แสดงปุ่มเข้าสู่ระบบ */}
            {!isAdminAuthenticated ? (
              <Link
                to="/login"
                className="flex items-center space-x-1 bg-viridian-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-viridian-700 transition-colors"
              >
                <UserIcon className="h-5 w-5" />
                <span>เข้าสู่ระบบ</span>
              </Link>
            ) : (
              // 🔓 ถ้าล็อกอินแล้ว → แสดงปุ่มออกจากระบบ
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                <LogoutIcon className="h-5 w-5" />
                <span>ออกจากระบบ</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-viridian-600 transition-colors"
              onClick={toggleMenu}
            >
              {isMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="py-4 border-t">
            <NavLink
              to="/"
              className="block py-2 text-gray-700 hover:text-viridian-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              หน้าแรก
            </NavLink>
            <NavLink
              to="/books"
              className="block py-2 text-gray-700 hover:text-viridian-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              หนังสือ
            </NavLink>
            <NavLink
              to="/categories"
              className="block py-2 text-gray-700 hover:text-viridian-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              หมวดหมู่
            </NavLink>
            <NavLink
              to="/about"
              className="block py-2 text-gray-700 hover:text-viridian-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              เกี่ยวกับเรา
            </NavLink>
            <NavLink
              to="/contact"
              className="block py-2 text-gray-700 hover:text-viridian-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              ติดต่อ
            </NavLink>

            {/* แสดง login/logout ใน mobile ด้วย */}
            <div className="mt-4">
              {!isAdminAuthenticated ? (
                <Link
                  to="/login"
                  className="block w-full text-center bg-viridian-600 text-white py-2 rounded-lg font-medium hover:bg-viridian-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  เข้าสู่ระบบ
                </Link>
              ) : (
                <button
                  onClick={handleLogout}
                  className="block w-full text-center bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  ออกจากระบบ
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

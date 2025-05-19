// src/App.tsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiCode, FiFileText, FiHome, FiLink, FiLogIn, FiLogOut, FiMenu, FiUser, FiUserPlus, FiX } from 'react-icons/fi';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import { HomePage } from './components/HomePage';
import { MarkdownNotes } from './components/MarkdownNotes';
import Profile from './components/Profile';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Footer from './components/layout/Footer';
import LinkForm from './components/links/LinkForm';
import LinksDashboard from './components/links/LinksDashboard';
import SnippetForm from './components/snippets/SnippetForm';
import SnippetsDashboard from './components/snippets/SnippetsDashboard';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function NavLink({ to, children, icon: Icon, onClick }: { 
  to: string; 
  children: React.ReactNode; 
  icon: React.ElementType;
  onClick?: () => void 
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 ${
        isActive ? 'font-semibold' : ''
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`} />
      <span>{children}</span>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
}

function MobileNavLink({ to, children, icon: Icon, onClick }: { 
  to: string; 
  children: React.ReactNode; 
  icon: React.ElementType;
  onClick?: () => void 
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`} />
      <span>{children}</span>
    </Link>
  );
}

function AppContent() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                <FiHome className="w-6 h-6" />
                <span className="hidden sm:inline">DevVault</span>
              </Link>
            </motion.div>

            {/* Hamburger button for mobile */}
            <motion.button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiX className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiMenu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="hidden lg:flex items-center space-x-1 xl:space-x-6"
            >
              {user ? (
                <>
                  <NavLink to="/dashboard" icon={FiHome}>Dashboard</NavLink>
                  <NavLink to="/links" icon={FiLink}>Enlaces</NavLink>
                  <NavLink to="/snippets" icon={FiCode}>Snippets</NavLink>
                  <NavLink to="/notes" icon={FiFileText}>Notas</NavLink>
                  <NavLink to="/profile" icon={FiUser}>Perfil</NavLink>
                  <motion.button
                    onClick={signOut}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <NavLink to="/login" icon={FiLogIn}>Iniciar Sesión</NavLink>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/register"
                      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <FiUserPlus className="w-4 h-4" />
                      <span>Registrarse</span>
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="py-4 space-y-1"
                >
                  {user ? (
                    <>
                      <MobileNavLink to="/dashboard" icon={FiHome}>Dashboard</MobileNavLink>
                      <MobileNavLink to="/links" icon={FiLink}>Enlaces</MobileNavLink>
                      <MobileNavLink to="/snippets" icon={FiCode}>Snippets</MobileNavLink>
                      <MobileNavLink to="/notes" icon={FiFileText}>Notas</MobileNavLink>
                      <MobileNavLink to="/profile" icon={FiUser}>Perfil</MobileNavLink>
                      <motion.button
                        onClick={signOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <MobileNavLink to="/login" icon={FiLogIn}>Iniciar Sesión</MobileNavLink>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to="/register"
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <FiUserPlus className="w-4 h-4" />
                          <span>Registrarse</span>
                        </Link>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={!user ? <HomePage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/links"
              element={
                <PrivateRoute>
                  <LinksDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/links/new"
              element={
                <PrivateRoute>
                  <LinkForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/links/:id"
              element={
                <PrivateRoute>
                  <LinkForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/snippets"
              element={
                <PrivateRoute>
                  <SnippetsDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/snippets/new"
              element={
                <PrivateRoute>
                  <SnippetForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/snippets/:id"
              element={
                <PrivateRoute>
                  <SnippetForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <PrivateRoute>
                  <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)]">
                      <MarkdownNotes />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />

            <Route
              path="/notes/:id"
              element={
                <PrivateRoute>
                  <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)]">
                      <MarkdownNotes />
                    </div>
                  </div>
                </PrivateRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}

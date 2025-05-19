import { FiCode, FiFileText, FiHome, FiLink, FiLogIn, FiLogOut, FiUser, FiUserPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Footer() {
  const { user, signOut } = useAuth();

  const unauthenticatedLinks = [
    { to: '/', icon: FiHome, text: 'Dashboard' },
    { to: '/login', icon: FiLogIn, text: 'Iniciar Sesión' },
    { to: '/register', icon: FiUserPlus, text: 'Registrarse' }
  ];

  const authenticatedLinks = [
    { to: '/dashboard', icon: FiHome, text: 'Dashboard' },
    { to: '/links', icon: FiLink, text: 'Enlaces' },
    { to: '/snippets', icon: FiCode, text: 'Snippets' },
    { to: '/notes', icon: FiFileText, text: 'Notas' },
    { to: '/profile', icon: FiUser, text: 'Perfil' }
  ];

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:justify-between md:items-center">
          {/* Logo and Brand */}
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <FiHome className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">DevVault</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
            {(user ? authenticatedLinks : unauthenticatedLinks).map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center space-x-1 text-sm md:text-base text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
              >
                <link.icon className="w-4 h-4 md:w-5 md:h-5" />
                <span>{link.text}</span>
              </Link>
            ))}
            {user && (
              <button
                onClick={signOut}
                className="flex items-center space-x-1 text-sm md:text-base text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md px-2 py-1"
              >
                <FiLogOut className="w-4 h-4 md:w-5 md:h-5" />
                <span>Cerrar Sesión</span>
              </button>
            )}
          </nav>

          {/* Copyright */}
          <div className="text-center md:text-right text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} DevVault. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 
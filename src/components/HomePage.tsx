import { FiArrowRight, FiCode, FiFileText, FiLink } from 'react-icons/fi'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Tu Bóveda Personal de Desarrollo
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 text-blue-100 max-w-2xl mx-auto">
              Organiza tus recursos, snippets y notas en un solo lugar seguro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                Comenzar Ahora
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900 dark:text-white">
            Todo lo que necesitas en un solo lugar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Links Feature */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <FiLink className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Gestor de Enlaces
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                Guarda y organiza tus enlaces favoritos con etiquetas y categorías personalizadas.
              </p>
            </div>

            {/* Snippets Feature */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <FiCode className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Snippets de Código
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                Almacena y organiza tus fragmentos de código con resaltado de sintaxis.
              </p>
            </div>

            {/* Notes Feature */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <FiFileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Notas Markdown
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
                Crea y edita notas con soporte para Markdown y autoguardado automático.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            ¿Listo para organizar tu desarrollo?
          </h2>
          <p className="text-lg sm:text-xl mb-8 sm:mb-12 text-blue-100 max-w-2xl mx-auto">
            Únete a otros desarrolladores que ya están optimizando su flujo de trabajo
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </div>
    </div>
  )
} 
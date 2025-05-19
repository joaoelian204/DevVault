import { Modal } from '@/components/ui/Modal';
import { motion } from "framer-motion";
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useLinks } from '../../hooks/useLinks';
import LinkCard from './LinkCard';

export default function LinksDashboard() {
  const { links, loading, fetchLinks, deleteLink } = useLinks();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const filteredLinks = links.filter(link =>
    link.title.toLowerCase().includes(search.toLowerCase()) ||
    (link.description && link.description.toLowerCase().includes(search.toLowerCase())) ||
    (link.tags && link.tags.join(' ').toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (linkId: string) => {
    setLinkToDelete(linkId);
  };

  const confirmDelete = async () => {
    if (linkToDelete) {
      try {
        await deleteLink(linkToDelete);
        toast.success('Enlace eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar el enlace:', error);
        toast.error('Hubo un error al eliminar el enlace.');
      }
      setLinkToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-2">Mis Links y Recursos</h1>
            <p className="text-gray-600 dark:text-gray-400">Organiza y comparte tus recursos favoritos</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder="Buscar por título, descripción o etiqueta..."
                className="w-full md:w-80 px-4 py-3 rounded-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => navigate('/links/new')} 
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-lg hover:shadow-xl"
            >
              <FiPlus className="w-5 h-5" />
              Nuevo Enlace
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLinks.map(link => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <LinkCard 
                  key={link.id} 
                  link={link} 
                  onEdit={() => navigate(`/links/${link.id}`)}
                  onDelete={() => handleDelete(link.id)}
                />
              </motion.div>
            ))}
            {filteredLinks.length === 0 && (
              <div className="col-span-full text-center py-20">
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  No se encontraron recursos.
                </div>
                <button
                  onClick={() => navigate('/links/new')}
                  className="mt-4 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                >
                  Crear tu primer link
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Modal
        isOpen={!!linkToDelete}
        onClose={() => setLinkToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        description="¿Estás seguro de que deseas eliminar este enlace? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="confirm"
        icon="alert"
      />
    </div>
  );
} 
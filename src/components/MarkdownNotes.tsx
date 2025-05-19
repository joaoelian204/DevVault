import MDEditor from '@uiw/react-md-editor';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiClock, FiEdit2, FiImage, FiPlus, FiSearch, FiStar, FiTag, FiTrash2, FiX } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreateNote, Note, notesService } from '../services/notesService';
import { Card } from './ui/card';
import { Modal } from './ui/Modal';

export function MarkdownNotes() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [notas, setNotas] = useState<Note[]>([]);
  const [notaSeleccionada, setNotaSeleccionada] = useState<Note | null>(null);
  const [estaEditando, setEstaEditando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [estaBuscando, setEstaBuscando] = useState(false);
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [mostrarEtiquetas, setMostrarEtiquetas] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalEliminar, setModalEliminar] = useState<{
    isOpen: boolean;
    notaId: string | null;
  }>({
    isOpen: false,
    notaId: null
  });
  const [modalEditarTitulo, setModalEditarTitulo] = useState<{
    isOpen: boolean;
    notaId: string | null;
    tituloActual: string;
  }>({
    isOpen: false,
    notaId: null,
    tituloActual: ''
  });
  const [modalImagen, setModalImagen] = useState<{
    isOpen: boolean;
    url: string;
  }>({
    isOpen: false,
    url: ''
  });

  // Cargar notas al montar el componente
  useEffect(() => {
    if (user) {
      cargarNotas();
    }
  }, [user, id]);

  const cargarNotas = async () => {
    try {
      setIsLoading(true);
      const notasGuardadas = await notesService.getNotes();
      setNotas(notasGuardadas);
      
      // Si hay un ID en la URL, seleccionar esa nota
      if (id) {
        const notaEncontrada = notasGuardadas.find(n => n.id === id);
        if (notaEncontrada) {
          setNotaSeleccionada(notaEncontrada);
          setEstaEditando(true);
        }
      } else if (notasGuardadas.length > 0 && !notaSeleccionada) {
        setNotaSeleccionada(notasGuardadas[0]);
      }
    } catch (error) {
      console.error('Error al cargar las notas:', error);
      toast.error('Error al cargar las notas');
    } finally {
      setIsLoading(false);
    }
  };

  const crearNuevaNota = useCallback(async () => {
    if (!user) return;

    try {
      const nuevaNota: CreateNote = {
        user_id: user.id,
        title: 'Sin título',
        content: '',
        tags: []
      };
      
      const notaCreada = await notesService.createNote(nuevaNota);
      setNotas(prev => [notaCreada, ...prev]);
      setNotaSeleccionada(notaCreada);
      toast.success('Nota creada correctamente');
    } catch (error) {
      console.error('Error al crear la nota:', error);
      toast.error('Error al crear la nota');
    }
  }, [user]);

  const eliminarNota = async (idNota: string) => {
    try {
      await notesService.deleteNote(idNota);
      const notasActualizadas = notas.filter(nota => nota.id !== idNota);
      setNotas(notasActualizadas);
      if (notaSeleccionada?.id === idNota) {
        setNotaSeleccionada(notasActualizadas[0] || null);
      }
      toast.success('Nota eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar la nota:', error);
      toast.error('Error al eliminar la nota');
    }
  };

  const actualizarTituloNota = async (idNota: string, nuevoTitulo: string) => {
    if (!nuevoTitulo.trim()) return;
    
    try {
      const notaActualizada = await notesService.updateNote(idNota, { title: nuevoTitulo });
      setNotas(prev => prev.map(n => n.id === idNota ? notaActualizada : n));
      if (notaSeleccionada?.id === idNota) {
        setNotaSeleccionada(notaActualizada);
      }
    } catch (error) {
      console.error('Error al actualizar el título:', error);
      toast.error('Error al actualizar el título');
    }
  };

  const actualizarContenidoNota = async (valor: string | undefined) => {
    if (notaSeleccionada && valor !== undefined) {
      try {
        const notaActualizada = await notesService.updateNote(notaSeleccionada.id, { content: valor });
        setNotaSeleccionada(notaActualizada);
        setNotas(prev => prev.map(n => n.id === notaSeleccionada.id ? notaActualizada : n));
      } catch (error) {
        console.error('Error al actualizar el contenido:', error);
        toast.error('Error al actualizar el contenido');
      }
    }
  };

  const toggleFavorito = useCallback(async (nota: Note) => {
    if (!user) return;

    try {
      const notaActualizada = await notesService.updateNote(nota.id, {
        ...nota,
        is_favorite: !nota.is_favorite
      });
      
      setNotas(prev => prev.map(n => n.id === nota.id ? notaActualizada : n));
      if (notaSeleccionada?.id === nota.id) {
        setNotaSeleccionada(notaActualizada);
      }
      toast.success(notaActualizada.is_favorite ? 'Nota marcada como favorita' : 'Nota desmarcada de favoritos');
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      toast.error('Error al actualizar favorito');
    }
  }, [user, notaSeleccionada]);

  const agregarEtiqueta = async (idNota: string) => {
    const nota = notas.find(n => n.id === idNota);
    if (!nota) return;

    const etiqueta = prompt('Ingrese la etiqueta:');
    if (!etiqueta?.trim()) return;

    // Verificar si la etiqueta ya existe
    const etiquetasActuales = Array.isArray(nota.tags) ? nota.tags : [];
    if (etiquetasActuales.includes(etiqueta.trim())) {
      toast.error('Esta etiqueta ya existe');
      return;
    }

    try {
      const etiquetasActualizadas = [...etiquetasActuales, etiqueta.trim()];
      const notaActualizada = await notesService.updateNote(idNota, {
        ...nota,
        tags: etiquetasActualizadas
      });
      
      setNotas(prev => prev.map(n => n.id === idNota ? notaActualizada : n));
      if (notaSeleccionada?.id === idNota) {
        setNotaSeleccionada(notaActualizada);
      }
      toast.success('Etiqueta agregada correctamente');
    } catch (error) {
      console.error('Error al agregar etiqueta:', error);
      toast.error('Error al agregar etiqueta');
    }
  };

  const eliminarEtiqueta = async (idNota: string, etiqueta: string) => {
    const nota = notas.find(n => n.id === idNota);
    if (!nota) return;

    const etiquetasActuales = Array.isArray(nota.tags) ? nota.tags : [];
    try {
      const etiquetasActualizadas = etiquetasActuales.filter(tag => tag !== etiqueta);
      const notaActualizada = await notesService.updateNote(idNota, {
        ...nota,
        tags: etiquetasActualizadas
      });
      
      setNotas(prev => prev.map(n => n.id === idNota ? notaActualizada : n));
      if (notaSeleccionada?.id === idNota) {
        setNotaSeleccionada(notaActualizada);
      }
      toast.success('Etiqueta eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
      toast.error('Error al eliminar etiqueta');
    }
  };

  const handleBuscarNotas = async (query: string) => {
    if (!query.trim()) {
      await cargarNotas();
      return;
    }

    try {
      const resultados = await notesService.searchNotes(query);
      setNotas(resultados);
    } catch (error) {
      console.error('Error al buscar notas:', error);
      toast.error('Error al buscar notas');
    }
  };

  const formatearFecha = (timestamp: string) => {
    const fecha = new Date(timestamp);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (dias === 0) {
      return 'Hoy';
    } else if (dias === 1) {
      return 'Ayer';
    } else if (dias < 7) {
      return `Hace ${dias} días`;
    } else {
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const notasFiltradas = notas.filter(nota => {
    const busquedaLower = busqueda.toLowerCase();
    const tags = Array.isArray(nota.tags) ? nota.tags : [];
    return (
      nota.title.toLowerCase().includes(busquedaLower) ||
      nota.content.toLowerCase().includes(busquedaLower) ||
      tags.some(etiqueta => etiqueta.toLowerCase().includes(busquedaLower))
    );
  });

  // Ordenar notas: favoritos primero, luego por fecha de modificación
  const notasOrdenadas = [...notasFiltradas].sort((a, b) => {
    if (a.is_favorite && !b.is_favorite) return -1;
    if (!a.is_favorite && b.is_favorite) return 1;
    return new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime();
  });

  const handleEliminarNota = useCallback(async (idNota: string) => {
    try {
      await eliminarNota(idNota);
      if (notaSeleccionada?.id === idNota) {
        setNotaSeleccionada(notas.find(n => n.id !== idNota) || null);
      }
    } catch (error) {
      console.error('Error al eliminar la nota:', error);
    }
  }, [eliminarNota, notaSeleccionada, notas]);

  const handleEditarTitulo = useCallback(async (idNota: string, nuevoTitulo: string) => {
    if (!nuevoTitulo.trim()) return;
    
    try {
      await actualizarTituloNota(idNota, nuevoTitulo);
      toast.success('Título actualizado');
    } catch (error) {
      console.error('Error al actualizar el título:', error);
      toast.error('Error al actualizar el título');
    }
  }, [actualizarTituloNota]);

  const handleInsertarImagen = useCallback((url: string) => {
    if (!url.trim()) return;
    
    if (!url.match(/^https?:\/\/.+/)) {
      toast.error('Por favor, ingresa una URL válida que comience con http:// o https://');
      return;
    }

    if (notaSeleccionada) {
      const imagenMarkdown = `![Imagen](${url})`;
      const nuevoContenido = notaSeleccionada.content + '\n' + imagenMarkdown;
      actualizarContenidoNota(nuevoContenido);
      toast.success('Imagen insertada correctamente');
    }
  }, [notaSeleccionada, actualizarContenidoNota]);

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={modalEliminar.isOpen}
        onClose={() => setModalEliminar({ isOpen: false, notaId: null })}
        onConfirm={() => {
          if (modalEliminar.notaId) {
            handleEliminarNota(modalEliminar.notaId);
          }
        }}
        title="Eliminar nota"
        description="¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="confirm"
        icon="alert"
      />

      {/* Modal de edición de título */}
      <Modal
        isOpen={modalEditarTitulo.isOpen}
        onClose={() => setModalEditarTitulo({ isOpen: false, notaId: null, tituloActual: '' })}
        onConfirm={(nuevoTitulo) => {
          if (modalEditarTitulo.notaId && nuevoTitulo) {
            handleEditarTitulo(modalEditarTitulo.notaId, nuevoTitulo);
          }
        }}
        title="Editar título"
        confirmText="Guardar"
        cancelText="Cancelar"
        type="input"
        defaultValue={modalEditarTitulo.tituloActual}
        inputPlaceholder="Ingresa el nuevo título"
        icon="edit"
      />

      {/* Modal para insertar imagen */}
      <Modal
        isOpen={modalImagen.isOpen}
        onClose={() => setModalImagen({ isOpen: false, url: '' })}
        onConfirm={(url) => {
          if (url) {
            handleInsertarImagen(url);
          }
        }}
        title="Insertar imagen"
        confirmText="Insertar"
        cancelText="Cancelar"
        type="input"
        defaultValue={modalImagen.url}
        inputPlaceholder="Pega la URL de la imagen (http:// o https://)"
        icon="edit"
      />

      {/* Barra lateral */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: '100%', opacity: 1 }}
        className="lg:w-48 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
      >
        <div className="p-2 sm:p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={crearNuevaNota}
              className="flex-1 flex items-center justify-center px-3 sm:px-4 lg:px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 space-x-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-sm sm:text-base lg:text-sm max-w-[200px] lg:max-w-[160px]"
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4" />
              <span className="font-medium">Nueva Nota</span>
            </button>
            <button
              onClick={() => setEstaBuscando(!estaBuscando)}
              className="p-1.5 sm:p-2 lg:p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Buscar notas"
            >
              <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4" />
            </button>
          </div>

          <AnimatePresence>
            {estaBuscando && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      handleBuscarNotas(e.target.value);
                    }}
                    placeholder="Buscar notas..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm sm:text-base"
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      title="Limpiar búsqueda"
                    >
                      <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-16rem)] sm:max-h-[calc(100vh-18rem)] lg:max-h-[calc(100vh-12rem)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <AnimatePresence>
                {notasOrdenadas.map((nota) => (
                  <motion.div
                    key={nota.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="w-full lg:max-w-[calc(theme(width.80)-2rem)]"
                  >
                    <Card
                      variant="interactive"
                      className={`group p-3 sm:p-4 lg:p-3 cursor-pointer ${
                        notaSeleccionada?.id === nota.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg'
                          : ''
                      }`}
                      onClick={() => {
                        setNotaSeleccionada(nota);
                        setEstaEditando(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium truncate text-gray-900 dark:text-gray-100 text-base sm:text-lg lg:text-base">
                              {nota.title}
                            </h3>
                            {nota.is_favorite && (
                              <FiStar className="w-4 h-4 lg:w-3.5 lg:h-3.5 text-yellow-500 animate-pulse" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1.5 lg:mt-1">
                            <FiClock className="w-3.5 h-3.5 lg:w-3 lg:h-3 text-gray-400" />
                            <p className="text-xs sm:text-sm lg:text-xs text-gray-500 dark:text-gray-400">
                              {formatearFecha(nota.updated_at || '')}
                            </p>
                          </div>
                          {Array.isArray(nota.tags) && nota.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5 lg:mt-1">
                              {(Array.isArray(nota.tags) ? nota.tags : []).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-1.5 lg:px-1 py-0.5 rounded text-xs lg:text-[11px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                >
                                  {tag}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      eliminarEtiqueta(nota.id, tag);
                                    }}
                                    className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                                    title="Eliminar etiqueta"
                                    aria-label={`Eliminar etiqueta ${tag}`}
                                  >
                                    <FiX className="w-3 h-3 lg:w-2.5 lg:h-2.5" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 lg:ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorito(nota);
                            }}
                            className={`p-1 lg:p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                              nota.is_favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                            }`}
                            title={nota.is_favorite ? "Quitar de favoritos" : "Marcar como favorito"}
                          >
                            <FiStar className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalEditarTitulo({
                                isOpen: true,
                                notaId: nota.id,
                                tituloActual: nota.title
                              });
                            }}
                            className="p-1 lg:p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title="Editar título"
                          >
                            <FiEdit2 className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalEliminar({ isOpen: true, notaId: nota.id });
                            }}
                            className="p-1 lg:p-0.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title="Eliminar nota"
                          >
                            <FiTrash2 className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0 rounded-b-lg lg:rounded-b-none lg:rounded-tr-lg bg-white dark:bg-gray-800">
        {notaSeleccionada ? (
          <div className="flex flex-col h-full">
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <input
                  type="text"
                  value={notaSeleccionada.title}
                  onChange={(e) => actualizarTituloNota(notaSeleccionada.id, e.target.value)}
                  className="flex-1 text-lg sm:text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100"
                  placeholder="Título de la nota..."
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFavorito(notaSeleccionada)}
                    className={`p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      notaSeleccionada.is_favorite ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                    title={notaSeleccionada.is_favorite ? "Quitar de favoritos" : "Marcar como favorito"}
                  >
                    <FiStar className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setMostrarEtiquetas(!mostrarEtiquetas)}
                    className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Gestionar etiquetas"
                  >
                    <FiTag className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
              
              <AnimatePresence>
                {mostrarEtiquetas && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 sm:mt-4 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <input
                        type="text"
                        value={nuevaEtiqueta}
                        onChange={(e) => setNuevaEtiqueta(e.target.value)}
                        placeholder="Nueva etiqueta..."
                        className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            agregarEtiqueta(notaSeleccionada.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => agregarEtiqueta(notaSeleccionada.id)}
                        className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-medium whitespace-nowrap"
                      >
                        Agregar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {(Array.isArray(notaSeleccionada.tags) ? notaSeleccionada.tags : []).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                        >
                          {tag}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarEtiqueta(notaSeleccionada.id, tag);
                            }}
                            className="ml-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                            title="Eliminar etiqueta"
                          >
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute top-2 right-2 z-10 flex space-x-2">
                <button
                  onClick={() => setModalImagen({ isOpen: true, url: '' })}
                  className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="Insertar imagen"
                >
                  <FiImage className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              {estaEditando ? (
                <MDEditor
                  value={notaSeleccionada.content}
                  onChange={actualizarContenidoNota}
                  height="100%"
                  preview="edit"
                  className="!border-none"
                  visibleDragbar={false}
                  style={{ fontSize: '14px' }}
                />
              ) : (
                <div className="h-full p-2 sm:p-4 overflow-auto">
                  <MDEditor.Markdown 
                    source={notaSeleccionada.content} 
                    className="!bg-transparent prose-sm sm:prose-base dark:prose-invert max-w-none"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 p-4"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="text-center space-y-4 sm:space-y-6">
                <FiEdit2 className="w-12 h-12 sm:w-20 sm:h-20 mx-auto text-gray-400 animate-pulse" />
                <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 font-medium">
                  Selecciona una nota o crea una nueva
                </p>
                <button
                  onClick={crearNuevaNota}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 font-medium text-sm sm:text-base"
                >
                  Crear Nueva Nota
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
} 
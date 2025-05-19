import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiArrowRight, FiCode, FiFileText, FiLink, FiPlus, FiSave, FiSearch, FiTag, FiTrendingUp, FiX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Stats {
  links: number;
  snippets: number;
  notes: number;
  totalItems: number;
  lastWeekActivity: number;
  favoriteItems: number;
}

interface RecentItem {
  id: string;
  title: string;
  url?: string;
  language?: string;
  created_at: string;
  is_favorite?: boolean;
  tags?: string[];
  type: 'link' | 'snippet' | 'note';
}

interface UserProfile {
  username: string | null;
  avatar_url: string | null;
  full_name: string | null;
}

interface SnippetContent {
  id: string;
  title: string;
  content: string;
  language: string;
  created_at: string;
}

type SortOption = 'recent' | 'favorites' | 'tags';
type FilterType = 'all' | 'link' | 'snippet' | 'note';

interface SnippetFormData {
  title: string;
  content: string;
  language: string;
  tags: string[];
}

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'swift',
  'kotlin',
  'html',
  'css',
  'sql',
  'bash',
  'powershell',
  'markdown',
  'json',
  'yaml',
  'xml',
  'other'
] as const;

type Language = typeof LANGUAGES[number];

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ 
    links: 0, 
    snippets: 0, 
    notes: 0, 
    totalItems: 0,
    lastWeekActivity: 0,
    favoriteItems: 0
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({ username: null, avatar_url: null, full_name: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState<SnippetContent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [snippetForm, setSnippetForm] = useState<SnippetFormData>({
    title: '',
    content: '',
    language: 'javascript',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url, full_name')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch stats with more details
        const [linksCount, snippetsCount, notesCount, lastWeekActivity, favoriteItems] = await Promise.all([
          supabase.from('links').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('snippets').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('notes').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('links')
            .select('created_at')
            .eq('user_id', user.id)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('links')
            .select('id', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('is_favorite', true)
        ]);

        const totalItems = (linksCount.count || 0) + (snippetsCount.count || 0) + (notesCount.count || 0);
        const lastWeekCount = lastWeekActivity.data?.length || 0;

        setStats({
          links: linksCount.count || 0,
          snippets: snippetsCount.count || 0,
          notes: notesCount.count || 0,
          totalItems,
          lastWeekActivity: lastWeekCount,
          favoriteItems: favoriteItems.count || 0
        });

        // Fetch recent items
        const [links, snippets, notes] = await Promise.all([
          supabase
            .from('links')
            .select('id, title, url, created_at, tags')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('snippets')
            .select('id, title, language, created_at, tags')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('notes')
            .select('id, title, created_at, tags')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5)
        ]);

        const allItems: RecentItem[] = [
          ...(links.data || []).map(item => ({ ...item, type: 'link' as const })),
          ...(snippets.data || []).map(item => ({ ...item, type: 'snippet' as const })),
          ...(notes.data || []).map(item => ({ ...item, type: 'note' as const }))
        ];

        setRecentItems(allItems);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  const filteredItems = recentItems
    .filter(item => {
      // Primero aplicamos el filtro de tipo
      if (filterType !== 'all' && item.type !== filterType) return false;

      // Si no hay término de búsqueda, mostramos todos los items del tipo seleccionado
      if (!searchQuery.trim()) return true;

      // Aplicamos la búsqueda en todos los campos relevantes
      const query = searchQuery.toLowerCase().trim();
      const searchableFields = [
        item.title,
        item.language,
        item.type,
        ...(item.tags || [])
      ]
        .filter((field): field is string => typeof field === 'string') // Aseguramos que todos los campos sean strings
        .map(field => field.toLowerCase());

      return searchableFields.some(field => field.includes(query));
    })
    .sort((a, b) => {
      // Aplicamos el ordenamiento según la opción seleccionada
      switch (sortBy) {
        case 'favorites':
          // Primero los favoritos
          if (a.is_favorite && !b.is_favorite) return -1;
          if (!a.is_favorite && b.is_favorite) return 1;
          // Luego por fecha
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'tags':
          // Primero por cantidad de tags
          const aTags = (a.tags || []).length;
          const bTags = (b.tags || []).length;
          if (aTags !== bTags) return bTags - aTags;
          // Si tienen la misma cantidad de tags, por fecha
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'recent':
        default:
          // Por defecto, ordenar por fecha más reciente
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'link': return <FiLink className="w-4 h-4 text-blue-500" />;
      case 'snippet': return <FiCode className="w-4 h-4 text-green-500" />;
      case 'note': return <FiFileText className="w-4 h-4 text-purple-500" />;
      default: return null;
    }
  };

  const handleViewSnippet = async (snippetId: string) => {
    try {
      const { data, error } = await supabase
        .from('snippets')
        .select('id, title, content, language, created_at, tags')
        .eq('id', snippetId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedSnippet(data);
        setSnippetForm({
          title: data.title,
          content: data.content,
          language: data.language,
          tags: data.tags || []
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching snippet:', error);
      toast.error('Error al cargar el snippet');
    }
  };

  const handleSaveSnippet = async () => {
    if (!user || !selectedSnippet) return;

    try {
      const { error } = await supabase
        .from('snippets')
        .update({
          ...snippetForm,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSnippet.id);

      if (error) throw error;

      toast.success('Snippet actualizado correctamente');
      setIsEditing(false);
      // Actualizar el snippet en la lista
      setRecentItems(prev => prev.map(item => 
        item.id === selectedSnippet.id 
          ? { ...item, ...snippetForm }
          : item
      ));
    } catch (error) {
      console.error('Error saving snippet:', error);
      toast.error('Error al guardar el snippet');
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!snippetForm.tags.includes(tagInput.trim())) {
        setSnippetForm(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSnippetForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="animate-pulse space-y-8">
          {/* Profile skeleton */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72"></div>
            </div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl p-6 h-32"></div>
            ))}
          </div>

          {/* Recent items skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl p-6 h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Profile section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
      >
        <div className="relative group">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username || user?.email}&background=random&size=96`}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <Link
              to="/profile"
              className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-indigo-500 text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-indigo-600 transition-all transform hover:scale-110"
              title="Editar perfil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Bienvenido, {profile.full_name || profile.username || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Este es tu panel personal de desarrollo. Accede y organiza tus recursos de forma rápida y segura.
          </p>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <FiTrendingUp className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-300 font-medium">Total de Recursos</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {stats.lastWeekActivity} nuevos esta semana
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <FiLink className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.links}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-300 font-medium">Enlaces</h3>
          <Link to="/links" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2">
            Ver todos <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <FiCode className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.snippets}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-300 font-medium">Snippets</h3>
          <Link to="/snippets" className="text-sm text-green-600 hover:underline flex items-center gap-1 mt-2">
            Ver todos <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
        >
          <div className="flex items-center justify-between mb-4">
            <FiFileText className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.notes}</span>
          </div>
          <h3 className="text-gray-600 dark:text-gray-300 font-medium">Notas</h3>
          <Link to="/notes" className="text-sm text-purple-600 hover:underline flex items-center gap-1 mt-2">
            Ver todas <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Quick actions and search section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-10 space-y-6"
      >
        {/* Quick actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link 
            to="/links/new" 
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <FiPlus /> Nuevo Enlace
          </Link>
          <Link 
            to="/snippets/new" 
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <FiPlus /> Nuevo Snippet
          </Link>
          <Link 
            to="/notes/new" 
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <FiPlus /> Nueva Nota
          </Link>
        </div>

        {/* Search and filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en todos los recursos..."
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FiTag className="w-4 h-4" />
                Filtros
              </button>
              <select
                aria-label="Ordenar por"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <option value="recent">Más recientes</option>
                <option value="favorites">Favoritos</option>
                <option value="tags">Con más etiquetas</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {(['all', 'link', 'snippet', 'note'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filterType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type === 'all' ? 'Todos' : 
                     type === 'link' ? 'Enlaces' :
                     type === 'snippet' ? 'Snippets' : 'Notas'}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Recent items */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {searchQuery ? `Resultados de búsqueda para "${searchQuery}"` : 'Recursos recientes'}
        </h2>
        
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getItemIcon(item.type)}
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {item.title}
                  </h3>
                </div>
              </div>
              
              <div className="space-y-2">
                {item.language && (
                  <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                    {item.language}
                  </span>
                )}
                
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-3">
                {new Date(item.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>

              <div className="flex justify-end">
                {item.type === 'link' && item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Abrir enlace <FiArrowRight className="w-4 h-4" />
                  </a>
                ) : item.type === 'snippet' ? (
                  <button
                    onClick={() => handleViewSnippet(item.id)}
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium flex items-center gap-1"
                  >
                    Ver código <FiArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/notes/${item.id}`)}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium flex items-center gap-1"
                  >
                    Ver nota <FiArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal para mostrar/editar el snippet */}
        {showModal && selectedSnippet && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isEditing) setShowModal(false);
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <FiCode className="w-5 h-5 text-green-500" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={snippetForm.title}
                      onChange={(e) => setSnippetForm(prev => ({ ...prev, title: e.target.value }))}
                      className="text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 focus:outline-none px-2 py-1"
                      placeholder="Título del snippet"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedSnippet.title}
                    </h3>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveSnippet}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <FiSave className="w-4 h-4" />
                        Guardar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setShowModal(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Cerrar"
                        aria-label="Cerrar modal"
                      >
                        <FiX className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 overflow-auto flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Lenguaje
                      </label>
                      <select
                        value={snippetForm.language}
                        onChange={(e) => setSnippetForm(prev => ({ ...prev, language: e.target.value as Language }))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        aria-label="Seleccionar lenguaje de programación"
                        title="Seleccionar lenguaje de programación"
                      >
                        {LANGUAGES.map((lang: Language) => (
                          <option key={lang} value={lang}>
                            {lang.charAt(0).toUpperCase() + lang.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Código
                      </label>
                      <div className="relative">
                        <textarea
                          value={snippetForm.content}
                          onChange={(e) => setSnippetForm(prev => ({ ...prev, content: e.target.value }))}
                          className="w-full h-64 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                          placeholder="Tu código aquí..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Etiquetas
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {snippetForm.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-green-900 dark:hover:text-green-100"
                              title="Eliminar etiqueta"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Presiona Enter para agregar una etiqueta"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <SyntaxHighlighter
                      language={selectedSnippet.language.toLowerCase()}
                      style={vscDarkPlus}
                      className="rounded-lg !bg-gray-900"
                      showLineNumbers
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {selectedSnippet.content}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSnippet.content);
                        toast.success('Código copiado al portapapeles');
                      }}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                      title="Copiar código"
                      aria-label="Copiar código al portapapeles"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(selectedSnippet.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                      {selectedSnippet.language}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? `No se encontraron recursos que coincidan con "${searchQuery}"${filterType !== 'all' ? ` en la categoría ${filterType === 'link' ? 'Enlaces' : filterType === 'snippet' ? 'Snippets' : 'Notas'}` : ''}`
                : filterType !== 'all'
                  ? `No hay ${filterType === 'link' ? 'enlaces' : filterType === 'snippet' ? 'snippets' : 'notas'} recientes`
                  : 'No hay recursos recientes'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const LANGUAGES = [
  // Programming Languages
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'rust',
  'go',
  'html',
  'css',
  'markdown',
  'json',
  'yaml',
  'xml',
  'bash',
  'shell',
  'powershell',
  // Database Languages
  'sql',
  'postgresql',
  'mysql',
  'sqlite',
  'mongodb',
  'redis',
  'graphql',
  'other'
];

interface SnippetFormData {
  title: string;
  content: string;
  language: string;
  tags: string[];
}

export default function SnippetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<SnippetFormData>({
    title: '',
    content: '',
    language: 'javascript',
    tags: []
  });
  const [initialForm, setInitialForm] = useState<SnippetFormData | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSnippet();
    } else {
      setLoading(false);
      setInitialForm(null);
    }
  }, [id]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form, initialForm]);

  const hasUnsavedChanges = () => {
    if (!initialForm) return false;
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  };

  const fetchSnippet = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        const snippetData = {
          title: data.title,
          content: data.content,
          language: data.language,
          tags: data.tags || []
        };
        setForm(snippetData);
        setInitialForm(snippetData);
      }
    } catch (error) {
      console.error('Error fetching snippet:', error);
      toast.error('Error al cargar el snippet');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    if (hasUnsavedChanges()) {
      setShowDiscardConfirm(true);
    } else {
      navigate('/snippets');
    }
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(false);
    navigate('/snippets');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);

      const snippetData = {
        title: form.title,
        content: form.content,
        language: form.language,
        tags: form.tags.filter(tag => tag.trim() !== ''),
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (id) {
        const { error } = await supabase
          .from('snippets')
          .update(snippetData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Snippet actualizado correctamente');
      } else {
        const { error } = await supabase
          .from('snippets')
          .insert([{ ...snippetData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        toast.success('Snippet creado correctamente');
      }

      navigate('/snippets');
    } catch (error) {
      console.error('Error saving snippet:', error);
      toast.error('Error al guardar el snippet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) {
        setForm(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNavigate}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Volver
          </motion.button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {id ? 'Editar Snippet' : 'Nuevo Snippet'}
          </h1>
        </div>

        {/* Discard Changes Modal */}
        <AnimatePresence>
          {showDiscardConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  ¿Descartar cambios?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?
                </p>
                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDiscardConfirm(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDiscard}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Descartar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Nombre del snippet"
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lenguaje
            </label>
            <select
              id="language"
              value={form.language}
              onChange={(e) => setForm(prev => ({ ...prev, language: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">Selecciona un lenguaje</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Código
            </label>
            <div className="relative group">
              <textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                required
                rows={10}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                placeholder="Pega tu código aquí..."
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, content: '' }))}
                  className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  title="Limpiar código"
                >
                  <FiX className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {form.content && form.language && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
              role="region"
              aria-label="Vista previa del código"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vista previa
              </label>
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <SyntaxHighlighter
                  language={form.language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    fontSize: '0.875rem',
                    padding: '1rem',
                    background: '#1E1E1E',
                  }}
                  showLineNumbers={true}
                  wrapLines={true}
                  wrapLongLines={true}
                >
                  {form.content}
                </SyntaxHighlighter>
              </div>
            </motion.div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              {form.tags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
                    title="Eliminar etiqueta"
                    aria-label={`Eliminar etiqueta ${tag}`}
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </motion.span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="Añadir etiqueta..."
                className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Presiona Enter para añadir una etiqueta
            </p>
          </div>

          {/* Submit Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex justify-end"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-5 h-5" />
              {isSubmitting ? 'Guardando...' : id ? 'Actualizar' : 'Crear Snippet'}
            </button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
} 
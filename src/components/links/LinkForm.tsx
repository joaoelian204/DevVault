import MDEditor from '@uiw/react-md-editor';
import React, { useEffect, useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLinks } from '../../hooks/useLinks';
import { uploadImage } from '../../lib/cloudinary';

const initialState = {
  title: '',
  url: '',
  description: '',
  tags: '',
  category: '',
  note: '',
  image_url: '',
};

export default function LinkForm() {
  const { id } = useParams();
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { addLink, updateLink, getLink } = useLinks();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  useEffect(() => {
    const loadLink = async () => {
      if (id) {
        setLoading(true);
        try {
          const link = await getLink(id);
          if (link) {
            setForm({
              ...link,
              tags: Array.isArray(link.tags) ? link.tags.join(', ') : link.tags,
            });
          }
        } catch (err: any) {
          setError('Error al cargar el link: ' + (err?.message || JSON.stringify(err)));
        } finally {
          setLoading(false);
        }
      }
    };
    loadLink();
  }, [id, getLink]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: typeof initialState) => ({ ...prev, [name]: value }));
  };

  const handleNoteChange = (value: string | undefined) => {
    setForm((prev: typeof initialState) => ({ ...prev, note: value || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (!user) {
        setError('Debes iniciar sesión para guardar un link.');
        return;
      }
      if (isEdit && id) {
        await updateLink(id, form);
      } else {
        await addLink(form);
      }
      navigate('/links');
    } catch (err: any) {
      console.error('Error al guardar:', err);
      setError('Error al guardar: ' + (err?.message || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const image_url = await uploadImage(file);
      setForm(prev => ({ ...prev, image_url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image_url: '' }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-light text-gray-800 dark:text-white mb-3">
            {isEdit ? 'Editar Link' : 'Nuevo Link'}
          </h2>
          <div className="w-24 h-1 bg-indigo-500 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
            {isEdit ? 'Actualiza la información de tu link' : 'Comparte un nuevo recurso con la comunidad'}
          </p>
        </div>

        <div className="space-y-8">
          <div className="group">
            <label htmlFor="title" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Título
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Ingresa el título del link"
              className="w-full bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 px-0 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 transition-colors duration-200"
            />
          </div>

          <div className="group">
            <label htmlFor="url" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              URL o iframe
            </label>
            <input
              id="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              required
              placeholder="https://ejemplo.com"
              className="w-full bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 px-0 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 transition-colors duration-200"
            />
          </div>

          <div className="group">
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe brevemente el contenido del link"
              rows={3}
              className="w-full bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 px-0 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 transition-colors duration-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Etiquetas
              </label>
              <input
                id="tags"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="ejemplo, etiqueta, otra"
                className="w-full bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 px-0 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 transition-colors duration-200"
              />
            </div>

            <div className="group">
              <label htmlFor="category" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Categoría
              </label>
              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="ej. Tutorial, Noticia, etc."
                className="w-full bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400 px-0 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-0 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Imagen de Portada
            </label>
            <div className="mt-1 flex items-center gap-4">
              {form.image_url ? (
                <div className="relative group">
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar imagen"
                    aria-label="Eliminar imagen"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUpload className="w-8 h-8 text-gray-400" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="group">
            <label htmlFor="note" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Nota Markdown
            </label>
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-colors duration-200 focus-within:border-indigo-500 dark:focus-within:border-indigo-400">
              <MDEditor 
                value={form.note} 
                onChange={handleNoteChange} 
                height={200}
                preview="edit"
                className="!bg-transparent dark:!bg-transparent"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 backdrop-blur-sm">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="pt-6 flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/links')}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-lg hover:shadow-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-lg hover:shadow-xl"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              isEdit ? 'Guardar Cambios' : 'Crear Link'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
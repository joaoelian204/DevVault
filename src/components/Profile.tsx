import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiCamera, FiCode, FiFileText, FiLink, FiMail, FiSettings, FiShield, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { uploadImage } from '../lib/cloudinary';
import { supabase } from '../lib/supabase';

interface ProfileStats {
  links: number;
  snippets: number;
  notes: number;
}

interface Profile {
  username: string;
  avatarUrl: string;
  email: string;
  fullName: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    username: '',
    avatarUrl: '',
    email: user?.email || '',
    fullName: ''
  });
  const [stats, setStats] = useState<ProfileStats>({ links: 0, snippets: 0, notes: 0 });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<Profile>(profile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar perfil y estadísticas
  useEffect(() => {
    if (!user) return;
    
    const loadProfile = async () => {
      setLoading(true);
      try {
        // Cargar datos del perfil
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('username, avatar_url, full_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          throw error;
        }

        if (profileData) {
          const newProfile = {
            username: profileData.username || '',
            avatarUrl: profileData.avatar_url || '',
            email: user.email || '',
            fullName: profileData.full_name || ''
          };
          setProfile(newProfile);
          setTempProfile(newProfile);
        }

        // Cargar estadísticas
        const [links, snippets, notes] = await Promise.all([
          supabase.from('links').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('snippets').select('id', { count: 'exact' }).eq('user_id', user.id),
          supabase.from('notes').select('id', { count: 'exact' }).eq('user_id', user.id)
        ]);

        setStats({
          links: links.count || 0,
          snippets: snippets.count || 0,
          notes: notes.count || 0
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen válida');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar los 5MB');
      return;
    }

    setLoading(true);
    try {
      // Subir imagen a Cloudinary
      const url = await uploadImage(file);
      if (!url) {
        throw new Error('No se pudo obtener la URL de la imagen');
      }

      // Actualizar el perfil en la base de datos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      // Actualizar el estado local
      const updatedProfile = { ...profile, avatarUrl: url };
      setProfile(updatedProfile);
      setTempProfile(updatedProfile);
      toast.success('Imagen de perfil actualizada');
    } catch (err) {
      console.error('Error al actualizar la imagen:', err);
      toast.error('Error al actualizar la imagen de perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;
    
    try {
      // Convertir las claves del objeto a snake_case para la base de datos
      const dbUpdates = {
        username: updates.username,
        full_name: updates.fullName,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar username único
      if (tempProfile.username !== profile.username) {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', tempProfile.username)
          .neq('id', user?.id)
          .maybeSingle();

        if (data) {
          toast.error('El nombre de usuario ya está en uso');
          return;
        }
      }

      const success = await updateProfile({
        username: tempProfile.username,
        fullName: tempProfile.fullName
      });

      if (success) {
        setProfile(tempProfile);
        setIsEditing(false);
        toast.success('Perfil actualizado correctamente');
      }
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setTempProfile(profile);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  if (loading && !profile.username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Avatar y estadísticas */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="relative h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-white dark:bg-gray-700">
                      <img
                        src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username || profile.email)}&background=random`}
                        alt={`Avatar de ${profile.username}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Si la imagen falla al cargar, usar el avatar por defecto
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username || profile.email)}&background=random`;
                        }}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                      title="Cambiar foto de perfil"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                      ) : (
                        <FiCamera className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      )}
                    </motion.button>
                    <label htmlFor="avatar-upload" className="sr-only">Subir foto de perfil</label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      aria-label="Subir foto de perfil"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-20 pb-6 px-6 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.fullName || profile.username}</h2>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700">
                <div className="bg-white dark:bg-gray-800 p-4 text-center">
                  <FiLink className="w-5 h-5 mx-auto text-blue-500" />
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.links}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enlaces</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 text-center">
                  <FiCode className="w-5 h-5 mx-auto text-green-500" />
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.snippets}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Snippets</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 text-center">
                  <FiFileText className="w-5 h-5 mx-auto text-purple-500" />
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{stats.notes}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Notas</p>
                </div>
              </div>
            </motion.div>

            {/* Tarjeta de seguridad */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center space-x-3">
                <FiShield className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seguridad</h3>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Tu cuenta está protegida con autenticación segura.
              </p>
              <button
                onClick={() => toast.success('Funcionalidad en desarrollo')}
                className="mt-4 w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Cambiar contraseña
              </button>
            </motion.div>
          </div>

          {/* Columna derecha - Formulario de perfil */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiSettings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuración del Perfil</h2>
                  </div>
                  {!isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startEditing}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Editar Perfil
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email (solo lectura) */}
                    <div className="relative">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="block w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                          aria-label="Correo electrónico"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Tu correo electrónico no se puede cambiar
                      </p>
                    </div>

                    {/* Nombre de usuario */}
                    <div className="relative">
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre de usuario
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="username"
                          type="text"
                          value={isEditing ? tempProfile.username : profile.username}
                          onChange={(e) => isEditing && setTempProfile(prev => ({ ...prev, username: e.target.value }))}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50"
                          placeholder="Tu nombre de usuario"
                          maxLength={32}
                          aria-label="Nombre de usuario"
                        />
                      </div>
                    </div>

                    {/* Nombre completo */}
                    <div className="relative md:col-span-2">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre completo
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={isEditing ? tempProfile.fullName : profile.fullName}
                        onChange={(e) => isEditing && setTempProfile(prev => ({ ...prev, fullName: e.target.value }))}
                        disabled={!isEditing}
                        className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white disabled:opacity-50"
                        placeholder="Tu nombre completo"
                        aria-label="Nombre completo"
                      />
                    </div>
                  </div>

                  {/* Botones de acción */}
                  {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={cancelEditing}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancelar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Guardando...' : 'Guardar cambios'}
                      </motion.button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 
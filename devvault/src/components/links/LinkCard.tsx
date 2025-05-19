import { useState } from 'react';
import { FiBookOpen, FiEdit2, FiExternalLink, FiFileText, FiFolder, FiLink, FiTag, FiTrash2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

function isYouTube(url: string) {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : null;
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

interface LinkProps {
  link: {
    id: string;
    title: string;
    url: string;
    description?: string;
    note?: string;
    tags?: string[];
    category?: string;
    image_url?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

const DESCRIPTION_TRUNCATE_LENGTH = 150;

export default function LinkCard({ link, onEdit, onDelete }: LinkProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const descriptionNeedsTruncation = link.description && link.description.length > DESCRIPTION_TRUNCATE_LENGTH;
  const displayDescription = (descriptionNeedsTruncation && !showFullDescription)
    ? link.description?.substring(0, DESCRIPTION_TRUNCATE_LENGTH) + '...'
    : link.description;

  return (
    <div className="group relative p-4 sm:p-6 flex flex-col gap-3 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
      {/* Acciones */}
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Editar"
          >
            <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500"
            title="Eliminar"
          >
            <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Encabezado con título e icono */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg">
          {link.title.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white break-words group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            {link.title}
          </h2>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
          >
            <FiLink className="w-4 h-4" />
            <span className="truncate">{getDomain(link.url)}</span>
            <FiExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
      </div>

      {/* Contenido visual (Imagen o Video) */}
      {(link.image_url || isYouTube(link.url)) && (
        <div className="mt-2 mb-3 aspect-video rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700">
          {link.image_url && (
            <img
              src={link.image_url}
              alt={link.title}
              className="w-full h-full object-cover"
            />
          )}
          {isYouTube(link.url) && (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(link.url)}`}
              title={link.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>
      )}

      {/* Descripción */}
      {link.description && (
        <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          <FiFileText className="mt-0.5 shrink-0 text-indigo-500 dark:text-indigo-400" />
          <div className="flex-1">
            <p>{displayDescription}</p>
            {descriptionNeedsTruncation && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-blue-600 hover:underline text-xs mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                {showFullDescription ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Nota con markdown */}
      {link.note && (
        <div className="flex gap-3 text-sm">
          <FiBookOpen className="mt-1 shrink-0 text-purple-500 dark:text-purple-400" />
          <div className="prose dark:prose-invert max-w-none w-full bg-gray-50/50 dark:bg-gray-900/50 rounded-xl p-4 shadow-inner">
            <ReactMarkdown>{link.note}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Etiquetas y categoría */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        {link.tags?.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-full text-xs font-medium"
          >
            <FiTag className="w-3 h-3" />
            {tag}
          </span>
        ))}
        {link.category && (
          <span className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full text-xs font-medium ml-auto">
            <FiFolder className="w-3 h-3" />
            {link.category}
          </span>
        )}
      </div>
    </div>
  );
}


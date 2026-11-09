import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import Lightbox from './Lightbox';

// Grade de miniaturas (.case-img-grid do site original) que abre o lightbox.
// Aceita uma ou várias imagens; arquivo que falha ao carregar é descartado
// (sem ícone de imagem quebrada) e, se nenhum carregar, nada é renderizado.
export default function ImageGallery({ images, columns = 3, className = '' }) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);
  const [failed, setFailed] = useState(() => new Set());

  const available = images.filter((image) => !failed.has(image.src));

  if (!available.length) return null;

  function handleError(src) {
    setOpenIndex(null);
    setFailed((current) => new Set(current).add(src));
  }

  return (
    <>
      <div className={`case-img-grid cols-${Math.min(columns, available.length)} ${className}`}>
        {available.map((image, i) => (
          <button
            key={image.src}
            type="button"
            className="img-wrap"
            onClick={() => setOpenIndex(i)}
            aria-label={t.lightbox.open(image.alt)}
          >
            <img
              src={image.src}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => handleError(image.src)}
            />
          </button>
        ))}
      </div>
      {openIndex !== null && (
        <Lightbox
          images={available}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}

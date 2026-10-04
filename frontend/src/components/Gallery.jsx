import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Gallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    api.getGallery().then(setImages).catch(() => setImages([]));
  }, []);

  if (images.length === 0) return null;

  return (
    <section id="gallery" className="max-w-5xl mx-auto px-6 py-20">
      <h2 className="font-display text-3xl italic mb-8">Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.url}
            alt={img.caption || ''}
            className="w-full aspect-[4/5] object-cover rounded-sm"
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}

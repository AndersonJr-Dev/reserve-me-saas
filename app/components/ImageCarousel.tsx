
'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageCarousel({ images }: { images: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);
  return (
    <div className="relative">
      <div className="flex items-center justify-start mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Veja o Painel em Ação</h2>
      </div>
      <div className="relative mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
            {images.map((img, i) => (
              <div key={i} className="w-full flex-shrink-0 p-2">
                <img src={img.src} alt={img.alt} className="w-full h-auto rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between">
          <button aria-label="Imagem anterior" onClick={prev} className="p-2 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow hover:bg-white text-gray-700">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button aria-label="Próxima imagem" onClick={next} className="p-2 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow hover:bg-white text-gray-700">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

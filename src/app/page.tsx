'use client';

import { useState } from 'react';
import { UrlAnalyzer } from '@/components/UrlAnalyzer';
import { MediaResult } from '@/components/MediaResult';
import { FeaturesSection } from '@/components/FeaturesSection';
import type { MediaInfo } from '@/types/media';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  const [media, setMedia] = useState<MediaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzed = (data: MediaInfo) => {
    setMedia(data);
    setError(null);
  };

  return (
    <div className="flex-1 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center space-y-6">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-200/50 via-emerald-100/40 to-transparent rounded-full blur-3xl opacity-70" />
        </div>

        {/* Brand Tag / Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>MJR Downloader • Versão 1.0</span>
        </div>

        {/* Main Headings */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
            Baixe sua mídia de <span className="text-emerald-600">forma simples</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Cole o link de uma mídia pública para analisar os formatos disponíveis.
          </p>
        </div>

        {/* Interactive Analyzer */}
        <div className="pt-2">
          <UrlAnalyzer
            onAnalyzed={handleAnalyzed}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
          />
        </div>
      </section>

      {/* Analysis Result Display */}
      {media && (
        <section className="px-4 sm:px-6 lg:px-8">
          <MediaResult media={media} />
        </section>
      )}

      {/* Features & Security Explainer */}
      <section className="px-4 sm:px-6 lg:px-8">
        <FeaturesSection />
      </section>
    </div>
  );
}

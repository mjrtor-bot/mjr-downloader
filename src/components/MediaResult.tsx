'use client';

import { useState } from 'react';
import type { MediaFormat, MediaInfo } from '@/types/media';
import {
  Video,
  Music,
  Clock,
  User,
  Globe,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowDownToLine,
  Info,
} from 'lucide-react';

interface MediaResultProps {
  media: MediaInfo;
}

export function MediaResult({ media }: MediaResultProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const videoFormats = media.formats.filter((f) => f.hasVideo);
  const audioFormats = media.formats.filter((f) => !f.hasVideo && f.hasAudio);

  const filteredFormats =
    activeTab === 'video'
      ? videoFormats
      : activeTab === 'audio'
      ? audioFormats
      : media.formats;

  const handleDownload = (format: MediaFormat) => {
    setDownloadingId(format.id);

    // Disparar o download no navegador
    const a = document.createElement('a');
    a.href = format.downloadUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Reset status após breve delay
    setTimeout(() => {
      setDownloadingId(null);
    }, 3500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Media Overview Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/80 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Thumbnail Preview */}
          <div className="relative w-full md:w-80 shrink-0 aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-md group">
            {media.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.thumbnail}
                alt={media.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <Video className="w-12 h-12 stroke-1" />
              </div>
            )}

            {/* Duration Badge */}
            {media.durationFormatted && (
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{media.durationFormatted}</span>
              </div>
            )}

            {/* Platform Tag */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>{media.platform}</span>
            </div>
          </div>

          {/* Media Info & Metadata */}
          <div className="flex-1 space-y-3.5 min-w-0">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug break-words">
                {media.title}
              </h2>
              {media.uploader && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{media.uploader}</span>
                </div>
              )}
            </div>

            {media.description && (
              <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                {media.description}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <a
                href={media.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium hover:underline"
              >
                <span>Ver link original</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <span>{media.formats.length} formatos analisados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formats Selection Area */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-slate-200/80 space-y-6">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Formatos Disponíveis para Download</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione a resolução ou qualidade desejada para iniciar o download direto.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({media.formats.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'video'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-blue-600" />
              <span>Vídeo ({videoFormats.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audio')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeTab === 'audio'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-emerald-600" />
              <span>Áudio ({audioFormats.length})</span>
            </button>
          </div>
        </div>

        {/* Formats Grid / List */}
        {filteredFormats.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-medium">Nenhum formato nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredFormats.map((format) => {
              const isDownloading = downloadingId === format.id;
              const isAudioOnly = !format.hasVideo && format.hasAudio;

              return (
                <div
                  key={format.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border transition-all duration-200 gap-4 ${
                    format.isRecommended
                      ? 'bg-gradient-to-r from-emerald-50/50 via-white to-white border-emerald-300/80 shadow-xs ring-1 ring-emerald-200/50'
                      : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  {/* Left: Format Details */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isAudioOnly
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isAudioOnly ? (
                        <Music className="w-5 h-5" />
                      ) : (
                        <Video className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {format.qualityLabel}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 text-xs font-bold uppercase tracking-wider">
                          {format.extension}
                        </span>

                        {format.isRecommended && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold shadow-2xs">
                            <Sparkles className="w-3 h-3" />
                            <span>Recomendado</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {format.filesizeFormatted && (
                          <span>Tamanho: <strong className="text-slate-700 font-semibold">{format.filesizeFormatted}</strong></span>
                        )}
                        {format.note && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">{format.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Download Action */}
                  <div className="w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownload(format)}
                      disabled={isDownloading}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm active:scale-95 ${
                        format.isRecommended
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 hover:shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Iniciando Download...</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownToLine className="w-4 h-4" />
                          <span>Baixar {format.extension.toUpperCase()}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

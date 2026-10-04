'use client';

import { useState } from 'react';
import { Search, Clipboard, X, Loader2, AlertTriangle, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import type { MediaInfo } from '@/types/media';

interface UrlAnalyzerProps {
  onAnalyzed: (data: MediaInfo) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  error: string | null;
  setError: (err: string | null) => void;
}

export function UrlAnalyzer({
  onAnalyzed,
  isLoading,
  setIsLoading,
  error,
  setError,
}: UrlAnalyzerProps) {
  const [url, setUrl] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const handlePaste = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setUrl(text.trim());
          setError(null);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        }
      }
    } catch {
      // Fallback se o navegador bloquear permissão de clipboard
      setError('Não foi possível acessar a área de transferência automaticamente. Cole manualmente (Ctrl+V).');
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError('Por favor, insira ou cole a URL de uma mídia pública.');
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      setError('A URL deve começar com http:// ou https://');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result?.error?.message ||
            'Não foi possível analisar a URL. Verifique se o link é público e válido.'
        );
      }

      onAnalyzed(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao processar requisição.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Form Container */}
      <form onSubmit={handleSubmit} className="relative space-y-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-slate-900 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition duration-300" />

          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl p-2 sm:p-2.5 shadow-xl border border-slate-200/80 gap-2">
            {/* Input Field */}
            <div className="relative flex-1 flex items-center min-w-0">
              <div className="pl-3.5 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-slate-500" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Cole o link da mídia aqui (ex: https://...)"
                disabled={isLoading}
                className="w-full bg-transparent py-3 pr-8 text-slate-900 placeholder:text-slate-400 text-base sm:text-lg focus:outline-hidden disabled:opacity-50"
                required
              />

              {/* Botão Limpar */}
              {url && !isLoading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors mr-1"
                  title="Limpar campo"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Botão Colar */}
              <button
                type="button"
                onClick={handlePaste}
                disabled={isLoading}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50"
                title="Colar da área de transferência"
              >
                {pasteSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Colado!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-4 h-4 text-slate-500" />
                    <span>Colar</span>
                  </>
                )}
              </button>

              {/* Botão Analisar */}
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-400 group-hover/btn:rotate-12 transition-transform duration-200" />
                    <span>Analisar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Security / Notice Badge */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-2 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verificação em tempo real de links públicos</span>
          </div>
          <span className="hidden sm:inline-block">Formatos MP4, WebM, MP3 e M4A</span>
        </div>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200/80 text-red-800 flex items-start gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-red-900">Não foi possível processar a mídia</p>
            <p className="mt-0.5 text-red-700 leading-relaxed">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-800 p-1 rounded-md"
            aria-label="Fechar mensagem de erro"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

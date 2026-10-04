import Link from 'next/link';
import { DownloadCloud, ShieldCheck } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <DownloadCloud className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white">
                MJR <span className="text-emerald-400">Downloader</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Plataforma para análise e download direto de mídias públicas autorizadas. Desenvolvido com foco em segurança, velocidade e integridade.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Sem bypass de DRM • Sem paywall • Sem dados falsos</span>
            </div>
          </div>

          {/* Col 2: Navegação */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Navegação
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Início (Analisador)
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-emerald-400 transition-colors">
                  Sobre a Plataforma
                </Link>
              </li>
              <li>
                <Link href="/termos" className="hover:text-emerald-400 transition-colors">
                  Termos & Conformidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Segurança */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Uso Responsável
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              O usuário é exclusivamente responsável por assegurar que possui os direitos, licenças ou autorizações cabíveis para o download do material.
            </p>
          </div>
        </div>

        {/* Linha Divisória */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="font-medium text-slate-300 text-center sm:text-left">
            MJR Downloader — Use somente em conteúdos que você tenha permissão para baixar.
          </div>
          <div className="flex items-center gap-1">
            <span>© {currentYear} MJR Downloader.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

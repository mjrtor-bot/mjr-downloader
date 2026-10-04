import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Server,
  Lock,
  FileCheck2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sobre a Plataforma | MJR Downloader',
  description:
    'Conheça os princípios de arquitetura, segurança e integridade do MJR Downloader.',
};

export default function SobrePage() {
  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider border border-emerald-200/80">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Transparência & Engenharia</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Sobre o <span className="text-emerald-600">MJR Downloader</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Uma solução robusta para inspeção e obtenção de mídias públicas autorizadas, com arquitetura limpa e alta fidelidade.
        </p>
      </div>

      {/* Main Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Arquitetura Desacoplada</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Construído com uma camada abstrata de <em>Media Providers</em> (provedores de mídia), permitindo alternar de forma transparente entre processamento local e microsserviços distribuídos.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Segurança & Proteção SSRF</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Todas as URLs passam por validação rigorosa de DNS e bloqueio de redes privadas (RFC 1918, CGNAT, Loopback) e limitadores de taxa para prevenir abusos.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-md space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
            <Server className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Streaming Direto</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            O tráfego de dados é canalizado via streams contínuos do Node.js, impedindo o acúmulo de arquivos gigantescos na memória RAM do servidor.
          </p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-lg space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>Motor de Mídia: yt-dlp & FFmpeg</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            O backend do MJR Downloader aproveita a precisão dos motores de extração <strong>yt-dlp</strong> e utilitários de transcodificação <strong>FFmpeg</strong>. As chamadas de sistema utilizam arrays de argumentos isolados (sem execução direta em shell com concatenação de strings), eliminando riscos de injeção de comandos.
          </p>
        </section>

        <hr className="border-slate-100" />

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-blue-600" />
            <span>Compromisso Ético e Legal</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Nossa plataforma não implementa e repudia qualquer funcionalidade destinada a:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
            <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Bypass de DRM ou criptografia</span>
            </li>
            <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Contorno de paywalls e assinaturas</span>
            </li>
            <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Extração de cookies e sessões de terceiros</span>
            </li>
            <li className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Acesso a conteúdos privados não autorizados</span>
            </li>
          </ul>
        </section>

        <hr className="border-slate-100" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-sm text-slate-500">
            Dúvidas sobre o uso legal da plataforma?
          </div>
          <Link
            href="/termos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
          >
            <span>Consultar Termos de Uso</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

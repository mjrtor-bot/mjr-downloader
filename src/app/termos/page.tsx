import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Termos de Uso e Conformidade | MJR Downloader',
  description:
    'Diretrizes de uso responsável, direitos autorais e conformidade legal da plataforma MJR Downloader.',
};

export default function TermosPage() {
  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider border border-blue-200/80">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span>Conformidade & Diretrizes</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Termos de Uso e Política de Uso Aceitável
        </h1>
        <p className="text-sm text-slate-500">
          Última atualização: Outubro de 2026
        </p>
      </div>

      {/* Terms Body */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-lg space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
        {/* Aviso Destacado */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <strong>Aviso de Responsabilidade:</strong> O MJR Downloader destina-se exclusivamente à análise e obtenção de conteúdos de domínio público, sob licenças abertas (Creative Commons) ou mídias para as quais o usuário possua explícita autorização ou direitos autorais.
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar ou utilizar o <strong>MJR Downloader</strong>, você concorda expressamente em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Caso discorde de qualquer disposição, solicitamos que não utilize nossos serviços.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">2. Finalidade e Propriedade Intelectual</h2>
          <p>
            O MJR Downloader é uma ferramenta técnica que apenas analisa formatos disponibilizados publicamente na web. A plataforma:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>Não hospeda, armazena permanentemente ou retransmite mídias com direitos protegidos.</li>
            <li>Não incentiva nem facilita a infração de propriedade intelectual de terceiros.</li>
            <li>Não comercializa nenhum dos conteúdos multimídia analisados.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">3. Vedações e Proibições Estritas</h2>
          <p>É terminantemente proibido utilizar o serviço para:</p>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <span>Tentar burlar sistemas de DRM (Digital Rights Management) ou travas de segurança.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <span>Efetuar ataques de negação de serviço (DoS), abusar de chamadas de API ou contornar limites de taxa (rate limits).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <span>Realizar varreduras internas de rede (SSRF) ou apontar URLs para servidores privados/localhost.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <span>Baixar ou redistribuir conteúdos protegidos por direitos autorais sem expressa anuência dos detentores legais.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">4. Isenção de Garantias e Limitação de Responsabilidade</h2>
          <p>
            O serviço é fornecido no estado em que se encontra (&quot;as is&quot;), sem garantias de qualquer tipo, expressas ou implícitas. Os desenvolvedores e mantenedores do MJR Downloader não se responsabilizam por eventuais usos indevidos, perdas, danos ou violações de direitos causadas por usuários.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900">5. Privacidade e Dados</h2>
          <p>
            Não exigimos criação de conta, senhas ou dados cadastrais. As URLs submetidas são tratadas em tempo real e não são vendidas ou compartilhadas com terceiros.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>MJR Downloader — Uso Consciente e Responsável.</span>
          <Link href="/" className="text-blue-600 font-semibold hover:underline">
            Ir para o Analisador de Mídia
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Link2, Cpu, DownloadCloud, ShieldCheck, Zap, Lock, SlidersHorizontal, CheckCircle2 } from 'lucide-react';

export function FeaturesSection() {
  const steps = [
    {
      step: '01',
      title: 'Cole o Link',
      description: 'Insira a URL pública da mídia que você possui permissão para baixar.',
      icon: Link2,
      color: 'from-blue-600 to-indigo-700',
    },
    {
      step: '02',
      title: 'Análise Inteligente',
      description: 'Nosso motor inspeciona os formatos, resoluções e faixas de áudio disponíveis.',
      icon: Cpu,
      color: 'from-slate-800 to-slate-950',
    },
    {
      step: '03',
      title: 'Download Seguro',
      description: 'Escolha a qualidade desejada e baixe o arquivo via streaming direto.',
      icon: DownloadCloud,
      color: 'from-emerald-600 to-teal-700',
    },
  ];

  const highlights = [
    {
      icon: ShieldCheck,
      title: 'Proteção & Conformidade',
      description: 'Não quebramos DRM, paywall ou autenticação. Apenas conteúdos públicos e autorizados.',
    },
    {
      icon: Zap,
      title: 'Streaming sem Buffer',
      description: 'Os downloads são transmitidos diretamente sem armazenar vídeos pesados na memória do servidor.',
    },
    {
      icon: Lock,
      title: 'Privacidade Total',
      description: 'Não exigimos login, não rastreamos dados pessoais e não salvamos histórico de navegação.',
    },
    {
      icon: SlidersHorizontal,
      title: 'Múltiplos Formatos',
      description: 'Suporte a MP4, WebM, MP3 e M4A com separação de resoluções de 360p até 1080p Full HD.',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mt-20 space-y-20">
      {/* 3-Step Flow */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider border border-blue-200/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Fluxo Simplificado</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Como funciona em 3 etapas simples
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            Sem cadastro, sem complicações e com total transparência em cada formato analisado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative bg-white rounded-3xl p-7 border border-slate-200/80 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <div className="absolute top-4 right-5 text-4xl font-black text-slate-100 group-hover:text-emerald-50 transition-colors">
                  {item.step}
                </div>

                <div className="relative space-y-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security & Architecture Highlights */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-10">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Arquitetura & Segurança
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Engenharia moderna projetada para alta performance
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Construído sobre Next.js App Router, camada desacoplada de provedores de mídia e execução protegida contra vulnerabilidades web.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div
                key={h.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">{h.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{h.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

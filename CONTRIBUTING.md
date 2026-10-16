# Contribuindo para o MJR Downloader

Obrigado pelo interesse em contribuir.

## Antes de começar

- Abra uma issue descrevendo o problema ou a melhoria proposta.
- Para correções de segurança, **não publique detalhes de exploração nem credenciais em issues públicas**. Entre em contato privadamente com os mantenedores pelo canal de segurança do GitHub, quando disponível.
- Respeite direitos autorais e os termos das plataformas. Não proponha funcionalidades para contornar DRM, paywalls ou controles de acesso.

## Desenvolvimento local

1. Faça um fork e crie uma branch descritiva.
2. Instale as dependências com `npm install`.
3. Copie `.env.example` para `.env.local` e use apenas credenciais de desenvolvimento.
4. Execute `npm run lint`, `npm run build` e `npm run test:e2e` em um ambiente com as dependências externas necessárias.
5. Abra um pull request explicando a mudança, os testes executados e eventuais limitações.

Nunca inclua tokens, senhas, arquivos `.env.local`, dados pessoais ou mídia sem autorização no repositório.

## Revisão

As contribuições passam por revisão dos mantenedores. A abertura de um pull request não garante sua incorporação. Consulte o README para arquitetura e requisitos.

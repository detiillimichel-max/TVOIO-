# TVOIO-

Central de canais do projeto TV OIO, publicada como site estático no GitHub Pages.

## Arquitetura atual

```text
index.html
├── js/config.js
├── js/globo.js
├── js/band.js
├── js/cultura.js
├── js/tvescola.js
└── js/canalfuturalive.js
```

O frontend monta os canais e carrosséis. As consultas que exigem credenciais devem passar por um backend seguro.

## Regra de segurança

**Nunca colocar API keys privadas, client secrets ou bearer tokens dentro do HTML, JavaScript público ou artefato do GitHub Pages.**

O `js/config.js` contém somente configuração pública, principalmente a URL do backend.

As Secrets do GitHub podem continuar armazenando credenciais de CI/CD, mas não devem ser injetadas em arquivos publicados pelo Pages.

## API segura

O frontend espera futuramente um endpoint público do backend:

```text
GET {apiBaseUrl}/youtube/search?q=<consulta>&maxResults=8
```

O backend deverá usar `YOUTUBE_API_KEY` como Secret no servidor e devolver JSON compatível com os itens de busca do YouTube.

A URL do backend será definida em `js/config.js` quando o Worker/Edge Function estiver pronto.

## Deploy

O workflow `.github/workflows/deploy.yml` publica o conteúdo do repositório no GitHub Pages sem copiar Secrets para o frontend.

URL prevista:

`https://detiillimichel-max.github.io/TVOIO-/`

## Próxima etapa

1. Criar o backend seguro no Cloudflare Worker ou Supabase Edge Function.
2. Colocar `YOUTUBE_API_KEY` somente como Secret no backend.
3. Configurar `apiBaseUrl` no `js/config.js`.
4. Testar os cinco canais no GitHub Pages.
5. Depois integrar as demais APIs sem expor credenciais privadas.

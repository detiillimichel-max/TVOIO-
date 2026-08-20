# OIO TV API — Cloudflare Worker

Este Worker é a única camada que deve acessar as chaves privadas das APIs.

## Endpoints ativados nesta primeira base

- `GET /health`
- `GET /youtube/search?q=...`
- `GET /tmdb/search?q=...`
- `GET /spotify/search?q=...`
- `GET /twitch/search?q=...`
- `GET /vimeo/search?q=...`
- `GET /pexels/search?q=...`
- `GET /pixabay/search?q=...`
- `GET /nasa/apod`
- `GET /gnews/search?q=...`
- `GET /guardian/search?q=...`
- `GET /europeana/search?q=...`
- `GET /dpla/search?q=...`
- `GET /nara/search?q=...`
- `GET /jamendo/search?q=...`
- `POST /ai/gemini`
- `POST /ai/groq`
- `POST /ai/huggingface`

## Ainda reservados

Audius, Qwen, Daily, ElevenLabs, Facebook e Web Push precisam de adaptadores específicos antes de serem ativados. O Worker retorna HTTP 501 para eles em vez de fingir que estão funcionando.

## Secrets

Os valores **não** ficam no GitHub. Configure-os no Worker pelo Cloudflare Dashboard. O código lê somente os nomes das variáveis, por exemplo `YOUTUBE_API_KEY` e `SPOTIFY_CLIENT_SECRET`.

Não coloque `.env`, `.dev.vars` ou valores reais de chaves neste diretório.

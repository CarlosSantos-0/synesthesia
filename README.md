# 🎛️ Visualizador Rítmico Procedural (Spotify API)

Uma aplicação web interativa que gera artes visuais em tempo real baseadas na reprodução ativa do Spotify do usuário. Construído com React e a API do Canvas, o projeto foca em alta performance (60 FPS) e renderização procedural, dispensando o uso de vídeos pré-renderizados.

## ✨ Funcionalidades e Camadas Visuais

A interface funciona como uma mesa de VJ, permitindo alternar camadas visuais de forma independente:

* **Background Dinâmico:** Gradiente de névoa radial que extrai a paleta de cores predominante da capa do álbum (`extract-colors`) e pulsa organicamente através de modulação senoidal.
* **Partículas Cinéticas:** Motor de física customizado no Canvas onde partículas orbitam e reagem a choques rítmicos simulados baseados na energia da faixa.
* **Anel Orbital (Sequenciador):** Uma interface rítmica que lê a métrica da música, expandindo e retraindo componentes geométricos baseados nos tempos de compasso (4, 8 ou 16 steps).
* **Equalizador Melódico (Procedural):** Renderização matemática de onda contínua que simula um vale líquido. A altura das barras responde a um algoritmo de *Lerp* (Interpolação Linear) para garantir suavidade, e a intensidade das ondulações é governada pela energia lida via API.

## 🔒 Arquitetura de Segurança: OAuth 2.0 com PKCE

Devido às recentes atualizações de segurança na API Web do Spotify (descontinuação do fluxo *Implicit Grant*), esta aplicação foi projetada utilizando o fluxo **Authorization Code com PKCE (Proof Key for Code Exchange)**.

1.  A aplicação cliente (SPA) gera um `code_verifier` (string aleatória) e o criptografa via `SHA-256` para criar um `code_challenge`.
2.  O usuário é redirecionado ao Spotify com o desafio.
3.  Após o login, o Spotify retorna um código de autorização provisório.
4.  O cliente envia este código junto com o verificador original em uma requisição POST escondida para obter o `access_token` final.

Essa arquitetura garante que a aplicação não necessite de um backend para esconder um *Client Secret*, mantendo a segurança do token mesmo rodando 100% no navegador.

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js instalado.
* Uma conta no [Spotify for Developers](https://developer.spotify.com/).

### 1. Configurando o Spotify Developer
1. Crie um aplicativo no seu *Dashboard* do Spotify.
2. Em **Settings**, adicione `http://127.0.0.1:5173/` na lista de **Redirect URIs**.
3. Em **User Management**, adicione o e-mail da conta Spotify que será usada para testar (obrigatório enquanto o app estiver em *Development Mode*).
4. Copie o seu **Client ID**.

### 2. Configurando a Aplicação
Clone este repositório e instale as dependências:

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd visualizador-ritmico
npm install
```

Crie um arquivo chamado `.env` na raiz do projeto e insira a sua chave do Spotify:

```env
VITE_SPOTIFY_CLIENT_ID=seu_client_id_aqui
```

### 3. Rodando o Servidor
Inicie a aplicação utilizando o Vite:

```bash
npm run dev
```

**⚠️ Importante:** Acesse a aplicação rigorosamente através do link `http://127.0.0.1:5173/`. O uso de `localhost` é bloqueado pelas políticas atuais de PKCE do Spotify.

## 🛠️ Tecnologias Utilizadas
* **React (Vite):** Estruturação e reatividade da interface.
* **HTML5 Canvas API:** Renderização gráfica procedural e manipulação de pixels (`globalCompositeOperation`, `requestAnimationFrame`).
* **Spotify Web API:** Aquisição de metadados (`trackName`, `albumCoverUrl`) e características de áudio numéricas (`bpm`, `energy`).
* **Lucide React:** Biblioteca de ícones da interface SVG.
* **extract-colors:** Biblioteca auxiliar para mapeamento de paleta de cores via buffer de imagem offscreen.

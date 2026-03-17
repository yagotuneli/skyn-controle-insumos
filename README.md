# SKYN · Controle de Insumos v7

Sistema de inventário para clínicas de estética com catálogo ANVISA, FIFO, rastreabilidade de lotes, gestão financeira e dark mode.

---

## Deploy no Netlify — Passo a Passo

### Opção A: Deploy via GitHub (recomendado — deploys automáticos)

**1. Suba o projeto no GitHub:**
```bash
cd skyn-netlify
git init
git add .
git commit -m "SKYN v7 - initial deploy"
```
Crie um repositório no GitHub (ex: `skyn-controle-insumos`) e faça o push:
```bash
git remote add origin https://github.com/SEU_USUARIO/skyn-controle-insumos.git
git branch -M main
git push -u origin main
```

**2. Conecte ao Netlify:**
- Acesse [app.netlify.com](https://app.netlify.com)
- Clique **"Add new site"** → **"Import an existing project"**
- Selecione **GitHub** e autorize o acesso
- Escolha o repositório `skyn-controle-insumos`

**3. Configure o build:**
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- Clique **"Deploy site"**

**4. Pronto!** O Netlify vai buildar e gerar um link tipo:
```
https://skyn-insumos.netlify.app
```
Você pode customizar o nome em **Site settings** → **Change site name**.

> A cada `git push` no main, o Netlify faz deploy automático.

---

### Opção B: Deploy manual (arrastar e soltar)

**1. Builde localmente:**
```bash
cd skyn-netlify
npm install
npm run build
```

**2. Suba a pasta `dist`:**
- Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
- Arraste a pasta `dist/` inteira para a área de upload
- O site fica no ar imediatamente

---

### Opção C: Deploy via Netlify CLI

```bash
# Instale o CLI
npm install -g netlify-cli

# Faça login
netlify login

# Na pasta do projeto:
cd skyn-netlify
npm run build

# Deploy preview (para testar):
netlify deploy --dir=dist

# Deploy em produção:
netlify deploy --dir=dist --prod
```

---

## Domínio Personalizado (Opcional)

1. Em **Site settings** → **Domain management** → **Add custom domain**
2. Insira: `insumos.skynestetica.com.br` (ou o domínio que preferir)
3. Aponte o DNS do seu domínio para os nameservers do Netlify, ou crie um CNAME:
   ```
   CNAME  insumos  seu-site.netlify.app
   ```
4. O Netlify gera certificado HTTPS automático via Let's Encrypt

---

## Instalar como App no Celular (PWA)

Depois do deploy, no celular:
- **iPhone:** Safari → botão compartilhar → "Adicionar à Tela de Início"
- **Android:** Chrome → menu ⋮ → "Instalar aplicativo"

O app aparece como ícone na home, abre em tela cheia sem barra do navegador.

---

## Estrutura do Projeto

```
skyn-netlify/
├── public/
│   └── manifest.json       ← PWA config
├── src/
│   ├── main.jsx            ← Entry point React
│   └── App.jsx             ← App completo (single file)
├── index.html              ← HTML shell
├── netlify.toml            ← Config Netlify (build + redirects)
├── vite.config.js          ← Bundler config
├── package.json            ← Dependências
└── .gitignore
```

## Stack

- **React 18** + Hooks + Context API (split InvCtx / UICtx)
- **Vite 6** (build em ~2s)
- **localStorage** para persistência
- **Zero dependências externas** além de React

## Funcionalidades

- Catálogo ANVISA com 35 produtos pré-cadastrados
- Autocompletar inteligente com busca fuzzy
- Conversão de embalagem (1 cx → N unidades)
- Lotes opcionais com validade e FIFO automático
- Rastreabilidade ANVISA (consumedLots em cada saída)
- Custo unitário + Capital Imobilizado no dashboard
- Multi-profissional (quem fez a movimentação)
- Dark mode persistente
- Export CSV com filtro de período
- Onboarding no primeiro uso
- Alertas de estoque baixo e vencimento próximo
- Mobile-first, instalável como PWA

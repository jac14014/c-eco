# Plano de Reorganização — Repositório c-ECO

## 1. Diagnóstico

O repositório tem ~190 arquivos achatados na raiz, misturando: doutrina jurídica, TFP, TDR, fellowship (módulos + contratos + casos), foundation/ISM, enterprise, Amazon Lab, setores/GSM, artigos, imagens de pessoas, ícones PWA e contratos privados nominais. Problemas concretos encontrados:

1. **Links quebrados em produção**: o rodapé de `english.html` aponta para `cs-tapajos.html` e `cs-yemen.html`, que não existem (os arquivos reais são `fellowship-cs-tapajos.html` / `fellowship-cs-yemen.html`). Retorna 404 no site publicado.
2. **Pastas duplicadas**: existe `assets` e `" assets"` (com espaço no início do nome).
3. **Arquivos com espaço no nome**: `bonn .PNG`, `Botanickiel .PNG`, `mangotree .JPG`, `manuscript .JPG` — causam URLs frágeis (%20).
4. **Duplicatas/ambiguidades**: `license` vs `LICENSE`; `law.html` vs `model-law.html` vs `lei-modal` vs `law-gated`; `manual.html` vs `tfp-manual.html`; `flowcharts.html` vs `flowcharts-operational.html`. Verificar quais são versões antigas e arquivar ou remover.
5. **⚠️ Risco de privacidade (prioridade máxima)**: `barbara-agreement.html`, `oliveira-2026-agreement.html`, `oliveira-2026-nda.html`, `orlando-2026.html`, `orlando.html` e os NDAs do ISM parecem ser contratos nominais com pessoas reais — estão em repositório **público**. Mesmo que as páginas tenham `noindex`, o GitHub é indexável e o histórico git preserva tudo. Recomendação: mover para repositório privado e expurgar do histórico com `git filter-repo`. O script move-os para `/private-agreements/` apenas como etapa intermediária de triagem.

## 2. Estrutura proposta

```
/                       index.html, english.html, CNAME, LICENSE, README.md,
                        manifest.json, sw.js, offline.html, favicon.png,
                        vercel.json, package.json, privacy-policy.html
/doctrine/              Model Law, Manual, lei modal, screening, ESL, UNIDROIT, códigos
/tfp/                   intro, concepts, instruments, operational, protocol,
                        system-architecture, flowcharts
/tdr/                   todos os tdr-*.html
/fellowship/            portal, call, app, spn, sil
/fellowship/modules/    módulos 1–6 (fin/min)
/fellowship/agreements/ FPA, MAI, CDGA, CSAM, MSA, MNDA, OCAP, LLEP, SOW, ISM NDA/SDA
/fellowship/cases/      Brumadinho, Tapajós, Yemen, EC-Tapajós
/foundation/            Hasse Foundation, ISM, MOU, board, governance, org-chart,
                        hiring, partnerships, funding
/enterprise/            enterprise, pilot, pathway, feasibility, executive-summary,
                        report, finance-architecture, risk-infrastructure
/amazon-lab/            todos os amazon-lab-*.html
/sectors/               GSM (AI, energia, biocombustíveis, solar geo, água),
                        emergency-sectors, prudential-risk, living-labs, BFCIS, ESCIS
/content/               artigos, book, páginas avulsas, community
/pt/                    conteúdo em português (já existe; recebe portuguese.html,
                        artigo01, piloto, community-pt, funding-manual-pt, pt, ptp)
/de /es /fr /ja /zh-cn  mantidas como estão
/assets/img/            fotos e imagens (nomes normalizados, sem espaços, minúsculas)
/assets/icons/          ícones PWA
/private-agreements/    ⚠️ triagem temporária — destino final: repo privado
/api /docs /observatory mantidas como estão
```

## 3. Por que assim

- **URL = taxonomia da doutrina.** As pastas espelham as camadas que o próprio site descreve (Doutrina → TFP → TDR → Fellowship → Enterprise → Setores), o que facilita navegação, manutenção e onboarding de colaboradores.
- **Separação público × privado.** Contratos nominais não pertencem ao mesmo espaço que material doutrinário público.
- **Compatibilidade com o site no ar.** Nada quebra: o script gera redirects 301 para o Vercel e, opcionalmente, stubs HTML para GitHub Pages.

## 4. Como executar (ordem exata)

```bash
git checkout -b reorganizacao
chmod +x migrate.sh
./migrate.sh --dry-run     # revisar saída
./migrate.sh               # executar de verdade
```

O script faz, nesta ordem:
1. Cria os diretórios.
2. Move tudo com `git mv` (preserva histórico).
3. Mescla a pasta duplicada `" assets"`.
4. **Reescreve os `href`/`src` internos** de todos os HTML para os novos caminhos absolutos (e corrige os links quebrados `cs-tapajos.html`/`cs-yemen.html`).
5. Gera `vercel.redirects.json` com redirects 301 — mesclar manualmente no `vercel.json` existente.

Depois do script, ajustes manuais obrigatórios:
- **`manifest.json`**: atualizar caminhos dos ícones para `/assets/icons/...`.
- **`sw.js`** (service worker): atualizar a lista de cache com os novos caminhos, e **incrementar a versão do cache**, senão usuários ficam presos na versão antiga offline.
- **`vercel.json`**: mesclar os redirects gerados.
- Decidir o destino de `license`, `law-gated`, `lei-modal`, `copy.html`, `alpha.html` (parecem rascunhos/duplicatas).
- **Privacidade**: mover `/private-agreements/` para repo privado e rodar `git filter-repo` para expurgar do histórico público.

## 5. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Links externos antigos (e-mails, PDFs, parceiros) | Redirects 301 no Vercel cobrem todos os caminhos antigos |
| Site também servido via GitHub Pages (há CNAME) | Rodar `./migrate.sh --stubs` para gerar páginas de redirecionamento |
| PWA com cache antigo | Bump de versão no `sw.js` |
| Links relativos dentro de páginas movidas | O script já reescreve para caminhos absolutos `/pasta/arquivo.html` |
| Tradução (`/pt`, `/es`...) com links para a raiz | A reescrita do passo 4 cobre todos os `.html` do repo, incluindo as pastas de idioma |

## 6. Verificação pós-migração

```bash
# procurar referências órfãs a arquivos da raiz antiga
grep -rEo 'href="[^"]+\.html"' --include='*.html' . | grep -v '/' | sort -u

# checar 404 localmente (ex.: npx serve) clicando pela navegação principal
```

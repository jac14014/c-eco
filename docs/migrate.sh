#!/usr/bin/env bash
# ============================================================
# c-ECO — Script de reorganização do repositório (v1.0)
# Uso:  ./migrate.sh            -> move arquivos + reescreve links + gera vercel.redirects.json
#       ./migrate.sh --dry-run  -> apenas mostra o que seria feito
#       ./migrate.sh --stubs    -> além de tudo, cria stubs de redirecionamento HTML
#                                  (necessário se o site também é servido via GitHub Pages)
# Execute na RAIZ do repositório, de preferência em um branch novo:
#   git checkout -b reorganizacao
# ============================================================
set -euo pipefail

DRY=0; STUBS=0
for a in "$@"; do
  [ "$a" = "--dry-run" ] && DRY=1
  [ "$a" = "--stubs" ] && STUBS=1
done

run() { if [ "$DRY" = "1" ]; then echo "[dry] $*"; else eval "$@"; fi }

# ------------------------------------------------------------
# TABELA DE MAPEAMENTO (fonte única de verdade)
# formato:  caminho-antigo|caminho-novo
# ------------------------------------------------------------
MAP="$(cat <<'EOF'
law.html|doctrine/law.html
model-law.html|doctrine/model-law.html
lei-modal|doctrine/lei-modal.html
law-gated|doctrine/law-gated.html
manual.html|doctrine/manual.html
tfp-manual.html|doctrine/tfp-manual.html
pre-threshold-principle.html|doctrine/pre-threshold-principle.html
screening.html|doctrine/screening.html
esl.html|doctrine/esl.html
unidroit.html|doctrine/unidroit.html
codes.html|doctrine/codes.html
access-law.html|doctrine/access-law.html
tfp-intro.html|tfp/tfp-intro.html
tfp-concepts.html|tfp/tfp-concepts.html
tfp-instruments.html|tfp/tfp-instruments.html
tfp-operational.html|tfp/tfp-operational.html
tfp-pt-biofuel.html|tfp/tfp-pt-biofuel.html
tfp-pt-energy.html|tfp/tfp-pt-energy.html
protocol.html|tfp/protocol.html
system-architecture.html|tfp/system-architecture.html
flowcharts.html|tfp/flowcharts.html
flowcharts-operational.html|tfp/flowcharts-operational.html
tdr.html|tdr/tdr.html
tdr-audit-traceability.html|tdr/tdr-audit-traceability.html
tdr-calibration.html|tdr/tdr-calibration.html
tdr-core.html|tdr/tdr-core.html
tdr-data.html|tdr/tdr-data.html
tdr-dvb.html|tdr/tdr-dvb.html
tdr-financial-architecture.html|tdr/tdr-financial-architecture.html
tdr-framework.html|tdr/tdr-framework.html
tdr-hasse-foundation.html|tdr/tdr-hasse-foundation.html
tdr-indicator-architecture.html|tdr/tdr-indicator-architecture.html
tdr-mathematics.html|tdr/tdr-mathematics.html
tdr-scores.html|tdr/tdr-scores.html
tdr-signal-processing.html|tdr/tdr-signal-processing.html
tdr-slides.html|tdr/tdr-slides.html
tdr-state-machine.html|tdr/tdr-state-machine.html
tdr-tfp-interface.html|tdr/tdr-tfp-interface.html
tdr-tfp-variables.html|tdr/tdr-tfp-variables.html
tdr-trigger-catalogue.html|tdr/tdr-trigger-catalogue.html
fellowship.html|fellowship/fellowship.html
fellowship-portal.html|fellowship/fellowship-portal.html
fellowship-app.html|fellowship/fellowship-app.html
fellowship-amazon-lab.html|fellowship/fellowship-amazon-lab.html
fellowship-spn.html|fellowship/fellowship-spn.html
fellowship-tfp.html|fellowship/fellowship-tfp.html
fellowship-sil-digital.html|fellowship/fellowship-sil-digital.html
fellowship-sil-min.html|fellowship/fellowship-sil-min.html
sil-digital.html|fellowship/sil-digital.html
fellowship-module1.html|fellowship/modules/fellowship-module1.html
fellowship-module2-fin.html|fellowship/modules/fellowship-module2-fin.html
fellowship-module2-min.html|fellowship/modules/fellowship-module2-min.html
fellowship-module3-fin.html|fellowship/modules/fellowship-module3-fin.html
fellowship-module3-min.html|fellowship/modules/fellowship-module3-min.html
fellowship-module4-fin.html|fellowship/modules/fellowship-module4-fin.html
fellowship-module4-min.html|fellowship/modules/fellowship-module4-min.html
fellowship-module5-fin.html|fellowship/modules/fellowship-module5-fin.html
fellowship-module5-min.html|fellowship/modules/fellowship-module5-min.html
fellowship-module6-fin.html|fellowship/modules/fellowship-module6-fin.html
fellowship-module6-min.html|fellowship/modules/fellowship-module6-min.html
fellowship-cdga.html|fellowship/agreements/fellowship-cdga.html
fellowship-collab-agreement.html|fellowship/agreements/fellowship-collab-agreement.html
fellowship-csam.html|fellowship/agreements/fellowship-csam.html
fellowship-fpa.html|fellowship/agreements/fellowship-fpa.html
fellowship-ism-addendum01-2026.html|fellowship/agreements/fellowship-ism-addendum01-2026.html
fellowship-ism-nda-2026.html|fellowship/agreements/fellowship-ism-nda-2026.html
fellowship-ism-sda-2026.html|fellowship/agreements/fellowship-ism-sda-2026.html
fellowship-llep.html|fellowship/agreements/fellowship-llep.html
fellowship-mai.html|fellowship/agreements/fellowship-mai.html
fellowship-mnda.html|fellowship/agreements/fellowship-mnda.html
fellowship-msa.html|fellowship/agreements/fellowship-msa.html
fellowship-ocap.html|fellowship/agreements/fellowship-ocap.html
fellowship-sow.html|fellowship/agreements/fellowship-sow.html
fellowship-cs-brumadinho.html|fellowship/cases/fellowship-cs-brumadinho.html
fellowship-cs-tapajos.html|fellowship/cases/fellowship-cs-tapajos.html
fellowship-cs-yemen.html|fellowship/cases/fellowship-cs-yemen.html
fellowship-ec-tapajos.html|fellowship/cases/fellowship-ec-tapajos.html
foundation.html|foundation/foundation.html
foundation-board.html|foundation/foundation-board.html
foundation-board-draft.html|foundation/foundation-board-draft.html
foundation-egs.html|foundation/foundation-egs.html
foundation-governance.html|foundation/foundation-governance.html
ism.html|foundation/ism.html
ism-mou.html|foundation/ism-mou.html
org-chart.html|foundation/org-chart.html
hiring-plan.html|foundation/hiring-plan.html
memo.html|foundation/memo.html
ma.html|foundation/ma.html
about.html|foundation/about.html
institutional.html|foundation/institutional.html
partnerships.html|foundation/partnerships.html
partnerships-interest.html|foundation/partnerships-interest.html
funding-manual.html|foundation/funding-manual.html
iofa.html|foundation/iofa.html
enterprise.html|enterprise/enterprise.html
enterprise-folder.html|enterprise/enterprise-folder.html
pilot.html|enterprise/pilot.html
pathway.html|enterprise/pathway.html
practice.html|enterprise/practice.html
feasibility.html|enterprise/feasibility.html
executive-summary.html|enterprise/executive-summary.html
report.html|enterprise/report.html
finance-architecture.html|enterprise/finance-architecture.html
frp.html|enterprise/frp.html
risk-infrastructure.html|enterprise/risk-infrastructure.html
alpha.html|enterprise/alpha.html
app.html|enterprise/app.html
portal.html|enterprise/portal.html
amazon-lab.html|amazon-lab/amazon-lab.html
amazon-lab-funder.html|amazon-lab/amazon-lab-funder.html
amazon-lab-funding.html|amazon-lab/amazon-lab-funding.html
amazon-lab-one-pager.html|amazon-lab/amazon-lab-one-pager.html
amazon-lab-pitch-deck.html|amazon-lab/amazon-lab-pitch-deck.html
amazon-lab-risks.html|amazon-lab/amazon-lab-risks.html
amazon-lab-slides.html|amazon-lab/amazon-lab-slides.html
gsm-ai.html|sectors/gsm-ai.html
gsm-biofuels.html|sectors/gsm-biofuels.html
gsm-es.html|sectors/gsm-es.html
gsm-solargeo.html|sectors/gsm-solargeo.html
gsm-watersys.html|sectors/gsm-watersys.html
global-map.html|sectors/global-map.html
global-map-g.html|sectors/global-map-g.html
emergency-sectors.html|sectors/emergency-sectors.html
prudential-risk.html|sectors/prudential-risk.html
living-labs.html|sectors/living-labs.html
bfcis.html|sectors/bfcis.html
escis.html|sectors/escis.html
article01.html|content/article01.html
book.html|content/book.html
page01.html|content/page01.html
page02.html|content/page02.html
questions.html|content/questions.html
research-resume.html|content/research-resume.html
community.html|content/community.html
copy.html|content/copy.html
portuguese.html|pt/portuguese.html
pt.html|pt/pt.html
ptp.html|pt/ptp.html
artigo01.html|pt/artigo01.html
community-pt.html|pt/community-pt.html
piloto.html|pt/piloto.html
funding-manual-pt.html|pt/funding-manual-pt.html
barbara-agreement.html|private-agreements/barbara-agreement.html
oliveira-2026-agreement.html|private-agreements/oliveira-2026-agreement.html
oliveira-2026-nda.html|private-agreements/oliveira-2026-nda.html
orlando-2026.html|private-agreements/orlando-2026.html
orlando.html|private-agreements/orlando.html
agathe.PNG|assets/img/agathe.png
amizade.jpg|assets/img/amizade.jpg
andre.PNG|assets/img/andre.png
batistacampos.PNG|assets/img/batistacampos.png
bonn .PNG|assets/img/bonn.png
Botanickiel .PNG|assets/img/botanickiel.png
daniel.PNG|assets/img/daniel.png
eduard.PNG|assets/img/eduard.png
erelyn-alves.PNG|assets/img/erelyn-alves.png
fellow-poster-pt.PNG|assets/img/fellowship/fellow-poster-pt.png
fellow-poster.PNG|assets/img/fellowship/fellow-poster.png
fellow.PNG|assets/img/fellowship/fellowcoin.png
flavia.PNG|assets/img/flavia.png
flavia.jpg|assets/img/flavia.jpg
hasse-memory.png|assets/img/hasse-memory.png
ism.jpg|assets/img/ism.jpg
jacqueline-ennis.PNG|assets/img/jacqueline-ennis.png
jch.PNG|assets/img/jch.png
joao.PNG|assets/img/joao.png
kiel-university.PNG|assets/img/kiel-university.png
lineage.PNG|assets/img/lineage.png
logo.png|assets/img/logo.png
logoblack.png|assets/img/logoblack.png
logofundopreto.PNG|assets/img/fellowship/shieldfundored.png
logoiconblack.png|assets/img/logoiconblack.png
logoiconwhite.png|assets/img/logoiconwhite.png
logonoblack.png|assets/img/logonoblack.png
logonowhite.png|assets/img/logonowhite.png
logowhite.png|assets/img/fellowship/shield-logo.PNG
mangotree .JPG|assets/img/mangotree.jpg
manuscript .JPG|assets/img/manuscript.jpg
maria-alvina.PNG|assets/img/maria-alvina.png
red.PNG|assets/img/fellowship/shieldred.png
seal.PNG|assets/img/seal.png
sign.png|assets/img/sign.png
signx.png|assets/img/fellowship/fellowship-logo.PNG
vika.png|assets/img/vika.png
icon-1024.PNG|assets/icons/icon-1024.png
icon-1254.PNG|assets/icons/icon-1254.png
icon-128.png|assets/icons/icon-128.png
icon-144.png|assets/icons/icon-144.png
icon-152.png|assets/icons/icon-152.png
icon-192.png|assets/icons/icon-192.png
icon-384.png|assets/icons/icon-384.png
icon-512-red.jpg|assets/icons/icon-512-red.jpg
icon-512.jpg|assets/icons/icon-512.jpg
icon-72.png|assets/icons/icon-72.png
icon-96.png|assets/icons/icon-96.png
EOF
)"

echo "== 1/5 Criando diretórios =="
echo "$MAP" | cut -d'|' -f2 | xargs -n1 dirname | sort -u | while read -r d; do
  run "mkdir -p '$d'"
done

echo "== 2/5 Movendo arquivos (git mv) =="
echo "$MAP" | while IFS='|' read -r old new; do
  if [ -e "$old" ]; then
    run "git mv -f \"$old\" \"$new\""
  else
    echo "  [aviso] não encontrado: $old"
  fi
done

echo "== 3/5 Consolidando pasta duplicada ' assets' (com espaço) =="
if [ -d " assets" ]; then
  run "git mv ' assets'/* assets/ 2>/dev/null || true"
  run "rmdir ' assets' 2>/dev/null || true"
fi
if [ -f "license" ] && [ -f "LICENSE" ]; then
  echo "  [aviso] existem 'license' e 'LICENSE' — verifique e remova o duplicado manualmente."
fi

echo "== 4/5 Reescrevendo links internos (href/src) em todos os .html =="
# Converte referências antigas (relativas ou absolutas) para caminhos absolutos novos.
if [ "$DRY" = "0" ]; then
  TMP_SED="$(mktemp)"
  echo "$MAP" | while IFS='|' read -r old new; do
    o_esc=$(printf '%s' "$old" | sed 's/[.[\*^$/]/\\&/g; s/ /%20/g')
    o_raw=$(printf '%s' "$old" | sed 's/[.[\*^$/]/\\&/g')
    printf 's|href="/\\?%s"|href="/%s"|g\n' "$o_raw" "$new" >> "$TMP_SED"
    printf 's|src="/\\?%s"|src="/%s"|g\n'  "$o_raw" "$new" >> "$TMP_SED"
    printf 's|href="/\\?%s"|href="/%s"|g\n' "$o_esc" "$new" >> "$TMP_SED"
    printf 's|src="/\\?%s"|src="/%s"|g\n'  "$o_esc" "$new" >> "$TMP_SED"
  done
  find . -name '*.html' -not -path './node_modules/*' -print0 | xargs -0 sed -i -f "$TMP_SED"
  # Correção de link quebrado conhecido (footer aponta para arquivo inexistente):
  find . -name '*.html' -print0 | xargs -0 sed -i \
    -e 's|href="/\?cs-tapajos.html"|href="/fellowship/cases/fellowship-cs-tapajos.html"|g' \
    -e 's|href="/\?cs-yemen.html"|href="/fellowship/cases/fellowship-cs-yemen.html"|g'
  rm -f "$TMP_SED"
else
  echo "[dry] (reescrita de links pulada no dry-run)"
fi

echo "== 5/5 Gerando vercel.redirects.json =="
{
  echo '{'
  echo '  "redirects": ['
  first=1
  echo "$MAP" | while IFS='|' read -r old new; do
    src=$(printf '%s' "$old" | sed 's/ /%20/g')
    [ "$first" = "1" ] || true
    printf '    { "source": "/%s", "destination": "/%s", "permanent": true },\n' "$src" "$new"
  done | sed '$ s/,$//'
  echo '  ]'
  echo '}'
} > vercel.redirects.json
echo "  -> vercel.redirects.json gerado. Faça merge manual com o vercel.json existente."

if [ "$STUBS" = "1" ] && [ "$DRY" = "0" ]; then
  echo "== Extra: gerando stubs de redirecionamento (GitHub Pages) =="
  echo "$MAP" | grep '\.html|' | while IFS='|' read -r old new; do
    case "$old" in *.html)
      cat > "$old" <<STUB
<!DOCTYPE html><html><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=/$new">
<link rel="canonical" href="/$new"></head>
<body><a href="/$new">Página movida — clique aqui</a></body></html>
STUB
      git add "$old"
    ;; esac
  done
fi

echo ""
echo "Concluído. Próximos passos:"
echo "  1. Revise:  git status && git diff --stat"
echo "  2. Mescle vercel.redirects.json no seu vercel.json"
echo "  3. Atualize manifest.json (ícones agora em /assets/icons/) e sw.js (cache paths)"
echo "  4. Teste localmente, depois:  git commit -m 'reorganiza repositório em pastas temáticas'"
echo "  5. ATENÇÃO: avalie remover /private-agreements/ do repositório público (ver PLANO.md)"

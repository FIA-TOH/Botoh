# Map SVGs

O LiveMap procura SVGs em:

```powershell
apps/frontend/public/maps/<nome-do-mapa>.svg
```

Gerar pelo nome do mapa:

```powershell
node scripts/generate-map-svg-cli.js imolaTeste --no-vertices --no-grid --transparent
node scripts/generate-map-svg-cli.js miamiSeasonTres --no-vertices --no-grid
node scripts/generate-map-svg-cli.js sepang --no-vertices --no-grid --transparent
```

Gerar direto de um `.hbs`:

```powershell
node scripts/generate-map-svg-advanced.js "Botoh/src/circuits/bahrain/bahrainSeasonTres.hbs" "apps/frontend/public/maps/bahrainSeasonTres.svg" --no-vertices --no-grid --transparent
```

Gerar todos:

```powershell
node scripts/generate-map-svg-cli.js all --transparent
```

# Map SVGs

O LiveMap procura SVGs em:

```powershell
apps/frontend/public/maps/<nome-do-mapa>.svg
```

Gerar pelo nome do mapa:

```powershell
node scripts/generate-map-svg-cli.js imolaTeste --transparent
node scripts/generate-map-svg-cli.js imolaSeasonTres --transparent
node scripts/generate-map-svg-cli.js sepang --transparent
```

Gerar direto de um `.hbs`:

```powershell
node scripts/generate-map-svg-advanced.js "Botoh/src/circuits/imola/imolaTeste.hbs" "apps/frontend/public/maps/imolateste.svg" --no-vertices --no-grid
```

Gerar todos:

```powershell
node scripts/generate-map-svg-cli.js all --transparent
```

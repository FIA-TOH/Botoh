// scripts/fixCircuitImports.ts
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const circuitsDir = join(__dirname, "../src/circuits");

// Função para processar cada arquivo .ts
function fixTsFile(tsFilePath: string) {
  let content = readFileSync(tsFilePath, "utf-8");

  // Regex para encontrar consts *_raw e *_json
  const constRegex =
    /(const\s+\w+_raw\s*=\s*readFileSync.*?;\s*const\s+\w+_json\s*=\s*JSON\.parse\([^)]+\);)/s;
  const match = content.match(constRegex);

  if (match) {
    const constBlock = match[1];

    // Remove o bloco das consts do conteúdo
    content = content.replace(constBlock, "");

    // Encontra a posição após o último import
    const importMatches = [...content.matchAll(/import .+ from .+;/g)];
    let lastImportEnd = 0;
    for (const m of importMatches) {
      if (m.index !== undefined) lastImportEnd = m.index + m[0].length;
    }

    // Insere as consts logo após os imports
    content =
      content.slice(0, lastImportEnd) +
      "\n\n" +
      constBlock +
      "\n\n" +
      content.slice(lastImportEnd);

    writeFileSync(tsFilePath, content, "utf-8");
    console.log(`✔ Corrigido: ${tsFilePath}`);
  } else {
    console.log(`⚠ Nada a corrigir em: ${tsFilePath}`);
  }
}

// Loop em todas as pastas de circuitos
const circuits = readdirSync(circuitsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const circuit of circuits) {
  const circuitPath = join(circuitsDir, circuit);
  const files = readdirSync(circuitPath);

  // Processa todos os .ts da pasta
  files
    .filter((f) => f.endsWith(".ts"))
    .forEach((f) => {
      const tsFilePath = join(circuitPath, f);
      fixTsFile(tsFilePath);
    });
}

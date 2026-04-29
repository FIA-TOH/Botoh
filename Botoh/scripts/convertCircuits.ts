
import { readdirSync, readFileSync, writeFileSync, renameSync } from "fs";
import { join } from "path";

const circuitsDir = join(__dirname, "../src/circuits");

function processVariant(circuitPath: string, baseName: string) {
  const jsonFile = join(circuitPath, `${baseName}.json`);
  const tsFile = join(circuitPath, `${baseName}.ts`);

  try {
    renameSync(jsonFile, join(circuitPath, `${baseName}.hbs`));
    console.log(`✔ Renomeado: ${baseName}.json → ${baseName}.hbs`);
  } catch {
    console.log(`⚠ ${baseName}.json não encontrado, pulando renomeação.`);
  }

  try {
    let tsContent = readFileSync(tsFile, "utf-8");

    tsContent = tsContent.replace(
      new RegExp(`import .* from "./${baseName}\\.json";`),
      ""
    );

    const imports: string[] = [];

    if (!tsContent.includes(`from "fs"`)) {
      imports.push(`import { readFileSync } from "fs";`);
      imports.push(`import { join } from "path";`);
    }

    if (!tsContent.includes(`from "../bestTimes"`)) {
      imports.push(`import { bestTimes } from "../bestTimes";`);
    }

    if (!tsContent.includes(`from "../Circuit"`)) {
      imports.push(
        `import { Circuit, CircuitInfo, Direction } from "../Circuit";`
      );
    }

    if (imports.length > 0) {
      tsContent = imports.join("\n") + "\n\n" + tsContent;
    }

    const rawVar = `${baseName}_raw`;
    const jsonVar = `${baseName}_json`;

    if (!tsContent.includes(`const ${rawVar}`)) {
      const importMatches = tsContent.matchAll(/import .+ from .+;/g);
      let lastImportEnd = 0;
      for (const m of importMatches) {
        if (m.index !== undefined) lastImportEnd = m.index + m[0].length;
      }

      tsContent =
        tsContent.slice(0, lastImportEnd) +
        `\n\nconst ${rawVar} = readFileSync(join(__dirname, "${baseName}.hbs"), "utf-8");\n` +
        `const ${jsonVar} = JSON.parse(${rawVar});\n\n` +
        tsContent.slice(lastImportEnd);
    }

  
    tsContent = tsContent.replace(
      /map:\s*JSON\.stringify\([^)]*\)/,
      `map: ${rawVar}`
    );

    writeFileSync(tsFile, tsContent, "utf-8");
    console.log(`✔ Atualizado: ${baseName}.ts`);
  } catch {
    console.log(`⚠ ${tsFile} não encontrado, pulando atualização.`);
  }
}

function processCircuit(circuitName: string) {
  const circuitPath = join(circuitsDir, circuitName);

  const files = readdirSync(circuitPath);

  const baseNames = new Set(
    files
      .filter((f) => f.endsWith(".json") || f.endsWith(".ts"))
      .map((f) => f.replace(/\.(json|ts)$/, ""))
  );

  for (const baseName of baseNames) {
    processVariant(circuitPath, baseName);
  }
}

const circuits = readdirSync(circuitsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const circuit of circuits) {
  processCircuit(circuit);
}

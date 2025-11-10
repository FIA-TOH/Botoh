const fs = require("fs");
const path = require("path");

const MAP_FILE =
  "C:\\Users\\senho\\Documents\\Ftoh\\FTOH-Bot\\Botoh\\src\\circuits\\barcelona\\barcelona.json";
const SEGMENT_COLOR = "696969";

const mapJson = JSON.parse(fs.readFileSync(MAP_FILE, "utf-8"));

if (!mapJson.segments || !mapJson.vertexes) {
  console.error("Mapa inválido");
  process.exit(1);
}

const CutDetectSegments = mapJson.segments
  .map((seg, index) => {
    if (seg.color !== SEGMENT_COLOR) return null;
    const v0 = mapJson.vertexes[seg.v0];
    const v1 = mapJson.vertexes[seg.v1];
    if (!v0 || !v1) return null;
    return {
      v0: [v0.x, v0.y],
      v1: [v1.x, v1.y],
      index,
      penalty: 5,
    };
  })
  .filter(Boolean);

console.log("CutDetectSegments: ");
console.log(JSON.stringify(CutDetectSegments, null, 2));

//node generateCutSegments.js

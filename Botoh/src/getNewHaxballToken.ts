export async function getNewHaxballToken(): Promise<string> {
  const res = await fetch("https://www.haxball.com/headless");
  const text = await res.text();
  const match = text.match(
    /"([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)"/
  );
  if (!match) throw new Error("Não foi possível obter token do Haxball!");
  return match[1];
}

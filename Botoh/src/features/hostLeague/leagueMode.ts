export const LEAGUE_MODE = (() => {
  if (process.argv.includes("--league")) return true;
  if (process.argv.includes("--pub")) return false;

  if (typeof process.env.LEAGUE_MODE !== "undefined") {
    return process.env.LEAGUE_MODE === "true";
  }

  return false;
})();

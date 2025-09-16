export function centerText(text: string, width: number): string {
  const spaces = (width - text.length) / 2.0;
  const leftSpaces = " ".repeat(Math.ceil(spaces));
  const rightSpaces = " ".repeat(Math.floor(spaces));
  return `${leftSpaces}${text}${rightSpaces}`;
}

export function parseSelections(input, optionCount) {
  const values = input.trim().split(/[\s,]+/).map(Number);
  const indexes = [];
  for (const value of values) {
    if (!Number.isInteger(value) || value < 1 || value > optionCount) {
      throw new Error('Choose one or more valid menu numbers.');
    }
    const index = value - 1;
    if (!indexes.includes(index)) indexes.push(index);
  }
  return indexes;
}

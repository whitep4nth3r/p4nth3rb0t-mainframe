function getRandomInt(min: number, max: number): any {
  return Math.round(Math.random() * (max - min) + min);
}

export function getRandomEntry(array: any): any {
  return array[getRandomInt(0, array.length - 1)];
}

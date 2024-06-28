function getRandomInt(min: number, max: number): any {
  return Math.round(Math.random() * (max - min) + min);
}

export function getRandomEntry(array: any): any {
  return array[getRandomInt(0, array.length - 1)];
}

type ModifiedArrayAndEntry = {
  array: any[];
  entry: any;
};

export function getRandomEntryAndModifiedArray(
  array: any,
): ModifiedArrayAndEntry {
  const randomIndex = getRandomInt(0, array.length - 1);
  const randomEntry = array[randomIndex];
  const returnArray = array.filter((data, idx) => idx !== randomIndex);

  return {
    array: returnArray,
    entry: randomEntry,
  };
}

export const PantherworldZones = [
  {
    id: 1,
    name: "city",
  },
  {
    id: 2,
    name: "forest",
  },
  {
    id: 3,
    name: "mountain",
  },
  {
    id: 4,
    name: "desert",
  },
];

export function isValidPantherworldZone(input: string): boolean {
  let isValid = false;
  PantherworldZones.forEach((zone) => {
    if (input === zone.name) {
      isValid = true;
    }
  });
  return isValid;
}

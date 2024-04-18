export enum PantherworldZoneNames {
  City = "city",
  Forest = "forest",
  Mountain = "mountain",
  Desert = "desert",
}

export const PantherworldZones = [
  {
    name: PantherworldZoneNames.City,
  },
  {
    name: PantherworldZoneNames.Forest,
  },
  {
    name: PantherworldZoneNames.Mountain,
  },
  {
    name: PantherworldZoneNames.Desert,
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

export enum PantherworldZoneNames {
  Beach = "beach",
  City = "city",
  Forest = "forest",
  Mountain = "mountain",
  Desert = "desert",
  Swamp = "swamp",
}

export const PantherworldZones = [
  {
    name: PantherworldZoneNames.Beach,
  },
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
  { name: PantherworldZoneNames.Swamp },
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

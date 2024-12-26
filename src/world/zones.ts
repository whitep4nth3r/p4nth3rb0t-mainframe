export enum PantherworldZoneNames {
  Beach = "beach",
  City = "city",
  Forest = "forest",
  Mountain = "mountain",
  Desert = "desert",
  Swamp = "swamp",
}

export type Zone = {
  name: string;
  nearbyZones: string[];
};

export const PantherworldZones: Zone[] = [
  {
    name: PantherworldZoneNames.Beach,
    nearbyZones: [
      PantherworldZoneNames.City,
      PantherworldZoneNames.Swamp,
      PantherworldZoneNames.Forest,
    ],
  },
  {
    name: PantherworldZoneNames.City,
    nearbyZones: [
      PantherworldZoneNames.Desert,
      PantherworldZoneNames.Swamp,
      PantherworldZoneNames.Beach,
    ],
  },
  {
    name: PantherworldZoneNames.Forest,
    nearbyZones: [
      PantherworldZoneNames.Swamp,
      PantherworldZoneNames.Beach,
      PantherworldZoneNames.Mountain,
    ],
  },
  {
    name: PantherworldZoneNames.Mountain,
    nearbyZones: [
      PantherworldZoneNames.Forest,
    ],
  },
  {
    name: PantherworldZoneNames.Desert,
    nearbyZones: [
      PantherworldZoneNames.City,
    ],
  },
  {
    name: PantherworldZoneNames.Swamp,
    nearbyZones: [
      PantherworldZoneNames.City,
      PantherworldZoneNames.Forest,
      PantherworldZoneNames.Beach,
    ],
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

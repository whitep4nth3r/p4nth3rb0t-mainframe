import { PantherworldZoneNames, Zone } from "./zones";

interface WORLD_STATE {
  RELEASE_ZONES: Zone[];
  WEALTH_THRESHOLDS: {
    min: number;
    max: number;
  };
}

export const WorldState: WORLD_STATE = {
  RELEASE_ZONES: [],
  WEALTH_THRESHOLDS: {
    min: 1000,
    max: 500000,
  },
};

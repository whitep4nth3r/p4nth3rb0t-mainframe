import { PantherworldZoneNames } from "./zones";

interface WORLD_STATE {
  ITEMS_RELEASED: number;
  RELEASE_ZONE: keyof typeof PantherworldZoneNames | null;
  WEALTH_THRESHOLDS: {
    min: number;
    max: number;
  };
}

export const WorldState: WORLD_STATE = {
  ITEMS_RELEASED: 0,
  RELEASE_ZONE: null,
  WEALTH_THRESHOLDS: {
    min: 1000,
    max: 500000,
  },
};

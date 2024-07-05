import { PantherworldZoneNames } from "./zones";

interface WORLD_STATE {
  ITEMS_RELEASED: boolean;
  RELEASE_ZONE: keyof typeof PantherworldZoneNames | null;
}

export const WorldState: WORLD_STATE = {
  ITEMS_RELEASED: false,
  RELEASE_ZONE: null,
};

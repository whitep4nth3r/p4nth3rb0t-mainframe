import { Zone } from "../zones";
import { zoneContainsActiveRelease } from "../actions/leader/releaseUnclaimed";
import { WorldState } from "../state";

test("return true when the zone is in RELEASE_ZONES", () => {
  const testZone: Zone = { name: "test-zone", nearbyZones: [] };
  WorldState.RELEASE_ZONES = [testZone];

  expect(zoneContainsActiveRelease(testZone)).toBe(true);
});

test("return false when the zone is not in RELEASE_ZONES", () => {
  const testZone: Zone = { name: "test-zone", nearbyZones: [] };
  const otherZone: Zone = { name: "other-zone", nearbyZones: [] };
  WorldState.RELEASE_ZONES = [otherZone];

  expect(zoneContainsActiveRelease(testZone)).toBe(false);
});

test("return false when RELEASE_ZONES is empty", () => {
  const testZone: Zone = { name: "test-zone", nearbyZones: [] };

  expect(zoneContainsActiveRelease(testZone)).toBe(false);
});

test("handle multiple zones in RELEASE_ZONES", () => {
  const testZone1: Zone = { name: "test-zone-1", nearbyZones: [] };
  const testZone2: Zone = { name: "test-zone-2", nearbyZones: [] };
  const testZone3: Zone = { name: "test-zone-3", nearbyZones: [] };
  WorldState.RELEASE_ZONES = [testZone1, testZone2];

  expect(zoneContainsActiveRelease(testZone1)).toBe(true);
  expect(zoneContainsActiveRelease(testZone2)).toBe(true);
  expect(zoneContainsActiveRelease(testZone3)).toBe(false);
});

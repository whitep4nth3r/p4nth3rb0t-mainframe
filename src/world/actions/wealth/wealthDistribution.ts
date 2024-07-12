import * as Sentry from "@sentry/node";
import PantherworldItemModel from "../../../data/models/PantherworldItem";
import { WorldState } from "../../state";
import { throwItem } from "../player/throw";
import { getRandomEntry } from "../../../utils/getRandomEntry";

type ItemForWealthIndex = {
  _id: string;
  count: number;
  rarity: number;
};

// export async function getWorldWealthIndex(): Promise<number> {
//   const items = await PantherworldItemModel.aggregate([
//     {
//       $group: {
//         _id: "$name",
//         count: { $sum: 1 },
//         rarity: { $first: "$rarity" },
//       },
//     },
//   ]);

//   const worldWealthIndex = getWealthIndex(items);
//   return worldWealthIndex;
// }

export function getWealthIndex(items: ItemForWealthIndex[]): number {
  let wealthIndex = 0;

  items.forEach((item) => {
    wealthIndex += item.count * item.rarity;
  });

  return wealthIndex;
}

export function calculateDropProbabilityFromWealthIndex(
  wealthIndex: number,
): number {
  // https://www.desmos.com/calculator/zbwde7pvmy
  const top = Math.max(wealthIndex - WorldState.WEALTH_THRESHOLDS.min, 0);
  const bottom =
    WorldState.WEALTH_THRESHOLDS.max - WorldState.WEALTH_THRESHOLDS.min;

  return Math.pow(Math.min(top / bottom, 1), 2);
}

export async function wealthDistribution(
  userId: string,
  username: string,
): Promise<void> {
  const items = await PantherworldItemModel.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: "$name",
        count: { $sum: 1 },
        rarity: { $first: "$rarity" },
      },
    },
  ]);

  const wealthIndex = getWealthIndex(items);
  const dropProbability = calculateDropProbabilityFromWealthIndex(wealthIndex);

  const willDrop = Math.random() < dropProbability;

  if (!willDrop) {
    return;
  }

  // number of items to drop is random between 1 item and N = 10% of your inventory
  const DROP_MIN = 1;
  const DROP_MAX = items.length * 0.1;

  const dropCount = Math.floor(
    Math.random() * (DROP_MAX - DROP_MIN + 1) + DROP_MIN,
  );

  if (dropCount > 0) {
    const promises = [];

    for (let i = 1; i <= dropCount; i++) {
      const randomItem = getRandomEntry(items);
      promises.push(await throwItem(randomItem._id, userId, username));
    }

    await Promise.all(promises)
      .then()
      .catch((err) => {
        Sentry.captureException(err);
      });
  }
}

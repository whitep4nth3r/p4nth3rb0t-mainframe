import PantherworldItemModel from "../data/models/PantherworldItem";
import PantherworldPlayerModel, {
  PantherworldPlayerData,
} from "../data/models/PantherworldPlayer";
import { WorldItem } from "./items/all";

export async function getLocation(userId: string): Promise<string> {
  const entry = await PantherworldPlayerModel.findOne({
    userId: userId,
  });
  if (entry) {
    return entry.zone;
  } else {
    return "Not found";
  }
}

type InventoryResponse = {
  total: number;
  items: WorldItem[];
  location: string;
  spawn_date: Date | null;
  players_in_zone: number;
};

export async function getFullInventory(
  userId: string,
): Promise<InventoryResponse> {
  const items = await PantherworldItemModel.aggregate([
    // Match documents with a specific userId
    { $match: { userId: userId } },

    // Group documents by name, count the number of items in each group
    {
      $group: {
        _id: "$name",
        rarity: { $first: "$rarity" },
        count: { $sum: 1 },
      },
    },

    // Project to rename _id to name
    {
      $project: {
        _id: 0,
        name: "$_id",
        count: 1,
        rarity: 1,
      },
    },

    // Sort the groups by rarity in descending order
    { $sort: { rarity: -1 } },
  ]);

  let total = 0;

  items.forEach((item) => (total += item.count));

  let locationString = "Not found";
  let spawnDateString = null;
  let playersInZone = 0;

  const player = (await PantherworldPlayerModel.findOne({
    userId: userId,
  })) as PantherworldPlayerData;

  if (player) {
    locationString = player.zone;
    spawnDateString = player.createdAt;

    const otherPlayers = await PantherworldPlayerModel.find({
      zone: player.zone,
    });

    playersInZone = otherPlayers.length;
  }

  return {
    total,
    items,
    location: locationString,
    spawn_date: spawnDateString,
    players_in_zone: playersInZone,
  };
}

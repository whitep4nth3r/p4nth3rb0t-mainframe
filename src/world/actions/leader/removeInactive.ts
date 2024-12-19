import { config } from "../../../config";
import PantherworldItemModel from "../../../data/models/PantherworldItem";
import PantherworldPlayerModel from "../../../data/models/PantherworldPlayer";
import { tmi } from "../../../tmi";

export async function removeInactive() {
  const itemsGroupedByPlayer = await PantherworldItemModel.aggregate([
    {
      $match: {
        userId: { $ne: null },
        used: { $ne: true },
        spoiled: { $ne: true },
      },
    },

    // Group documents by userId and push all items into an array
    { $group: { _id: "$userId", items: { $push: "$$ROOT" } } },
  ]);

  // inactive players are those with 2 items or fewer
  const playersWith2ItemsOrFewer = itemsGroupedByPlayer.filter(
    (player) => player.items.length <= 2,
  );

  // collect item IDs for items belonging to inactive players
  const itemIdsToRemoveFromUsers = playersWith2ItemsOrFewer
    .map((player) => player.items.map((item) => item._id))
    .flat();

  const itemWriteQuery = itemIdsToRemoveFromUsers.map((item) => {
    return {
      updateOne: {
        filter: {
          _id: item,
        },
        update: { $set: { userId: null } },
      },
    };
  });

  const updateItems = await PantherworldItemModel.bulkWrite(itemWriteQuery);

  if (updateItems.modifiedCount > 0) {
    tmi.say(
      config.channel,
      `♻️ ${updateItems.modifiedCount} items reclaimed from inactive users`,
    );
  }

  //twitch user IDs
  const inactivePlayerIds = playersWith2ItemsOrFewer.map(
    (player) => player._id,
  );

  const playerWriteQuery = inactivePlayerIds.map((player) => {
    return {
      deleteOne: {
        filter: {
          userId: player,
        },
      },
    };
  });

  const deleteUsers = await PantherworldPlayerModel.bulkWrite(playerWriteQuery);

  if (deleteUsers.deletedCount > 0) {
    tmi.say(
      config.channel,
      `💀 ${deleteUsers.deletedCount} inactive players removed from p4nth3rworld`,
    );
  } else {
    tmi.say(config.channel, `🚨 No inactive players`);
  }
}

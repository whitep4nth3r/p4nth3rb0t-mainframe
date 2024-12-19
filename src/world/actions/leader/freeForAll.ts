import { config } from "../../../config";
import PantherworldItemModel from "../../../data/models/PantherworldItem";
import PantherworldPlayerModel from "../../../data/models/PantherworldPlayer";
import { tmi } from "../../../tmi";

export async function freeForAll() {
  const itemsGroupedByZone = await PantherworldItemModel.aggregate([
    {
      $match: {
        userId: { $eq: null },
        used: { $ne: true },
        spoiled: { $ne: true },
        zone: { $ne: null },
      },
    },

    // Group documents by zone and push all items into an array
    { $group: { _id: "$zone", items: { $push: "$$ROOT" } } },
  ]);

  const playersGroupedByZone = await PantherworldPlayerModel.aggregate([
    {
      $match: {},
    },
    { $group: { _id: "$zone", players: { $push: "$$ROOT" } } },
  ]);

  const writeQuery = [];
  itemsGroupedByZone.forEach((zone) => {
    const currentZone = zone._id;

    if (zone.items.length > 0) {
      const playersInZone = playersGroupedByZone.find(
        (group) => group._id === currentZone,
      );

      if (playersInZone.players.length > 0) {
        // work out how many items per player (roughly, there may be some left over, I don't care right now)
        const itemsPerPlayer = Math.floor(
          zone.items.length / playersInZone.players.length,
        );

        playersInZone.players.forEach((player) => {
          // build up the bulkWrite query in an array
          for (let i = 1; i <= itemsPerPlayer; i++) {
            if (zone.items.length > 0) {
              // remove last item from zone.items using pop()
              // use this one to update
              const itemToDistribute = zone.items.pop();

              writeQuery.push({
                updateOne: {
                  filter: { _id: itemToDistribute._id },
                  update: { $set: { userId: player.userId } },
                },
              });
            }
          }
        });
      }
    }
  });

  const bulkWrite = await PantherworldItemModel.bulkWrite(writeQuery);

  if (bulkWrite.modifiedCount > 0) {
    tmi.say(
      config.channel,
      "📣 FREE-FOR-ALL DELIVERED! CHECK YOUR ITEMS TO SEE WHAT YOU'VE WON!",
    );
  }
}

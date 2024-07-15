module.exports = {
  async up(db) {
    // Fetch all players
    const players = await db
      .collection("pantherworldplayers")
      .find({})
      .toArray();

    // Iterate over each player and add the createdAt field
    for (const player of players) {
      const createdAt = player._id.getTimestamp();

      await db
        .collection("pantherworldplayers")
        .updateOne({ _id: player._id }, { $set: { createdAt: createdAt } });
    }
  },

  // async down(db, client) {},
};

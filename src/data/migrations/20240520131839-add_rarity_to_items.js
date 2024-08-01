// eslint-disable-next-line @typescript-eslint/no-var-requires
const { WorldItems } = require("../../../build/src/world/items/all");

// add extra legacy items for dev DB and the 🐥 for prod
const catalogue = [
  ...WorldItems,
  {
    name: "testItem",
    onlyZone: null,
    rarity: 10,
  },
  {
    name: "anotherItem",
    onlyZone: null,
    rarity: 5,
  },
  {
    name: "toxic",
    onlyZone: null,
    rarity: 500,
  },
  {
    name: "toxic banana",
    onlyZone: null,
    rarity: 500,
  },
  {
    name: "goo",
    onlyZone: null,
    rarity: 100,
  },
  {
    name: "liquorish",
    onlyZone: null,
    rarity: 4,
  },
  {
    name: "🐥",
    onlyZone: null,
    rarity: 10000,
  },
];

module.exports = {
  async up(db) {
    function getRarity(name) {
      return catalogue.find((item) => item.name === name).rarity;
    }

    // Fetch all items to calculate their rarity
    const items = await db.collection("pantherworlditems").find({}).toArray();

    // Iterate over each item and update the rarity field
    for (const item of items) {
      const rarity = getRarity(item.name);

      await db
        .collection("pantherworlditems")
        .updateOne({ _id: item._id }, { $set: { rarity: rarity } });
    }
  },

  async down(db) {
    await db
      .collection("pantherworlditems")
      .updateMany({}, { $unset: { rarity: "" } });
  },
};

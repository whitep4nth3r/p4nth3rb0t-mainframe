import PantherworldPlayerModel from "../../../data/models/PantherworldPlayer";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import { sendPantherworldFeedEvent } from "../../../discord";
import { capitalise } from "./utils";
import { PantherworldEvent } from "../../api/types";

export async function listPopulation(): Promise<void> {
  const zoneCounts = await PantherworldPlayerModel.aggregate([
    { $group: { _id: "$zone", count: { $sum: 1 } } },
  ]);

  let total = 0;

  zoneCounts.forEach((zone) => (total += zone.count));

  const report = zoneCounts
    .map((zone) => `${capitalise(zone._id)} ${zone.count}`)
    .join(", ");

  const discordReport = zoneCounts
    .map((zone) => `${capitalise(zone._id)} **${zone.count}**`)
    .join(", ");

  tmi.say(
    config.channel,
    `${config.BOT_PREFIX}📊 Population: Total ${total}, ${report}`,
  );

  await sendPantherworldFeedEvent(
    `Population: Total **${total}**,  ${discordReport}`,
    PantherworldEvent.LIST_POPULATION,
    config.BOT_PREFIX,
  );
}

import { database } from "../../../data/database";
import { PantherworldPlayer } from "../../../data/entities/PantherworldPlayerEntity";

export async function getLocation(userId: string): Promise<string> {
  const playerRepository = database.getRepository(PantherworldPlayer);

  const entry = await playerRepository.findOne({
    where: { userId: userId },
  });

  if (entry) {
    return entry.zone;
  } else {
    return "Not found";
  }
}

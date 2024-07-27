import PantherworldPlayerModel from "../../../data/models/PantherworldPlayer";

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

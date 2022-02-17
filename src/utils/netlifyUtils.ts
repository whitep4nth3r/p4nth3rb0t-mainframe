import axios from "axios";

export async function deploySite(): Promise<void> {
  await axios.post(`${process.env.P4NTH3RBLOG_BUILD_HOOK}`);
}

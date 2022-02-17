import axios from "axios";

export async function deploySite(): Promise<void> {
  console.log("✨ Deploying whitep4nth3r.com");
  await axios.post(`${process.env.P4NTH3RBLOG_BUILD_HOOK}`);
}

import axios from "axios";

export async function deploySite(): Promise<void> {
  console.log("✨ Deploying whitep4nth3r.com");
  await axios.post(`${process.env.WEBSITE_BUILD_HOOK}`);
}

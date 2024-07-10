export async function deploySite(): Promise<void> {
  console.log("✨ Deploying whitep4nth3r.com");

  await fetch(`${process.env.WEBSITE_BUILD_HOOK}`, {
    method: "POST",
  });
}

import { writeFile, rename } from "node:fs/promises";
import { fetchParliament } from "../src/lib/lookup/parliament";
async function main() {
  const data = await fetchParliament();
  const target = new URL("../data/parliament.json", import.meta.url);
  await writeFile(
    new URL("../data/parliament.json.tmp", import.meta.url),
    JSON.stringify(data, null, 2) + "\n",
  );
  await rename(new URL("../data/parliament.json.tmp", import.meta.url), target);
  console.log(
    `Validated ${data.representatives.length} representatives in ${data.constituencies.length} constituencies; source date ${data.sourceDate}.`,
  );
}
main().catch(() => {
  console.error(
    "Official data refresh failed validation. Previous snapshot preserved.",
  );
  process.exitCode = 1;
});

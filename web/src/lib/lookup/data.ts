import snapshot from "../../../data/parliament.json";
import { MAX_DATA_AGE_DAYS } from "../config";
import { fetchParliament, type ParliamentData } from "./parliament";
let cached: ParliamentData = snapshot;
let checkedAt = 0;
let refreshing: Promise<void> | undefined;
export function isFresh(data: ParliamentData, now = Date.now()) {
  const age = now - Date.parse(data.sourceDate);
  return (
    Number.isFinite(age) && age >= 0 && age <= MAX_DATA_AGE_DAYS * 86400000
  );
}
export async function getParliament(): Promise<ParliamentData> {
  if (Date.now() - checkedAt > 6 * 3600000) {
    refreshing ??= fetchParliament()
      .then((data) => {
        cached = data;
      })
      .catch(() => {
        // Fail closed below if the last validated official snapshot is too old. Never log source/user payloads.
      })
      .finally(() => {
        checkedAt = Date.now();
        refreshing = undefined;
      });
    await refreshing;
  }
  if (!isFresh(cached)) throw new Error("Recipient data needs refreshing");
  return cached;
}

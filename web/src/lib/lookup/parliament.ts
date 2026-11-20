import { z } from "zod";
import { PARLIAMENT_SOURCE } from "../config";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const rawSchema = z.object({
  DetalheLegislatura: z.object({
    sigla: z.string(),
    dtini: date,
    dtfim: date.nullable(),
  }),
  CirculosEleitorais: z.array(
    z.object({ cpId: z.number().int(), cpDes: z.string(), legDes: z.string() }),
  ),
  Deputados: z.array(
    z.object({
      DepId: z.number().int(),
      DepCadId: z.number().int(),
      DepNomeParlamentar: z.string().min(1),
      DepCPId: z.number().int(),
      LegDes: z.string(),
      DepSituacao: z.array(
        z.object({
          sioDes: z.string(),
          sioDtInicio: date,
          sioDtFim: date.nullable(),
        }),
      ),
      DepGP: z.array(
        z.object({
          gpSigla: z.string(),
          gpDtInicio: date,
          gpDtFim: date.nullable(),
        }),
      ),
    }),
  ),
});
export type Representative = {
  id: string;
  name: string;
  constituencyId: string;
  party: string;
  profileUrl: string;
};
export type ParliamentData = {
  legislature: string;
  fetchedAt: string;
  sourceDate: string;
  sourceUrl: string;
  constituencies: { id: string; name: string }[];
  representatives: Representative[];
};
export function normalizeParliament(
  raw: unknown,
  now = new Date(),
): ParliamentData {
  const data = rawSchema.parse(raw);
  const day = now.toISOString().slice(0, 10);
  if (data.DetalheLegislatura.dtfim && data.DetalheLegislatura.dtfim < day)
    throw new Error("Ended legislature");
  const sourceDates = data.Deputados.flatMap((p) =>
    p.DepGP.map((g) => g.gpDtFim).filter((d): d is string => !!d && d <= day),
  );
  // The official export closes the latest group membership at its extraction date.
  const sourceDate = sourceDates.sort().at(-1);
  if (!sourceDate || Date.parse(day) - Date.parse(sourceDate) > 7 * 86400000)
    throw new Error("Stale source export");
  const constituencies = data.CirculosEleitorais.map((c) => ({
    id: String(c.cpId),
    name: c.cpDes,
  })).sort((a, b) => a.name.localeCompare(b.name, "pt"));
  const representatives = data.Deputados.flatMap((p) => {
    const current = p.DepSituacao.filter(
      (s) => s.sioDtInicio <= day && (!s.sioDtFim || s.sioDtFim >= day),
    ).sort((a, b) => b.sioDtInicio.localeCompare(a.sioDtInicio))[0];
    if (
      !current ||
      !["Efetivo", "Efetivo Definitivo", "Efetivo Temporário"].includes(
        current.sioDes,
      )
    )
      return [];
    const group = p.DepGP.filter(
      (g) =>
        g.gpDtInicio <= sourceDate && (!g.gpDtFim || g.gpDtFim >= sourceDate),
    ).sort((a, b) => b.gpDtInicio.localeCompare(a.gpDtInicio))[0];
    if (
      !group ||
      p.LegDes !== data.DetalheLegislatura.sigla ||
      !constituencies.some((c) => c.id === String(p.DepCPId))
    )
      throw new Error("Incomplete representative");
    return [
      {
        id: String(p.DepId),
        name: p.DepNomeParlamentar,
        constituencyId: String(p.DepCPId),
        party: group.gpSigla,
        profileUrl: `https://www.parlamento.pt/DeputadoGP/Paginas/Biografia.aspx?BID=${p.DepCadId}`,
      },
    ];
  }).sort((a, b) => a.name.localeCompare(b.name, "pt"));
  if (
    constituencies.length !== 22 ||
    representatives.length !== 230 ||
    new Set(representatives.map((r) => r.id)).size !== 230 ||
    constituencies.some(
      (c) => !representatives.some((r) => r.constituencyId === c.id),
    )
  )
    throw new Error("Parliament coverage changed; manual review required");
  return {
    legislature: data.DetalheLegislatura.sigla,
    fetchedAt: now.toISOString(),
    sourceDate,
    sourceUrl: PARLIAMENT_SOURCE,
    constituencies,
    representatives,
  };
}
function links(html: string) {
  return [
    ...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g),
  ].map((m) => ({
    url: m[1].replaceAll("&amp;", "&"),
    label: m[2].replace(/<[^>]+>/g, "").trim(),
  }));
}
async function get(url: string, signal: AbortSignal) {
  const u = new URL(url);
  if (
    u.protocol !== "https:" ||
    !["www.parlamento.pt", "app.parlamento.pt"].includes(u.hostname)
  )
    throw new Error("Unexpected data host");
  const r = await fetch(url, { signal, cache: "no-store", redirect: "error" });
  if (!r.ok) throw new Error("Official source unavailable");
  const text = await r.text();
  if (text.length > 10000000) throw new Error("Oversized source");
  return text;
}
export async function fetchParliament(): Promise<ParliamentData> {
  const signal = AbortSignal.timeout(20000);
  const page = await get(PARLIAMENT_SOURCE, signal);
  // The first legislature listed by Parliament is the current one; do not hardcode XVII.
  const current = links(page).find((l) =>
    /^[IVXLCDM]+ Legislatura$/.test(l.label),
  );
  if (!current) throw new Error("No current legislature link");
  const resources = await get(
    new URL(current.url, PARLIAMENT_SOURCE).href,
    signal,
  );
  const jsonLink = links(resources).find((l) =>
    /^InformacaoBase[IVXLCDM]+_json\.txt$/.test(l.label),
  );
  if (!jsonLink) throw new Error("No official JSON resource");
  return normalizeParliament(
    JSON.parse(
      await get(new URL(jsonLink.url, PARLIAMENT_SOURCE).href, signal),
    ),
  );
}
export function findRepresentative(
  data: ParliamentData,
  constituencyId: string,
  id: string,
) {
  return data.representatives.find(
    (r) => r.id === id && r.constituencyId === constituencyId,
  );
}

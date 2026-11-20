import snapshot from "../../data/parliament.json";
import {
  findRepresentative,
  normalizeParliament,
  fetchParliament,
} from "../lib/lookup/parliament";
import { isFresh } from "../lib/lookup/data";
const now = new Date("2026-11-20T12:00:00Z");
function raw() {
  return {
    DetalheLegislatura: { sigla: "XVII", dtini: "2025-06-03", dtfim: null },
    CirculosEleitorais: snapshot.constituencies.map((c) => ({
      cpId: Number(c.id),
      cpDes: c.name,
      legDes: "XVII",
    })),
    Deputados: snapshot.representatives.map((p) => ({
      DepId: Number(p.id),
      DepCadId: Number(new URL(p.profileUrl).searchParams.get("BID")),
      DepNomeParlamentar: p.name,
      DepCPId: Number(p.constituencyId),
      LegDes: "XVII",
      DepGP: [
        { gpSigla: p.party, gpDtInicio: "2025-06-03", gpDtFim: "2026-11-19" },
      ],
      DepSituacao: [
        {
          sioDes: "Efetivo",
          sioDtInicio: "2025-06-03",
          sioDtFim: null as string | null,
        },
      ],
    })),
  };
}
test("covers 230 unique active members and every mainland, island and overseas constituency", () => {
  const d = normalizeParliament(raw(), now);
  expect(d.representatives).toHaveLength(230);
  expect(d.constituencies).toHaveLength(22);
  for (const name of [
    "Lisboa",
    "Porto",
    "Açores",
    "Madeira",
    "Europa",
    "Fora da Europa",
  ]) {
    const c = d.constituencies.find((x) => x.name === name)!;
    expect(d.representatives.some((p) => p.constituencyId === c.id)).toBe(true);
  }
});
test("filters substitutes and resigned members; uses current status after a substitution", () => {
  const d = raw();
  const base = d.Deputados[0];
  d.Deputados.push({
    ...base,
    DepId: 999991,
    DepSituacao: [
      {
        sioDes: "Suplente",
        sioDtInicio: "2025-06-03",
        sioDtFim: null as string | null,
      },
    ],
  });
  d.Deputados.push({
    ...base,
    DepId: 999992,
    DepSituacao: [
      { sioDes: "Efetivo", sioDtInicio: "2025-06-03", sioDtFim: "2026-11-01" },
      {
        sioDes: "Renunciou",
        sioDtInicio: "2026-11-02",
        sioDtFim: null as string | null,
      },
    ],
  });
  expect(normalizeParliament(d, now).representatives).toHaveLength(230);
});
test("rejects partial, duplicate, expired-legislature and stale-source imports", () => {
  const partial = raw();
  partial.Deputados.pop();
  expect(() => normalizeParliament(partial, now)).toThrow();
  const duplicate = raw();
  duplicate.Deputados[1] = duplicate.Deputados[0];
  expect(() => normalizeParliament(duplicate, now)).toThrow();
  expect(() => normalizeParliament(raw(), new Date("2026-12-20"))).toThrow();
});
test("a recipient cannot be selected using an unrelated constituency or unknown ID", () => {
  const p = snapshot.representatives[0];
  expect(findRepresentative(snapshot, p.constituencyId, p.id)).toEqual(p);
  expect(findRepresentative(snapshot, "99", p.id)).toBeUndefined();
  expect(findRepresentative(snapshot, p.constituencyId, "0")).toBeUndefined();
});
test("stale and future-dated snapshots fail closed", () => {
  expect(
    isFresh({ ...snapshot, sourceDate: "2026-11-19" }, now.getTime()),
  ).toBe(true);
  expect(
    isFresh({ ...snapshot, sourceDate: "2026-10-01" }, now.getTime()),
  ).toBe(false);
  expect(
    isFresh({ ...snapshot, sourceDate: "2027-01-01" }, now.getTime()),
  ).toBe(false);
});
test("discovers anchor links without accidentally selecting stylesheet hrefs", async () => {
  const mock = jest
    .spyOn(global, "fetch")
    .mockResolvedValueOnce(
      new Response(
        '<link href="/wrong.css"><a href="/resources">XVII Legislatura</a>',
      ),
    )
    .mockResolvedValueOnce(
      new Response(
        '<a href="https://app.parlamento.pt/base">InformacaoBaseXVII_json.txt</a>',
      ),
    )
    .mockResolvedValueOnce(new Response(JSON.stringify(raw())));
  jest.useFakeTimers().setSystemTime(now);
  const result = await fetchParliament();
  expect(result.representatives).toHaveLength(230);
  expect(mock.mock.calls[1][0]).toBe("https://www.parlamento.pt/resources");
  jest.useRealTimers();
  mock.mockRestore();
});

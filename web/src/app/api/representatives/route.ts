import { getParliament } from "@/lib/lookup/data";
import { json } from "@/lib/http";
export const runtime = "nodejs";
export async function GET() {
  try {
    return json(await getParliament());
  } catch {
    return json(
      {
        error:
          "Não conseguimos confirmar a lista atual de deputados. Tenta mais tarde ou consulta parlamento.pt.",
      },
      503,
    );
  }
}

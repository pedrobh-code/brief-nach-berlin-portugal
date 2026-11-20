import type { Metadata } from "next";
import Wizard from "@/components/Wizard";
export const metadata: Metadata = { title: "Escrever uma carta" };
export default function WritePage() {
  return (
    <main id="conteudo" className="wizard-main">
      <Wizard />
    </main>
  );
}

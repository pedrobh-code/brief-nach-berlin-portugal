export function escapeHtml(text: string) {
  return text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export async function sendLetter(
  email: string,
  letter: string,
  eventId: string,
) {
  const endpoint = process.env.OLAIA_EMAIL_ENDPOINT;
  const token = process.env.OLAIA_EMAIL_TOKEN;
  if (!endpoint || !token) throw new Error("Email unavailable");
  const result = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_slug: "carta-pronta",
      to: email,
      variables: { letter: escapeHtml(letter) },
      idempotency_key: `letter-${eventId}`,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!result.ok) throw new Error("Email failed");
}

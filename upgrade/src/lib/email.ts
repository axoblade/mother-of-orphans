const MAILTRAP_TOKEN = process.env.MAIL_TRAP_TOKEN;
const FROM_EMAIL = "noreply@shaniakigozimotheroforphans.org";
const FROM_NAME = "Mother of Orphans";

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
	if (!MAILTRAP_TOKEN) throw new Error("MAIL_TRAP_TOKEN is not configured");

	const res = await fetch("https://send.api.mailtrap.io/api/send", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${MAILTRAP_TOKEN}`,
		},
		body: JSON.stringify({
			from: { email: FROM_EMAIL, name: FROM_NAME },
			to: [{ email: to }],
			subject: "Your Admin Login Code",
			text: `Your one-time login code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
			html: `
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#302c51;margin-bottom:8px">Admin Login Code</h2>
  <p style="color:#555;margin-bottom:24px">Use the code below to complete your sign-in to Mother of Orphans Admin.</p>
  <div style="background:#f5f5f5;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
    <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#ed6221">${otp}</span>
  </div>
  <p style="color:#888;font-size:13px">This code expires in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
</div>`,
		}),
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Mailtrap error ${res.status}: ${body}`);
	}
}

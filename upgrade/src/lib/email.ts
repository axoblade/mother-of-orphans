const MAILTRAP_TOKEN = process.env.MAIL_TRAP_TOKEN;
const FROM_EMAIL = "noreply@shaniakigozimotheroforphans.org";
const FROM_NAME = "Mother of Orphans";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function send(payload: object): Promise<void> {
	if (!MAILTRAP_TOKEN) throw new Error("MAIL_TRAP_TOKEN is not configured");
	const res = await fetch("https://send.api.mailtrap.io/api/send", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${MAILTRAP_TOKEN}`,
		},
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Mailtrap error ${res.status}: ${body}`);
	}
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
	await send({
		from: { email: FROM_EMAIL, name: FROM_NAME },
		to: [{ email: to }],
		subject: "Your Admin Login Code",
		text: `Your one-time login code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
		html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#302c51;margin-bottom:8px">Admin Login Code</h2>
  <p style="color:#555;margin-bottom:24px">Use the code below to complete your sign-in to Mother of Orphans Admin.</p>
  <div style="background:#f5f5f5;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
    <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#ed6221">${otp}</span>
  </div>
  <p style="color:#888;font-size:13px">This code expires in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
</div>`,
	});
}

export async function sendWelcomeEmail(
	to: string,
	name: string,
	role: string,
	password: string,
): Promise<void> {
	const roleLabel = role === "admin" ? "Administrator" : "Content Manager";
	const loginUrl = `${SITE_URL}/admin`;
	await send({
		from: { email: FROM_EMAIL, name: FROM_NAME },
		to: [{ email: to }],
		subject: "Welcome to Mother of Orphans Admin",
		text: `Hi ${name},\n\nYou have been invited to the Mother of Orphans admin panel as ${roleLabel}.\n\nLogin: ${loginUrl}\nEmail: ${to}\nPassword: ${password}\n\nPlease change your password after your first login.\n\nMother of Orphans`,
		html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#302c51;margin-bottom:8px">Welcome, ${name}!</h2>
  <p style="color:#555;margin-bottom:16px">You have been invited to the <strong>Mother of Orphans</strong> admin panel as <strong>${roleLabel}</strong>.</p>
  <div style="background:#f5f5f5;border-radius:8px;padding:20px;margin-bottom:24px">
    <p style="margin:0 0 8px 0;font-size:13px;color:#888">Your login credentials</p>
    <p style="margin:0 0 4px 0;font-size:14px"><strong>Email:</strong> ${to}</p>
    <p style="margin:0 0 4px 0;font-size:14px"><strong>Password:</strong> <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px">${password}</code></p>
  </div>
  <a href="${loginUrl}" style="display:inline-block;background:#ed6221;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">Sign In Now</a>
  <p style="color:#888;font-size:12px;margin-top:24px">Please change your password after your first login.</p>
</div>`,
	});
}

export async function sendPasswordResetEmail(to: string, otp: string): Promise<void> {
	await send({
		from: { email: FROM_EMAIL, name: FROM_NAME },
		to: [{ email: to }],
		subject: "Reset Your Admin Password",
		text: `Your password reset code is: ${otp}\n\nThis code expires in 10 minutes. If you did not request this, ignore this email.`,
		html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#302c51;margin-bottom:8px">Password Reset</h2>
  <p style="color:#555;margin-bottom:24px">Use the code below to reset your password. It expires in 10 minutes.</p>
  <div style="background:#f5f5f5;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px">
    <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#ed6221">${otp}</span>
  </div>
  <p style="color:#888;font-size:13px">If you did not request a password reset, you can safely ignore this email.</p>
</div>`,
	});
}

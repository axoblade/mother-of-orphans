import crypto from "crypto";
import { NextResponse } from "next/server";

const SECRET = process.env.JWT_SECRET || "dev-captcha-secret";

function sign(message: string): string {
	return crypto.createHmac("sha256", SECRET).update(message).digest("hex");
}

export async function GET() {
	const a = Math.floor(Math.random() * 9) + 1;
	const b = Math.floor(Math.random() * 9) + 1;
	const answer = a + b;
	const id = crypto.randomUUID();
	const expires = Date.now() + 10 * 60 * 1000; // 10 min

	// Correct answer is baked into the HMAC - never sent to the client in plaintext
	const sig = sign(`${id}|${answer}|${expires}`);

	return NextResponse.json({
		question: `What is ${a} + ${b}?`,
		token: `${id}|${expires}|${sig}`,
	});
}

// Exported so /api/contact can import it without re-implementing
export function verifyCaptcha(token: string, userAnswer: string): boolean {
	const parts = token.split("|");
	if (parts.length !== 3) return false;
	const [id, expiresStr, sig] = parts;
	const expires = parseInt(expiresStr, 10);
	if (isNaN(expires) || Date.now() > expires) return false;
	const answerNum = parseInt(userAnswer, 10);
	if (isNaN(answerNum)) return false;
	const expected = sign(`${id}|${answerNum}|${expires}`);
	// Constant-time comparison to prevent timing attacks
	return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

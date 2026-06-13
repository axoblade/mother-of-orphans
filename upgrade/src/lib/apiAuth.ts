import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "fallback-secret-change-me",
);

type AuthPayload = { id: string; email: string; role: string };
type AuthResult =
	| { ok: true; payload: AuthPayload }
	| { ok: false; response: NextResponse };

async function extractPayload(req: NextRequest): Promise<AuthPayload | null> {
	const token = req.cookies.get("admin_token")?.value;
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, JWT_SECRET);
		return payload as AuthPayload;
	} catch {
		return null;
	}
}

export async function requireAuth(req: NextRequest): Promise<AuthResult> {
	const payload = await extractPayload(req);
	if (!payload) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
	return { ok: true, payload };
}

export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
	const payload = await extractPayload(req);
	if (!payload) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
	if (payload.role !== "admin") return { ok: false, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
	return { ok: true, payload };
}

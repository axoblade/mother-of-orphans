import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "fallback-secret-change-me",
);

export async function GET(req: NextRequest) {
	const token = req.cookies.get("admin_token")?.value;
	if (!token) {
		return NextResponse.json({ authenticated: false }, { status: 401 });
	}

	try {
		const { payload } = await jwtVerify(token, JWT_SECRET);
		return NextResponse.json({
			authenticated: true,
			user: payload,
		});
	} catch {
		return NextResponse.json({ authenticated: false }, { status: 401 });
	}
}

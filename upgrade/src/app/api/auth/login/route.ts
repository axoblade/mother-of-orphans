import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/mongodb";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "fallback-secret-change-me",
);

export async function POST(req: NextRequest) {
	await connectDB();
	const { email, password } = await req.json();

	if (!email || !password) {
		return NextResponse.json(
			{ error: "Email and password required" },
			{ status: 400 },
		);
	}

	const user = await User.findOne({ email: email.toLowerCase() });
	if (!user) {
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}

	const isValid = await user.comparePassword(password);
	if (!isValid) {
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}

	const token = await new SignJWT({
		id: user._id.toString(),
		email: user.email,
		role: user.role,
	})
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("24h")
		.sign(JWT_SECRET);

	const response = NextResponse.json({
		success: true,
		user: { id: user._id, name: user.name, email: user.email, role: user.role },
	});

	response.cookies.set("admin_token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24, // 24 hours
		path: "/",
	});

	return response;
}

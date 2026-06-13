import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "fallback-secret-change-me",
);

export async function POST(req: NextRequest) {
	await connectDB();
	const { tempToken, otp } = await req.json();

	if (!tempToken || !otp) {
		return NextResponse.json({ error: "Missing token or OTP" }, { status: 400 });
	}

	// Verify the temp token
	let payload: { id: string; type: string };
	try {
		const { payload: p } = await jwtVerify(tempToken, JWT_SECRET);
		if (p.type !== "otp-pending" || !p.id) throw new Error("Invalid token type");
		payload = p as { id: string; type: string };
	} catch {
		return NextResponse.json({ error: "Invalid or expired session. Please log in again." }, { status: 401 });
	}

	const user = await User.findById(payload.id);
	if (!user || !user.otpHash || !user.otpExpiry) {
		return NextResponse.json({ error: "OTP not found. Please log in again." }, { status: 401 });
	}

	// Check expiry
	if (new Date() > user.otpExpiry) {
		await User.findByIdAndUpdate(user._id, { $unset: { otpHash: 1, otpExpiry: 1 } });
		return NextResponse.json({ error: "OTP has expired. Please log in again." }, { status: 401 });
	}

	// Verify OTP
	const isValid = await bcrypt.compare(otp, user.otpHash);
	if (!isValid) {
		return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 401 });
	}

	// Clear OTP - single use
	await User.findByIdAndUpdate(user._id, { $unset: { otpHash: 1, otpExpiry: 1 } });

	// Issue full auth token
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
		maxAge: 60 * 60 * 24,
		path: "/",
	});

	return response;
}

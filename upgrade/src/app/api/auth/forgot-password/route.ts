import { sendPasswordResetEmail } from "@/lib/email";
import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "fallback-secret-change-me",
);

function generateOtp(): string {
	return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
	await connectDB();
	const { email } = await req.json();

	if (!email) {
		return NextResponse.json({ error: "Email is required" }, { status: 400 });
	}

	const user = await User.findOne({ email: email.toLowerCase() });

	// Always respond success to prevent email enumeration
	if (!user) {
		return NextResponse.json({ ok: true });
	}

	const otp = generateOtp();
	const otpHash = await bcrypt.hash(otp, 10);
	const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

	await User.findByIdAndUpdate(user._id, { otpHash, otpExpiry });

	try {
		await sendPasswordResetEmail(user.email, otp);
	} catch (err) {
		console.error("Failed to send reset email:", err);
		return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
	}

	const tempToken = await new SignJWT({ id: user._id.toString(), type: "password-reset" })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("10m")
		.sign(JWT_SECRET);

	return NextResponse.json({ ok: true, tempToken });
}

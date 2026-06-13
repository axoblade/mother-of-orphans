import { sendOtpEmail } from "@/lib/email";
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
	const { email, password } = await req.json();

	if (!email || !password) {
		return NextResponse.json({ error: "Email and password required" }, { status: 400 });
	}

	const user = await User.findOne({ email: email.toLowerCase() });
	if (!user) {
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}

	const isValid = await user.comparePassword(password);
	if (!isValid) {
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	}

	// Generate and store OTP
	const otp = generateOtp();
	const otpHash = await bcrypt.hash(otp, 10);
	const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

	await User.findByIdAndUpdate(user._id, { otpHash, otpExpiry });

	// Send OTP email
	try {
		await sendOtpEmail(user.email, otp);
	} catch (err) {
		console.error("Failed to send OTP email:", err);
		return NextResponse.json({ error: "Failed to send OTP email. Check server configuration." }, { status: 500 });
	}

	// Issue a short-lived temp token so the OTP step knows which user to verify
	const tempToken = await new SignJWT({ id: user._id.toString(), type: "otp-pending" })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("10m")
		.sign(JWT_SECRET);

	return NextResponse.json({ requiresOtp: true, tempToken });
}

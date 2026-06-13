import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "fallback-secret-change-me",
);

export async function POST(req: NextRequest) {
	await connectDB();
	const { tempToken, otp, newPassword } = await req.json();

	if (!tempToken || !otp || !newPassword) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	if (newPassword.length < 8) {
		return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
	}

	let userId: string;
	try {
		const { payload } = await jwtVerify(tempToken, JWT_SECRET);
		if (payload.type !== "password-reset" || !payload.id) throw new Error();
		userId = payload.id as string;
	} catch {
		return NextResponse.json({ error: "Invalid or expired session. Please start over." }, { status: 401 });
	}

	const user = await User.findById(userId);
	if (!user || !user.otpHash || !user.otpExpiry) {
		return NextResponse.json({ error: "OTP not found. Please start over." }, { status: 401 });
	}

	if (new Date() > user.otpExpiry) {
		await User.findByIdAndUpdate(userId, { $unset: { otpHash: 1, otpExpiry: 1 } });
		return NextResponse.json({ error: "Code has expired. Please start over." }, { status: 401 });
	}

	const isValid = await bcrypt.compare(otp, user.otpHash);
	if (!isValid) {
		return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 401 });
	}

	// Update password (pre-save hook hashes it)
	user.password = newPassword;
	user.otpHash = undefined;
	user.otpExpiry = undefined;
	await user.save();

	return NextResponse.json({ ok: true });
}

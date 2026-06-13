import { requireAdmin } from "@/lib/apiAuth";
import { sendWelcomeEmail } from "@/lib/email";
import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const auth = await requireAdmin(req);
	if (!auth.ok) return auth.response;
	await connectDB();
	const users = await User.find({}, { password: 0, otpHash: 0, otpExpiry: 0 })
		.sort({ createdAt: 1 })
		.lean();
	return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
	const auth = await requireAdmin(req);
	if (!auth.ok) return auth.response;
	await connectDB();

	const { name, email, role, password } = await req.json();
	if (!name || !email || !password) {
		return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
	}

	const existing = await User.findOne({ email: email.toLowerCase() });
	if (existing) {
		return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
	}

	const user = await User.create({ name, email, role: role || "content_manager", password });

	try {
		await sendWelcomeEmail(email, name, role || "content_manager", password);
	} catch (err) {
		console.error("Failed to send welcome email:", err);
	}

	return NextResponse.json(
		{ _id: user._id, name: user.name, email: user.email, role: user.role },
		{ status: 201 },
	);
}

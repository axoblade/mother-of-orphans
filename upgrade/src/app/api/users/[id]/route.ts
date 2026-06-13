import { requireAdmin } from "@/lib/apiAuth";
import { User } from "@/lib/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireAdmin(req);
	if (!auth.ok) return auth.response;
	await connectDB();

	const { id } = await params;
	const { name, role, password } = await req.json();

	const update: Record<string, string> = {};
	if (name) update.name = name;
	if (role) update.role = role;

	const user = await User.findByIdAndUpdate(id, update, { new: true }).select(
		"-password -otpHash -otpExpiry",
	);
	if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

	// Password change handled separately so bcrypt hook fires
	if (password) {
		user.password = password;
		await user.save();
	}

	return NextResponse.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = await requireAdmin(req);
	if (!auth.ok) return auth.response;
	await connectDB();

	const { id } = await params;

	// Prevent self-delete
	if (id === auth.payload.id) {
		return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
	}

	// Prevent deleting the last admin
	const target = await User.findById(id);
	if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

	if (target.role === "admin") {
		const adminCount = await User.countDocuments({ role: "admin" });
		if (adminCount <= 1) {
			return NextResponse.json({ error: "Cannot delete the last administrator" }, { status: 400 });
		}
	}

	await target.deleteOne();
	return NextResponse.json({ ok: true });
}

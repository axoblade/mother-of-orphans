import { Cause } from "@/lib/models/Cause";
import { connectDB } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const cause = await Cause.findById(id).lean();
	if (!cause) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json(cause);
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const body = await req.json();
	const existing = await Cause.findById(id).lean();
	if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

	if ((existing as { isDefault?: boolean }).isDefault) {
		const cause = await Cause.findByIdAndUpdate(
			id,
			{ $set: { active: body.active } },
			{ new: true },
		).lean();
		revalidatePath("/causes");
		revalidatePath("/");
		return NextResponse.json(cause);
	}

	const cause = await Cause.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
	if (!cause) return NextResponse.json({ error: "Not found" }, { status: 404 });
	revalidatePath("/causes");
	revalidatePath("/");
	return NextResponse.json(cause);
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const existing = await Cause.findById(id).lean();
	if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

	if ((existing as { isDefault?: boolean }).isDefault) {
		return NextResponse.json(
			{ error: "Seeded causes cannot be deleted. You can disable them instead." },
			{ status: 403 },
		);
	}

	await Cause.findByIdAndDelete(id);
	revalidatePath("/causes");
	revalidatePath("/");
	return NextResponse.json({ success: true });
}

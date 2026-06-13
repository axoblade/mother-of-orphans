import { Event } from "@/lib/models/Event";
import { connectDB } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const event = await Event.findById(id).lean();
	if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json(event);
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const body = await req.json();
	const existing = await Event.findById(id).lean();
	if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

	if ((existing as { isDefault?: boolean }).isDefault) {
		const event = await Event.findByIdAndUpdate(
			id,
			{ $set: { active: body.active } },
			{ new: true },
		).lean();
		revalidatePath("/events");
		revalidatePath("/");
		return NextResponse.json(event);
	}

	const event = await Event.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
	if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
	revalidatePath("/events");
	revalidatePath("/");
	return NextResponse.json(event);
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const existing = await Event.findById(id).lean();
	if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

	if ((existing as { isDefault?: boolean }).isDefault) {
		return NextResponse.json(
			{ error: "Seeded events cannot be deleted. You can disable them instead." },
			{ status: 403 },
		);
	}

	await Event.findByIdAndDelete(id);
	revalidatePath("/events");
	revalidatePath("/");
	return NextResponse.json({ success: true });
}

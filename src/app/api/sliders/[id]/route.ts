import { Slider } from "@/lib/models/Slider";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const body = await req.json();
	const existing = await Slider.findById(id).lean();
	if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

	if ((existing as { isDefault?: boolean }).isDefault) {
		const slider = await Slider.findByIdAndUpdate(
			id,
			{ $set: { active: body.active } },
			{ new: true },
		).lean();
		return NextResponse.json(slider);
	}

	const slider = await Slider.findByIdAndUpdate(id, { $set: body }, { new: true }).lean();
	return NextResponse.json(slider);
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const existing = await Slider.findById(id).lean();
	if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

	if ((existing as { isDefault?: boolean }).isDefault) {
		return NextResponse.json(
			{ error: "Seeded slides cannot be deleted. You can disable them instead." },
			{ status: 403 },
		);
	}

	await Slider.findByIdAndDelete(id);
	return NextResponse.json({ success: true });
}

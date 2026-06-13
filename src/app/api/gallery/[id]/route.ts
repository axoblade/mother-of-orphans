import { GalleryImage } from "@/lib/models/Gallery";
import { connectDB } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const body = await req.json();

	const image = await GalleryImage.findById(id);
	if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

	if (image.isDefault) {
		image.active = Boolean(body.active);
	} else {
		if (typeof body.title === "string") image.title = body.title;
		if (typeof body.category === "string") image.category = body.category;
		if (typeof body.image === "string") image.image = body.image;
		if (typeof body.featured === "boolean") image.featured = body.featured;
		if (typeof body.active === "boolean") image.active = body.active;
	}

	image.markModified("active");
	await image.save();
	revalidatePath("/gallery");
	return NextResponse.json({ ...image.toObject(), _id: String(image._id) });
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const image = await GalleryImage.findById(id);
	if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

	if (image.isDefault) {
		return NextResponse.json(
			{ error: "Default gallery images cannot be deleted. You can disable them instead." },
			{ status: 403 },
		);
	}

	await image.deleteOne();
	revalidatePath("/gallery");
	return NextResponse.json({ success: true });
}

import { GalleryImage } from "@/lib/models/Gallery";
import { connectDB } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	await connectDB();
	const { searchParams } = new URL(req.url);
	const category = searchParams.get("category");
	const all = searchParams.get("all");
	const filter: Record<string, unknown> = {};
	if (!all) filter.active = true;
	if (category) filter.category = category;

	const images = await GalleryImage.find(filter)
		.sort({ order: 1, createdAt: -1 })
		.lean();

	const serialized = images.map((img) => ({
		...img,
		_id: String(img._id),
		active: Boolean((img as { active?: boolean }).active),
		isDefault: Boolean((img as { isDefault?: boolean }).isDefault),
	}));
	return NextResponse.json(serialized);
}

export async function POST(req: NextRequest) {
	await connectDB();
	const body = await req.json();
	const image = await GalleryImage.create(body);
	revalidatePath("/gallery");
	return NextResponse.json({ ...image.toObject(), _id: String(image._id) }, { status: 201 });
}

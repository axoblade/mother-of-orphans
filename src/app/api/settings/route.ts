import { SiteSettings } from "@/lib/models/SiteSettings";
import { connectDB } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
	await connectDB();
	let settings = await SiteSettings.findOne().lean();
	if (!settings) {
		settings = await SiteSettings.create({});
	}
	return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
	await connectDB();
	const body = await req.json();
	// Strip system fields so they don't end up in $set
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { _id, __v, createdAt, updatedAt, ...updateData } = body;
	const settings = await SiteSettings.findOneAndUpdate(
		{},
		{ $set: updateData },
		{ returnDocument: "after", upsert: true, strict: false },
	).lean();
	revalidatePath("/");
	revalidatePath("/about");
	revalidatePath("/contact");
	revalidatePath("/causes");
	revalidatePath("/events");
	revalidatePath("/gallery");
	return NextResponse.json(settings);
}

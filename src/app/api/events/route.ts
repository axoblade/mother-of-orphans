import { Event } from "@/lib/models/Event";
import { connectDB } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	await connectDB();
	const { searchParams } = new URL(req.url);
	const featured = searchParams.get("featured");
	const all = searchParams.get("all"); // admin uses ?all=true to see inactive too
	const filter: Record<string, unknown> = {};
	if (!all) filter.active = true;
	if (featured === "true") filter.featured = true;

	const events = await Event.find(filter).sort({ eventDate: -1 }).lean();
	return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
	await connectDB();
	const body = await req.json();
	body.slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
	const event = await Event.create(body);
	revalidatePath("/events");
	revalidatePath("/");
	return NextResponse.json(event, { status: 201 });
}

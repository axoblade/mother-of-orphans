import { Slider } from "@/lib/models/Slider";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	await connectDB();
	const { searchParams } = new URL(req.url);
	const all = searchParams.get("all"); // admin uses ?all=true to see inactive too
	const filter: Record<string, unknown> = {};
	if (!all) filter.active = true;

	const sliders = await Slider.find(filter)
		.sort({ order: 1, createdAt: 1 })
		.lean();
	return NextResponse.json(sliders);
}

export async function POST(req: NextRequest) {
	await connectDB();
	const body = await req.json();
	const slider = await Slider.create(body);
	return NextResponse.json(slider, { status: 201 });
}

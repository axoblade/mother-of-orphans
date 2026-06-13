import { TeamMember } from "@/lib/models/TeamMember";
import { connectDB } from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const DEFAULTS = [
	{ name: "Ms Nalumansi Sania", role: "Founder and Director", order: 1 },
	{ name: "Nalumansi Faridah Kirabo", role: "Treasurer", order: 2 },
	{ name: "Nalumansi Hamidah Kirabo", role: "Programs Manager", order: 3 },
];

export async function GET(req: NextRequest) {
	await connectDB();

	// Seed defaults on first call if collection is empty
	const count = await TeamMember.countDocuments();
	if (count === 0) {
		await TeamMember.insertMany(
			DEFAULTS.map((d) => ({ ...d, isDefault: true, active: true })),
		);
	}

	const { searchParams } = new URL(req.url);
	const all = searchParams.get("all");
	const filter = all ? {} : { active: true };

	const members = await TeamMember.find(filter).sort({ order: 1, createdAt: 1 }).lean();
	return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
	await connectDB();
	const body = await req.json();
	const last = await TeamMember.findOne().sort({ order: -1 }).lean();
	const order = last ? ((last as { order?: number }).order ?? 0) + 1 : 1;
	const member = await TeamMember.create({ ...body, order });
	revalidatePath("/about");
	return NextResponse.json(member, { status: 201 });
}

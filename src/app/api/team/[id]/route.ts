import { TeamMember } from "@/lib/models/TeamMember";
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
	const member = await TeamMember.findByIdAndUpdate(id, body, { new: true });
	if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
	revalidatePath("/about");
	return NextResponse.json(member);
}

export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	await connectDB();
	const { id } = await params;
	const member = await TeamMember.findById(id);
	if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
	if (member.isDefault) {
		return NextResponse.json({ error: "Cannot delete a default team member" }, { status: 403 });
	}
	await member.deleteOne();
	revalidatePath("/about");
	return NextResponse.json({ ok: true });
}

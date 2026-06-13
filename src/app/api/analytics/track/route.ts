import { hashIp, PageVisit, Visitor } from "@/lib/models/Analytics";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

function getIp(req: NextRequest): string {
	return (
		req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
		req.headers.get("x-real-ip") ||
		"unknown"
	);
}

export async function POST(req: NextRequest) {
	try {
		const { path } = await req.json();
		const ip = getIp(req);
		const ipHash = hashIp(ip);
		const ua = req.headers.get("user-agent") || "";

		await connectDB();

		// Record the page visit
		await PageVisit.create({ ipHash, path: path || "/", ua });

		// Upsert the visitor record
		await Visitor.findOneAndUpdate(
			{ ipHash },
			{ $set: { lastSeen: new Date() }, $inc: { visitCount: 1 }, $setOnInsert: { firstSeen: new Date() } },
			{ upsert: true },
		);

		return NextResponse.json({ ok: true });
	} catch {
		return NextResponse.json({ ok: false }, { status: 500 });
	}
}

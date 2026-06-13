import { requireAdmin } from "@/lib/apiAuth";
import { Donation } from "@/lib/models/Donation";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	const auth = await requireAdmin(req);
	if (!auth.ok) return auth.response;

	await connectDB();

	const url = req.nextUrl;
	const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
	const limit = Math.min(
		50,
		Math.max(1, Number(url.searchParams.get("limit")) || 20),
	);
	const status = url.searchParams.get("status");
	const search = url.searchParams.get("search");

	const filter: Record<string, unknown> = {};
	if (
		status &&
		["PENDING", "COMPLETED", "FAILED", "CANCELLED"].includes(status)
	) {
		filter.status = status;
	}
	if (search) {
		filter.$or = [
			{ donorName: { $regex: search, $options: "i" } },
			{ donorEmail: { $regex: search, $options: "i" } },
			{ merchantReference: { $regex: search, $options: "i" } },
			{ orderTrackingId: { $regex: search, $options: "i" } },
		];
	}

	const [donations, total] = await Promise.all([
		Donation.find(filter)
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean(),
		Donation.countDocuments(filter),
	]);

	return NextResponse.json({
		donations,
		pagination: {
			page,
			limit,
			total,
			pages: Math.ceil(total / limit),
		},
	});
}

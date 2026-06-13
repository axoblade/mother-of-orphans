import { PageVisit, Visitor } from "@/lib/models/Analytics";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
	await connectDB();

	const now = new Date();
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	// Aggregate visits per day for the last 30 days
	const visitsByDay = await PageVisit.aggregate([
		{ $match: { createdAt: { $gte: thirtyDaysAgo } } },
		{
			$group: {
				_id: {
					$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
				},
				total: { $sum: 1 },
				uniqueIps: { $addToSet: "$ipHash" },
			},
		},
		{ $sort: { _id: 1 } },
	]);

	const days = visitsByDay.map((d) => ({
		date: d._id as string,
		total: d.total as number,
		unique: (d.uniqueIps as string[]).length,
	}));

	// Overall totals
	const totalVisits = await PageVisit.countDocuments();
	const totalUnique = await Visitor.countDocuments();

	// New vs returning in last 30 days
	const newVisitors = await Visitor.countDocuments({ firstSeen: { $gte: thirtyDaysAgo } });
	const returning = totalUnique - newVisitors;

	// Top paths
	const topPaths = await PageVisit.aggregate([
		{ $match: { createdAt: { $gte: thirtyDaysAgo } } },
		{ $group: { _id: "$path", count: { $sum: 1 } } },
		{ $sort: { count: -1 } },
		{ $limit: 5 },
	]);

	return NextResponse.json({
		days,
		totals: { visits: totalVisits, unique: totalUnique },
		last30: { newVisitors, returning },
		topPaths: topPaths.map((p) => ({ path: p._id as string, count: p.count as number })),
	});
}

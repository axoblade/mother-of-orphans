import crypto from "crypto";
import mongoose, { Model, Schema } from "mongoose";

// PageVisit - one record per page view
const PageVisitSchema = new Schema(
	{
		ipHash: { type: String, required: true, index: true },
		path: { type: String, required: true },
		ua: { type: String, default: "" },
	},
	{ timestamps: true },
);

// Visitor - one record per unique IP (tracks first/last seen)
const VisitorSchema = new Schema(
	{
		ipHash: { type: String, required: true, unique: true },
		firstSeen: { type: Date, default: Date.now },
		lastSeen: { type: Date, default: Date.now },
		visitCount: { type: Number, default: 1 },
	},
	{ timestamps: false },
);

export const PageVisit: Model<{ ipHash: string; path: string; ua: string; createdAt: Date }> =
	mongoose.models.PageVisit ||
	mongoose.model("PageVisit", PageVisitSchema);

export const Visitor: Model<{ ipHash: string; firstSeen: Date; lastSeen: Date; visitCount: number }> =
	mongoose.models.Visitor ||
	mongoose.model("Visitor", VisitorSchema);

export function hashIp(ip: string): string {
	return crypto.createHash("sha256").update(ip + (process.env.JWT_SECRET || "")).digest("hex");
}

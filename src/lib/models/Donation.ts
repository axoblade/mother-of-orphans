import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDonation extends Document {
	orderTrackingId: string;
	merchantReference: string;
	amount: number;
	currency: string;
	status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
	description: string;
	donorName?: string;
	donorEmail?: string;
	donorPhone?: string;
	paymentMethod?: string;
	confirmationCode?: string;
	statusDescription?: string;
	ipnLogs: { receivedAt: Date; rawQuery: string }[];
	createdAt: Date;
	updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
	{
		orderTrackingId: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		merchantReference: { type: String, required: true, unique: true },
		amount: { type: Number, required: true },
		currency: { type: String, default: "USD" },
		status: {
			type: String,
			enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
			default: "PENDING",
		},
		description: { type: String, default: "" },
		donorName: { type: String },
		donorEmail: { type: String },
		donorPhone: { type: String },
		paymentMethod: { type: String },
		confirmationCode: { type: String },
		statusDescription: { type: String },
		ipnLogs: {
			type: [
				{
					receivedAt: { type: Date, default: Date.now },
					rawQuery: { type: String },
				},
			],
			default: [],
		},
	},
	{ timestamps: true },
);

export const Donation: Model<IDonation> =
	mongoose.models.Donation ||
	mongoose.model<IDonation>("Donation", DonationSchema);

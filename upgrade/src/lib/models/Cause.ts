import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICause extends Document {
	title: string;
	slug: string;
	summary: string;
	description: string;
	image: string;
	goal: number;
	raised: number;
	featured: boolean;
	active: boolean;
	isDefault: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const CauseSchema = new Schema<ICause>(
	{
		title: { type: String, required: true },
		slug: { type: String, required: true, unique: true },
		summary: { type: String, required: true },
		description: { type: String, default: "" },
		image: { type: String, default: "" },
		goal: { type: Number, default: 0 },
		raised: { type: Number, default: 0 },
		featured: { type: Boolean, default: false },
		active: { type: Boolean, default: true },
		isDefault: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const Cause: Model<ICause> =
	mongoose.models.Cause || mongoose.model<ICause>("Cause", CauseSchema);

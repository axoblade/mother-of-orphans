import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEvent extends Document {
	title: string;
	slug: string;
	summary: string;
	description: string;
	image: string;
	location: string;
	eventDate: Date;
	endDate?: Date;
	featured: boolean;
	active: boolean;
	isDefault: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
	{
		title: { type: String, required: true },
		slug: { type: String, required: true, unique: true },
		summary: { type: String, required: true },
		description: { type: String, default: "" },
		image: { type: String, default: "" },
		location: { type: String, default: "" },
		eventDate: { type: Date, required: true },
		endDate: { type: Date },
		featured: { type: Boolean, default: false },
		active: { type: Boolean, default: true },
		isDefault: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const Event: Model<IEvent> =
	mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

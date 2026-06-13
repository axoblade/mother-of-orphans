import mongoose, { Document, Model, Schema } from "mongoose";

export interface IGalleryImage extends Document {
	title: string;
	image: string;
	category: string;
	featured: boolean;
	active: boolean;
	order: number;
	isDefault: boolean;
	createdAt: Date;
}

const GallerySchema = new Schema<IGalleryImage>(
	{
		title: { type: String, required: true },
		image: { type: String, required: true },
		category: { type: String, default: "General" },
		featured: { type: Boolean, default: false },
		active: { type: Boolean, default: true },
		order: { type: Number, default: 0 },
		isDefault: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const GalleryImage: Model<IGalleryImage> =
	mongoose.models.GalleryImage ||
	mongoose.model<IGalleryImage>("GalleryImage", GallerySchema);

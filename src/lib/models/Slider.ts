import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISlider extends Document {
	title: string;
	subtitle: string;
	text: string;
	image: string;
	active: boolean;
	order: number;
	isDefault: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const SliderSchema = new Schema<ISlider>(
	{
		title: { type: String, required: true },
		subtitle: { type: String, default: "" },
		text: { type: String, default: "" },
		image: { type: String, default: "" },
		active: { type: Boolean, default: true },
		order: { type: Number, default: 0 },
		isDefault: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const Slider: Model<ISlider> =
	mongoose.models.Slider || mongoose.model<ISlider>("Slider", SliderSchema);

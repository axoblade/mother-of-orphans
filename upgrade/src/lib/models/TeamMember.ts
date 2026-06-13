import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITeamMember extends Document {
	name: string;
	role: string;
	image: string;
	bio: string;
	order: number;
	active: boolean;
	isDefault: boolean;
}

const TeamMemberSchema = new Schema<ITeamMember>(
	{
		name: { type: String, required: true },
		role: { type: String, default: "" },
		image: { type: String, default: "" },
		bio: { type: String, default: "" },
		order: { type: Number, default: 0 },
		active: { type: Boolean, default: true },
		isDefault: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

export const TeamMember: Model<ITeamMember> =
	mongoose.models.TeamMember ||
	mongoose.model<ITeamMember>("TeamMember", TeamMemberSchema);

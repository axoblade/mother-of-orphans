import bcrypt from "bcryptjs";
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
	email: string;
	password: string;
	name: string;
	role: "admin" | "editor";
	createdAt: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
	{
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: true },
		name: { type: String, required: true },
		role: { type: String, enum: ["admin", "editor"], default: "editor" },
	},
	{ timestamps: true },
);

UserSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (
	candidatePassword: string,
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

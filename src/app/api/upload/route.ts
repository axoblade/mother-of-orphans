import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File | null;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		if (file.size > MAX_SIZE) {
			return NextResponse.json(
				{ error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum is 2MB.` },
				{ status: 400 },
			);
		}

		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif"];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, AVIF." },
				{ status: 400 },
			);
		}

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);
		const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

		const result = await cloudinary.uploader.upload(base64, {
			folder: "motheroforphans",
			resource_type: "image",
		});

		return NextResponse.json({
			success: true,
			url: result.secure_url,
			publicId: result.public_id,
			width: result.width,
			height: result.height,
			bytes: result.bytes,
			format: result.format,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("[Upload] Failed:", message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

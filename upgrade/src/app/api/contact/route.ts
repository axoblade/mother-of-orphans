import { ContactMessage } from "@/lib/models/Contact";
import { connectDB } from "@/lib/mongodb";
import { verifyCaptcha } from "@/app/api/captcha/route";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { captchaToken, captchaAnswer, website, ...fields } = body;

	// Honeypot - filled means bot
	if (website) {
		return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
	}

	if (!captchaToken || !captchaAnswer) {
		return NextResponse.json({ error: "Please complete the verification." }, { status: 400 });
	}

	if (!verifyCaptcha(captchaToken, String(captchaAnswer))) {
		return NextResponse.json({ error: "Incorrect answer. Please try again." }, { status: 400 });
	}

	await connectDB();
	const message = await ContactMessage.create(fields);
	return NextResponse.json({ success: true, id: message._id }, { status: 201 });
}

export async function GET() {
	await connectDB();
	const messages = await ContactMessage.find().sort({ createdAt: -1 }).lean();
	return NextResponse.json(messages);
}

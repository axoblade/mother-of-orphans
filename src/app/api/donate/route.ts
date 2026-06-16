import { Donation } from "@/lib/models/Donation";
import { connectDB } from "@/lib/mongodb";
import { isPesaPalConfigured, submitOrder } from "@/lib/pesapal";
import { NextRequest, NextResponse } from "next/server";

// Generate a short unique reference
function generateRef(): string {
	return `MOP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function sanitizeText(value: string): string {
	return value.replace(/[^a-zA-Z0-9\s]/g, "").trim();
}

function sanitizePhone(value: string): string {
	return value.replace(/\D/g, "").trim();
}

export async function POST(req: NextRequest) {
	if (!isPesaPalConfigured()) {
		return NextResponse.json(
			{ error: "PesaPal is not configured" },
			{ status: 503 },
		);
	}

	try {
		await connectDB();

		const body = await req.json();
		const {
			amount,
			currency = "USD",
			donorName,
			donorEmail,
			donorPhone,
			description = "Donation to Mother of Orphans",
		} = body;

		const normalizedDonorName =
			typeof donorName === "string" ? sanitizeText(donorName) : undefined;
		const normalizedDonorEmail =
			typeof donorEmail === "string" ? donorEmail.trim() : undefined;
		const normalizedDonorPhone =
			typeof donorPhone === "string" ? sanitizePhone(donorPhone) : undefined;

		if (!amount || typeof amount !== "number" || amount <= 0) {
			return NextResponse.json(
				{ error: "A valid donation amount is required" },
				{ status: 400 },
			);
		}

		const merchantReference = generateRef();
		const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

		const order = await submitOrder({
			id: merchantReference,
			currency,
			amount,
			description,
			callback_url: `${baseUrl}/api/donate/callback`,
			redirect_url: `${baseUrl}/donate?status=complete&ref=${merchantReference}`,
			cancellation_url: `${baseUrl}/donate?status=cancelled&ref=${merchantReference}`,
			billing_address: {
				email_address: normalizedDonorEmail,
				phone_number: normalizedDonorPhone,
				first_name: normalizedDonorName?.split(" ")[0],
				last_name: normalizedDonorName?.split(" ").slice(1).join(" "),
			},
		});

		// Save pending donation in DB
		await Donation.create({
			orderTrackingId: order.order_tracking_id,
			merchantReference,
			amount,
			currency,
			status: "PENDING",
			description,
			donorName: normalizedDonorName,
			donorEmail: normalizedDonorEmail,
			donorPhone: normalizedDonorPhone,
		});

		return NextResponse.json({
			orderTrackingId: order.order_tracking_id,
			merchantReference,
			redirectUrl: order.redirect_url,
		});
	} catch (err: unknown) {
		const message =
			err instanceof Error ? err.message : "Failed to initiate donation";
		console.error("Donation initiation failed:", message);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

import { Donation } from "@/lib/models/Donation";
import { connectDB } from "@/lib/mongodb";
import { getTransactionStatus, isPesaPalConfigured } from "@/lib/pesapal";
import { NextRequest, NextResponse } from "next/server";

/**
 * Check payment status by orderTrackingId.
 * GET /api/donate/status?orderTrackingId=xxx
 */
export async function GET(req: NextRequest) {
	const orderTrackingId = req.nextUrl.searchParams.get("orderTrackingId");
	if (!orderTrackingId) {
		return NextResponse.json(
			{ error: "orderTrackingId required" },
			{ status: 400 },
		);
	}

	try {
		await connectDB();

		const donation = await Donation.findOne({ orderTrackingId }).lean();
		if (!donation) {
			return NextResponse.json(
				{ error: "Donation not found" },
				{ status: 404 },
			);
		}

		// If still pending, try to check with PesaPal
		if (donation.status === "PENDING" && isPesaPalConfigured()) {
			try {
				const status = await getTransactionStatus(orderTrackingId);
				if (status.status_code === 3) {
					await Donation.updateOne(
						{ orderTrackingId },
						{
							$set: {
								status: "COMPLETED",
								paymentMethod: status.payment_method,
								confirmationCode: status.confirmation_code,
								statusDescription: status.payment_status_description,
							},
						},
					);
					donation.status = "COMPLETED";
					donation.paymentMethod = status.payment_method;
					donation.confirmationCode = status.confirmation_code;
					donation.statusDescription = status.payment_status_description;
				}
			} catch {
				// PesaPal status check failed — keep current status
			}
		}

		return NextResponse.json({
			orderTrackingId: donation.orderTrackingId,
			merchantReference: donation.merchantReference,
			amount: donation.amount,
			currency: donation.currency,
			status: donation.status,
			description: donation.description,
			donorName: donation.donorName,
			paymentMethod: donation.paymentMethod,
			confirmationCode: donation.confirmationCode,
			statusDescription: donation.statusDescription,
		});
	} catch (err: unknown) {
		const message =
			err instanceof Error ? err.message : "Failed to check status";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}

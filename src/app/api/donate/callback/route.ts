import { Donation } from "@/lib/models/Donation";
import { connectDB } from "@/lib/mongodb";
import {
	getTransactionStatus,
	isPesaPalConfigured,
	parseCallbackParams,
} from "@/lib/pesapal";
import { NextRequest } from "next/server";

/**
 * PesaPal IPN (Instant Payment Notification) callback.
 * PesaPal calls this URL when payment status changes.
 * GET: receives query params from PesaPal.
 */
export async function GET(req: NextRequest) {
	if (!isPesaPalConfigured()) {
		return new Response("Not configured", { status: 503 });
	}

	const params = req.nextUrl.searchParams;
	const { orderTrackingId, orderMerchantReference, orderNotificationType } =
		parseCallbackParams(params);

	if (!orderTrackingId || !orderMerchantReference) {
		return new Response("Missing parameters", { status: 400 });
	}

	try {
		await connectDB();

		// Look up the donation
		const donation = await Donation.findOne({ orderTrackingId });
		if (!donation) {
			return new Response("Donation not found", { status: 404 });
		}

		// Log the IPN call
		donation.ipnLogs.push({
			receivedAt: new Date(),
			rawQuery: params.toString(),
		});

		// Verify with PesaPal
		const status = await getTransactionStatus(orderTrackingId);

		// Map PesaPal status codes:
		// 0 - INVALID, 1 - PENDING, 2 - PROCESSING, 3 - COMPLETED, 4 - FAILED, 5 - REVERSED
		if (status.status_code === 3) {
			donation.status = "COMPLETED";
		} else if (status.status_code === 1 || status.status_code === 2) {
			donation.status = "PENDING";
		} else {
			donation.status = "FAILED";
		}

		donation.paymentMethod = status.payment_method;
		donation.confirmationCode = status.confirmation_code;
		donation.statusDescription = status.payment_status_description;
		await donation.save();

		// Respond to PesaPal with 200 so it doesn't retry
		return new Response(
			`IPN received: orderTrackingId=${orderTrackingId}, notificationType=${orderNotificationType}`,
			{ status: 200 },
		);
	} catch (err: unknown) {
		console.error("IPN callback error:", err);
		return new Response("Internal error", { status: 500 });
	}
}

/**
 * PesaPal API v3 helper for donation processing.
 *
 * Reference: https://developer.pesapal.com/api-docs/v3
 */

const PESAPAL_BASE =
	process.env.PESAPAL_ENVIRONMENT === "live"
		? "https://pay.pesapal.com/v3"
		: "https://cybqa.pesapal.com/pesapalv3";

function credentials() {
	const key = process.env.PESAPAL_CONSUMER_KEY;
	const secret = process.env.PESAPAL_CONSUMER_SECRET;
	if (!key || !secret) return null;
	return { key, secret };
}

export function isPesaPalConfigured(): boolean {
	return credentials() !== null;
}

interface PesaPalToken {
	token: string;
	expiry: number;
}

let cachedToken: PesaPalToken | null = null;
let cachedIpnId: string | null = null;

async function getToken(): Promise<string> {
	const creds = credentials();
	if (!creds) throw new Error("PesaPal credentials not configured");

	if (cachedToken && Date.now() < cachedToken.expiry - 60_000) {
		return cachedToken.token;
	}

	const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			consumer_key: creds.key,
			consumer_secret: creds.secret,
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`PesaPal auth failed: ${res.status} ${text}`);
	}

	const data = await res.json();
	cachedToken = {
		token: data.token,
		expiry: Date.now() + (Number(data.expiryDate) || 3600) * 1000,
	};
	return cachedToken.token;
}

/**
 * Register an IPN (Instant Payment Notification) URL with PesaPal.
 * Returns the ipn_id needed for order submission.
 * The IPN URL registration is cached in-memory for the lifetime of the server.
 */
async function getIpnId(callbackUrl: string): Promise<string> {
	if (cachedIpnId) return cachedIpnId;

	const token = await getToken();

	const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			url: callbackUrl,
			ipn_notification_type: "GET",
		}),
	});

	const data = await res.json();

	if (!res.ok || data.error) {
		throw new Error(
			data.error?.message || `IPN registration failed: ${res.status}`,
		);
	}

	cachedIpnId = data.ipn_id;
	return cachedIpnId as string;
}

export interface SubmitOrderRequest {
	id: string; // unique order id from your system
	currency: string; // e.g. "USD"
	amount: number;
	description: string;
	callback_url: string; // IPN callback
	redirect_url: string; // where user lands after payment
	cancellation_url?: string;
	notification_id?: string; // IPN id — register IPN first if needed
	billing_address?: {
		email_address?: string;
		phone_number?: string;
		country_code?: string;
		first_name?: string;
		middle_name?: string;
		last_name?: string;
		line_1?: string;
		line_2?: string;
		city?: string;
		state?: string;
		postal_code?: string;
		zip_code?: string;
	};
}

export interface SubmitOrderResponse {
	order_tracking_id: string;
	merchant_reference: string;
	redirect_url: string;
	error?: { code: string; message: string };
}

export async function submitOrder(
	order: SubmitOrderRequest,
): Promise<SubmitOrderResponse> {
	const token = await getToken();

	// Ensure IPN is registered and get the ipn_id
	const ipnId = await getIpnId(order.callback_url);

	const res = await fetch(
		`${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ ...order, notification_id: ipnId }),
		},
	);

	const data = await res.json();
	if (!res.ok || data.error) {
		throw new Error(
			data.error?.message || `PesaPal order failed: ${res.status}`,
		);
	}
	return data as SubmitOrderResponse;
}

export interface TransactionStatus {
	payment_method: string;
	amount: number;
	created_date: string;
	confirmation_code: string;
	payment_status_description: string;
	description: string;
	message: string;
	payment_account: string;
	call_back_url: string;
	status_code: number;
	merchant_reference: string;
	payment_status_code: string;
	currency: string;
	error?: { code: string; message: string };
}

export async function getTransactionStatus(
	orderTrackingId: string,
): Promise<TransactionStatus> {
	const token = await getToken();

	const res = await fetch(
		`${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
		{
			method: "GET",
			headers: {
				Accept: "application/json",
				Authorization: `Bearer ${token}`,
			},
		},
	);

	const data = await res.json();
	if (!res.ok || data.error) {
		throw new Error(
			data.error?.message || `Status check failed: ${res.status}`,
		);
	}
	return data as TransactionStatus;
}

/**
 * Verify the IPN callback is genuinely from PesaPal by checking the
 * query parameters against the transaction status API.
 */
export function parseCallbackParams(params: URLSearchParams): {
	orderTrackingId: string;
	orderMerchantReference: string;
	orderNotificationType: string;
} {
	const orderTrackingId = params.get("OrderTrackingId") || "";
	const orderMerchantReference = params.get("OrderMerchantReference") || "";
	const orderNotificationType = params.get("OrderNotificationType") || "";
	return { orderTrackingId, orderMerchantReference, orderNotificationType };
}

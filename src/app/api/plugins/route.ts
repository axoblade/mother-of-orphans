import { isPesaPalConfigured } from "@/lib/pesapal";
import { NextResponse } from "next/server";

export async function GET() {
	const pesapal = isPesaPalConfigured();
	return NextResponse.json({
		plugins: {
			pesapal: {
				enabled: pesapal,
				name: "PesaPal",
				description: "Online donations via PesaPal payment gateway",
			},
		},
	});
}

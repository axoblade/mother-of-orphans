"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AnalyticsTracker() {
	const pathname = usePathname();

	useEffect(() => {
		// Only track if user has consented to cookies
		if (typeof localStorage !== "undefined" && localStorage.getItem("cookie-consent") !== "accepted") {
			return;
		}

		navigator.sendBeacon(
			"/api/analytics/track",
			new Blob([JSON.stringify({ path: pathname })], { type: "application/json" }),
		);
	}, [pathname]);

	return null;
}

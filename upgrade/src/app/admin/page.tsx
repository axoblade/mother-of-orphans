import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "fallback-secret-change-me",
);

export default async function AdminRoot() {
	const cookieStore = await cookies();
	const token = cookieStore.get("admin_token")?.value;
	if (token) {
		try {
			await jwtVerify(token, JWT_SECRET);
			redirect("/admin/dashboard");
		} catch {
			// token invalid or expired
		}
	}
	redirect("/admin/login");
}

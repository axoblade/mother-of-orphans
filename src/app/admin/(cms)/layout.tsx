import AdminLayout from "@/components/admin/AdminLayout";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
	return <AdminLayout>{children}</AdminLayout>;
}

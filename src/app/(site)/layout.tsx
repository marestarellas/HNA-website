import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// Layout for the "real" public site. The /design route group skips this so
// each design direction can express its own chrome.
export default function SiteLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<SiteHeader />
			<div className="flex-1">{children}</div>
			<SiteFooter />
		</>
	);
}

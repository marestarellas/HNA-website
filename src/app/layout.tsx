import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
	title: "Attuning to Nature",
	description:
		"A scientific and artistic project on how humans attune to, and become coupled with, their environments.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full antialiased" suppressHydrationWarning>
			<body className="flex min-h-full flex-col">
				{/*
				  Apply the stored theme before the first paint, otherwise the page
				  renders at the system preference and then snaps to the chosen one —
				  the flash every themed site starts out having. `beforeInteractive` is
				  the supported way to run something this early in the App Router; a
				  bare <script> element works too but React warns about it, since it
				  would not re-execute on client navigation.

				  `suppressHydrationWarning` on <html> is because this legitimately
				  mutates the element before React reaches it.
				*/}
				<Script id="atn-theme-init" strategy="beforeInteractive">
					{`(function(){try{var t=localStorage.getItem('atn-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`}
				</Script>
				{children}
			</body>
		</html>
	);
}

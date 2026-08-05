import type { Metadata } from "next";
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
		<html lang="en" className="h-full antialiased">
			<body className="flex min-h-full flex-col">{children}</body>
		</html>
	);
}

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CookiesProvider } from "next-client-cookies/server";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Color Palette Generator",
	description: "Generate color palettes with the click of a button.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<CookiesProvider>
				<Toaster position="top-center" />
				<body className={(outfit.className, "overflow-hidden")}>
					{children}
				</body>
			</CookiesProvider>
		</html>
	);
}

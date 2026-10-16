import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
	return (
		<html lang="fr">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, viewport-fit=cover"
				/>
				<meta
					name="theme-color"
					content="#065F46"
				/>
				<meta
					name="apple-mobile-web-app-capable"
					content="yes"
				/>
				<meta
					name="apple-mobile-web-app-title"
					content="عمارتي"
				/>
				<link
					rel="manifest"
					href="/manifest.json"
				/>
				<link
					rel="apple-touch-icon"
					href="/logo-192.png"
				/>
				<title>عمارتي - 3imarati</title>
				<ScrollViewStyleReset />
			</head>
			<body>{children}</body>
		</html>
	);
}

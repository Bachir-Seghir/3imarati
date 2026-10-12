import { AuthProvider } from "@/src/features/auth/context/AuthContext";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

if (Platform.OS !== "web") {
	const Notifications = require("expo-notifications");

	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowBanner: true,
			shouldShowList: true,
			shouldPlaySound: true,
			shouldSetBadge: false,
		}),
	});
}

export default function RootLayout() {
	return (
		<AuthProvider>
			<SafeAreaProvider>
				<Stack screenOptions={{ headerShown: false }} />
			</SafeAreaProvider>
		</AuthProvider>
	);
}

import { AuthProvider } from "@/src/features/auth/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
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
	const [fontsLoaded] = useFonts(Ionicons.font);

	if (!fontsLoaded) {
		return null;
	}
	return (
		<AuthProvider>
			<SafeAreaProvider>
				<Stack screenOptions={{ headerShown: false }} />
			</SafeAreaProvider>
		</AuthProvider>
	);
}

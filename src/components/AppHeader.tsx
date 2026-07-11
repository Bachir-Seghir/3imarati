import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useAuth } from "../features/auth/context/AuthContext";

export default function AppHeader() {
	const { profile } = useAuth();

	const firstLetter = profile?.fullName?.charAt(0).toUpperCase() || "Inv";
	return (
		<>
			<View className=" bg-slate-800 flex-row justify-between">
				<Pressable
					onPress={() => {
						if (router.canGoBack()) {
							router.back();
						}
					}}
					className="flex px-6 py-2 items-center"
				>
					<Ionicons
						name="arrow-back"
						size={22}
						color="#ececec"
					/>
				</Pressable>
				{profile?.role === "admin" && (
					<Pressable
						onPress={() => router.push("/admin")}
						className="flex flex-row gap-1 px-6 py-2 items-center"
					>
						<Ionicons
							name="settings-sharp"
							size={22}
							color="#9ed1f1"
						/>
						<Text className="font-semibold text-sky-100">Menu Admin</Text>
					</Pressable>
				)}
			</View>

			<View className="flex flex-row justify-between px-4 pt-5 pb-2 border-b-2 border-b-white items-center">
				<Pressable onPress={() => router.push("/(tabs)")}>
					<Image
						source={require("@/assets/images/logo-3.png")}
						style={{ width: 60, height: 60 }}
						resizeMode="contain"
					/>
				</Pressable>

				<View className="flex items-center">
					<Pressable onPress={() => router.push("/(tabs)/profile")}>
						<View className="flex flex-row gap-x-2 items-center">
							{/* 🟢 Name */}
							<View>
								<Text className="text-gray-500">Bonjour 👋</Text>
								<Text className="text-lg font-bold text-gray-800">
									{profile?.fullName || "Invité"}
								</Text>
							</View>
							{/* 🟢 Avatar */}
							<View className="w-12 h-12 bg-sky-700 rounded-full items-center justify-center">
								<Text className="text-white text-xl font-bold">
									{firstLetter}
								</Text>
							</View>
						</View>
					</Pressable>
				</View>
			</View>
		</>
	);
}

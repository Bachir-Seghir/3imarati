import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useAuth } from "../features/auth/context/AuthContext";
import { hasAnyRole } from "../utils/RolesCheck";

export default function AppHeader() {
	const { profile } = useAuth();

	const firstLetter = profile?.fullName?.charAt(0).toUpperCase() || "I";

	const isAdmin = hasAnyRole(profile, ["superAdmin", "admin", "budgetManager"]);

	return (
		<View className="relative h-[145px] overflow-hidden">
			{/* ================================================= */}
			{/* GREEN SMASH BACKGROUND */}
			{/* ================================================= */}

			<View className="absolute inset-0">
				<Svg
					width="100%"
					height="170"
					viewBox="0 0 400 145"
					preserveAspectRatio="none"
				>
					<Path
						d="
				M0 0
				H400
				V90

				C350 105 300 70 250 75
				C180 80 120 125 0 120

				Z
			"
						fill="#065F46"
					/>
				</Svg>
			</View>

			{/* ================================================= */}
			{/* LIGHT GREEN DECORATION */}
			{/* ================================================= */}

			{/* ================================================= */}
			{/* HEADER CONTENT */}
			{/* ================================================= */}

			<View className="flex-row items-start justify-between px-5 pt-4">
				{/* ========================= */}
				{/* LOGO */}
				{/* ========================= */}
				<Pressable
					onPress={() => router.push("/(tabs)")}
					className=" rounded-2xl"
				>
					<Image
						source={require("@/assets/images/logo-header.png")}
						style={{
							width: 100,
							height: 100,
						}}
						resizeMode="contain"
					/>
				</Pressable>

				{/* ========================= */}
				{/* RIGHT SIDE */}
				{/* ========================= */}

				<View className="items-end">
					{/* ADMIN MENU */}

					{isAdmin && (
						<Pressable
							onPress={() => router.push("/admin")}
							className="flex-row items-center mb-4"
						>
							<Ionicons
								name="settings-sharp"
								size={21}
								color="#FDE68A"
							/>

							<Text className="ml-1.5 font-bold text-white">Menu Admin</Text>
						</Pressable>
					)}

					{/* USER */}

					<Pressable onPress={() => router.push("/(tabs)/profile")}>
						<View className="flex-row items-center">
							{/* NAME */}

							<View className="items-end mr-2">
								<Text className="text-green-100 text-sm">Bonjour 👋</Text>

								<Text
									className="text-white text-sm font-bold"
									numberOfLines={1}
								>
									{profile?.fullName || "Invité"}
								</Text>
							</View>

							{/* AVATAR */}

							<View
								className="w-11 h-11 rounded-full items-center justify-center"
								style={{
									backgroundColor: "#FACC15",
									borderWidth: 3,
									borderColor: "#FFFFFF",
								}}
							>
								<Text
									className="text-base font-bold"
									style={{
										color: "#065F46",
									}}
								>
									{firstLetter}
								</Text>
							</View>
						</View>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

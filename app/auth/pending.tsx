import { useAuth } from "@/src/features/auth/context/AuthContext";
import { auth } from "@/src/services/firebase";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { Image, Pressable, Text, View } from "react-native";

export default function PendingScreen() {
	const { profile } = useAuth();

	const handleLogout = async () => {
		await signOut(auth);
		router.replace("/");
	};

	useEffect(() => {
		if (profile?.approved) {
			router.replace("/(tabs)");
		}
	}, [profile]);
	return (
		<View className="flex-1 justify-center items-center px-6 bg-white">
			<View className="flex flex-row items-center justify-center mb-6">
				<Pressable
					onPress={() => router.replace("/")}
					className="mb-10"
				>
					<Image
						source={require("@/assets/images/logo-3.png")}
						style={{ width: 200, height: 200 }}
						resizeMode="contain"
					/>
				</Pressable>
			</View>
			{/* Title */}
			<Text className="text-2xl font-bold text-gray-800 mb-4">
				⏳ Attente d'approbation
			</Text>

			{/* Description */}
			<Text className="text-gray-500 text-center mb-6">
				Votre Compte n'est pas approuvé par l'administrateur.
			</Text>

			{/* Info Box */}
			<View className="bg-yellow-100 p-4 rounded-2xl mb-6 w-full">
				<Text className="text-yellow-800 text-center">
					Si votre compte reste désactivé plus que 24h appeler 0775650704.
				</Text>
			</View>

			{/* Logout button */}
			<Pressable
				onPress={handleLogout}
				className="bg-red-500 px-6 py-3 rounded-xl"
			>
				<Text className="text-white font-semibold">Sortir</Text>
			</Pressable>
		</View>
	);
}

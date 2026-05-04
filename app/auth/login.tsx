import { useAuth } from "@/src/features/auth/context/AuthContext";
import { login } from "@/src/features/auth/services/auth.service";
import { getAuthErrorMessage } from "@/src/utils/authErrors";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";

export default function LoginScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const { user, profile } = useAuth();

	const handleLogin = async () => {
		setError(null);
		setLoading(true);
		try {
			await login(email, password);
		} catch (e: any) {
			setLoading(false);
			console.log("Login error:", e);
			setError(getAuthErrorMessage(e));
		}
	};
	useEffect(() => {
		if (user) {
			setLoading(false);
			router.replace("/");
		}
	}, [user]);

	return (
		<View className="flex-1 px-4 pt-20">
			<View className="flex flex-row justify-center mb-6">
				<Pressable onPress={() => router.push("/(tabs)")}>
					<Image
						source={require("@/assets/images/logo-3.png")}
						style={{ width: 100, height: 100 }}
						resizeMode="contain"
					/>
				</Pressable>
			</View>

			<Text className="text-2xl font-bold mb-6">Connecter</Text>
			{error && (
				<Text className="text-md font-bold mb-6 text-red-600">{error}</Text>
			)}
			<TextInput
				placeholder="Email"
				className="border p-3 rounded-lg mb-3"
				onChangeText={setEmail}
			/>
			<TextInput
				placeholder="Password"
				secureTextEntry
				className="border p-3 rounded-lg mb-4"
				onChangeText={setPassword}
			/>
			{loading ? (
				<ActivityIndicator />
			) : (
				<Pressable
					onPress={handleLogin}
					className="bg-blue-600 p-3 rounded-lg"
				>
					<Text className="text-white text-center font-semibold">
						Connecter
					</Text>
				</Pressable>
			)}

			<Link
				href="/auth/register"
				asChild
			>
				<Text className="text-blue-600 mt-4 text-center">Créer un compte</Text>
			</Link>
		</View>
	);
}

import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { updateUserProfile } from "@/src/features/auth/services/user.service";
import { auth } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

export default function ProfileScreen() {
	const { user, profile, loading } = useAuth();

	const [fullName, setFullName] = useState("");
	const [floor, setFloor] = useState("");
	const [door, setDoor] = useState("");
	const [saving, setSaving] = useState(false);

	// 🔹 Load existing data into form
	useEffect(() => {
		if (profile) {
			setFullName(profile.fullName || "");
			setFloor(profile.floor?.toString() || "");
			setDoor(profile.door?.toString() || "");
		}
	}, [profile]);

	// 🔹 Save changes
	const handleSave = async () => {
		if (!user) return;

		try {
			setSaving(true);
			console.log("UPDATING:", { fullName, floor, door });
			await updateUserProfile(user.uid, {
				fullName,
				floor: Number(floor),
				door: Number(door),
			});
		} catch (e) {
			console.log("UPDATE ERROR:", e);
		} finally {
			setSaving(false);
			alert("Profile updated");
		}
	};

	const hasChanges =
		fullName !== profile?.fullName ||
		floor !== profile?.floor.toString() ||
		door !== profile?.door.toString();

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center">
				<ActivityIndicator />
			</View>
		);
	}
	if (!user) {
		return <Redirect href="/auth/login" />;
	}

	if (!profile?.approved) {
		return <Redirect href="/auth/pending" />;
	}
	const handleLogout = async () => {
		await signOut(auth);
		router.replace("/(tabs)");
	};
	return (
		<Screen>
			<ScrollView
				className="flex-1 h-full px-4"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<View className="flex-1 p-4">
					<Text className="text-2xl font-bold mb-4 text-slate-800">
						Mon Compte
					</Text>
					<View className="flex flex-row items-center gap-2 justify-end">
						<Text className="text-xl font-bold mb-1">Sortir</Text>
						<Pressable
							onPress={handleLogout}
							className="p-2 mt-3 mb-3 rounded-full self-end"
						>
							<Ionicons
								name="exit"
								size={22}
								color="blue"
							/>
						</Pressable>
					</View>

					<Text className="text-xl font-bold mb-1">Nom & Prenom</Text>

					<TextInput
						value={fullName}
						onChangeText={setFullName}
						placeholder="Nom & Prenom"
						className="border p-3 rounded-md mb-3"
					/>

					<Text className="text-xl font-bold mb-1">N˚ Etage</Text>

					<TextInput
						value={floor}
						onChangeText={setFloor}
						placeholder="N˚ Etage"
						keyboardType="numeric"
						className="border p-3 rounded-md mb-3"
					/>

					<Text className="text-xl font-bold mb-1">N˚ Porte</Text>

					<TextInput
						value={door}
						onChangeText={setDoor}
						placeholder="N˚ Porte"
						keyboardType="numeric"
						className="border p-3 rounded-md mb-3"
					/>

					<Pressable
						onPress={handleSave}
						className="bg-blue-600 p-3 rounded"
						disabled={saving || !hasChanges}
					>
						<Text className="text-white text-center">
							{saving ? "Saving..." : "Save Changes"}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</Screen>
	);
}

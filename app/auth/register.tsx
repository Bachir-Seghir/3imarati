import Screen from "@/src/components/Screen";
import { auth, db } from "@/src/services/firebase";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function RegisterScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [floor, setFloor] = useState("");
	const [door, setDoor] = useState("");
	const [phone, setPhone] = useState("");

	const handleRegister = async () => {
		if (!email || !fullName || !password || !phone || !floor || !door) {
			alert(
				"il Faut emplire toutes les cases et inserer une photo d'identité ",
			);

			return;
		}

		try {
			// 1. Create user
			const res = await createUserWithEmailAndPassword(auth, email, password);
			const user = res.user;

			if (!user) throw new Error("User creation failed");

			// 2. IMPORTANT: wait for auth to be fully ready
			await user.getIdToken(true);

			// 4. Save Firestore user
			await setDoc(doc(db, "users", user.uid), {
				email,
				fullName,
				floor: Number(floor),
				door: Number(door),
				phone,
				roles: ["resident"],
				approved: false,
				createdAt: serverTimestamp(),
			});

			router.replace("/auth/pending");
		} catch (error) {
			console.log("REGISTER ERROR:", error);
		}
	};

	return (
		<Screen>
			<KeyboardAwareScrollView
				className="flex-1 px-4 pt-10"
				contentContainerStyle={{
					paddingBottom: 120,
					gap: 20,
				}}
				keyboardShouldPersistTaps="handled"
				enableOnAndroid
				extraScrollHeight={40}
			>
				<View className="mt-4 p-4  justify-center">
					<Text className="text-3xl mx-auto font-bold mb-4">
						Créer un nouveau compte
					</Text>

					<TextInput
						placeholder="Email"
						className="border p-3 rounded-md mb-3"
						onChangeText={setEmail}
					/>
					<TextInput
						placeholder="0770xxx"
						keyboardType="phone-pad"
						className="border p-3 rounded-md mb-3"
						onChangeText={setPhone}
					/>

					<TextInput
						placeholder="Mot de Pass"
						secureTextEntry
						className="border p-3 rounded-md mb-3"
						onChangeText={setPassword}
					/>

					<TextInput
						placeholder="Nom & Prénom"
						className="border p-3 rounded-md mb-3"
						onChangeText={setFullName}
					/>

					<TextInput
						placeholder="Étage Ex: 3"
						keyboardType="numeric"
						className="border p-3 rounded-md mb-3"
						onChangeText={setFloor}
					/>

					<TextInput
						placeholder="Porte Ex: 5"
						keyboardType="numeric"
						className="border p-3 rounded-md mb-3"
						onChangeText={setDoor}
					/>

					<Pressable
						onPress={handleRegister}
						className="bg-blue-600 p-3 rounded"
					>
						<Text className="text-white text-center">Inscrir</Text>
					</Pressable>
					<Link
						href="/auth/login"
						asChild
					>
						<Text className="text-blue-600 mt-4 text-center">
							J'ai déja un Compte
						</Text>
					</Link>
				</View>
			</KeyboardAwareScrollView>
		</Screen>
	);
}

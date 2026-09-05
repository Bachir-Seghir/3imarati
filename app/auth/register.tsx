import Screen from "@/src/components/Screen";
import { uploadIdentityImage } from "@/src/features/auth/services/upload.service";
import { auth, db } from "@/src/services/firebase";
import * as ImagePicker from "expo-image-picker";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
	Image,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

export default function RegisterScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [floor, setFloor] = useState("");
	const [door, setDoor] = useState("");
	const [phone, setPhone] = useState("");
	const [image, setImage] = useState<string>("");

	const takePhoto = async () => {
		// 🔐 permission for camera
		const permission = await ImagePicker.requestCameraPermissionsAsync();

		if (!permission.granted) {
			alert("Permission caméra refusée");
			return;
		}

		// 📸 open camera
		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: false,
			quality: 0.7,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	// 📸 Pick image
	const pickImage = async () => {
		// 🔐 Ask permission
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permission.granted) {
			alert("Permission d'accès aux photos refusée");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: "images", // ✅ new API
			allowsEditing: false,
			quality: 0.7,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	const handleRegister = async () => {
		if (
			!email ||
			!fullName ||
			!password ||
			!phone ||
			!floor ||
			!door ||
			!image
		) {
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

			// 3. Upload image AFTER auth is stable
			const imageUrl = await uploadIdentityImage(image, user.uid);

			// 4. Save Firestore user
			await setDoc(doc(db, "users", user.uid), {
				email,
				fullName,
				floor: Number(floor),
				door: Number(door),
				phone,
				identityImage: imageUrl,
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
			<ScrollView
				className="flex-1 px-4 pt-10"
				contentContainerStyle={{
					paddingBottom: Platform.OS === "ios" ? 60 : 100,
					gap: 20,
				}}
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

					{/* Image picker */}
					<Text className="font-semibold mb-2">
						Photo du CIN d'acquéreur ou Locataire
					</Text>
					<View className="flex-row gap-2 mb-6">
						<Pressable
							onPress={takePhoto}
							className="bg-blue-600 p-3 rounded-md flex-1"
						>
							<Text className="text-white text-center font-semibold">
								Prendre photo
							</Text>
						</Pressable>

						<Pressable
							onPress={pickImage}
							className="bg-gray-600 p-3 rounded-md flex-1"
						>
							<Text className="text-white text-center font-semibold">
								Galerie
							</Text>
						</Pressable>
					</View>

					{/* Preview */}
					{image && (
						<Image
							source={{ uri: image }}
							className="w-full h-52 rounded-md mb-4"
							resizeMode="cover"
						/>
					)}
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
			</ScrollView>
		</Screen>
	);
}

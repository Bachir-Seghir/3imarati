import Screen from "@/src/components/Screen";
import { uploadIdentityImage } from "@/src/features/auth/services/upload.service";
import { auth, db } from "@/src/services/firebase";
import * as ImagePicker from "expo-image-picker";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";

export default function RegisterScreen() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullName, setFullName] = useState("");
	const [floor, setFloor] = useState("");
	const [door, setDoor] = useState("");
	const [image, setImage] = useState<string | null>(null);

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 0.7,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	const handleRegister = async () => {
		if (!email || !password || !image) return;

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
				door: Number(floor),
				identityImage: imageUrl,
				role: "resident",
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
			<View className="flex-1 p-4 bg-white justify-center">
				<Text className="text-xl font-bold mb-4">Create Account</Text>

				<TextInput
					placeholder="Email"
					className="border p-3 rounded-md mb-3"
					onChangeText={setEmail}
				/>

				<TextInput
					placeholder="Password"
					secureTextEntry
					className="border p-3 rounded-md mb-3"
					onChangeText={setPassword}
				/>

				<TextInput
					placeholder="Full Name"
					className="border p-3 rounded-md mb-3"
					onChangeText={setFullName}
				/>

				<TextInput
					placeholder="Floor"
					keyboardType="numeric"
					className="border p-3 rounded-md mb-3"
					onChangeText={setFloor}
				/>

				<TextInput
					placeholder="Door"
					keyboardType="numeric"
					className="border p-3 rounded-md mb-3"
					onChangeText={setDoor}
				/>

				<Pressable
					onPress={pickImage}
					className="bg-gray-200 p-3 rounded-md mb-3"
				>
					<Text>Select Identity Card</Text>
				</Pressable>

				{image && (
					<Image
						source={{ uri: image }}
						className="h-32 mb-3 rounded"
					/>
				)}

				<Pressable
					onPress={handleRegister}
					className="bg-blue-600 p-3 rounded"
				>
					<Text className="text-white text-center">Register</Text>
				</Pressable>
				<Link
					href="/auth/login"
					asChild
				>
					<Text className="text-blue-600 mt-4 text-center">
						Already have an Account
					</Text>
				</Link>
			</View>
		</Screen>
	);
}

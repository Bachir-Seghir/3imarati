import { storage } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { Image, Modal, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../auth/context/AuthContext";
import { createComplaint } from "../services/complaint.service";
import { Complaint } from "../types/complaint";

type Category = Complaint["category"];
type Priority = Complaint["priority"];

export const AddComplaintModal = () => {
	const { user, profile } = useAuth();
	const [modalVisible, setModalVisible] = useState(false);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState<Category>("Maintenance");

	const [priority, setPriority] = useState<Priority>("Normale");
	const [imageUri, setImageUri] = useState<string | null>(null);
	const [imageAsset, setImageAsset] =
		useState<ImagePicker.ImagePickerAsset | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handlePickImage = async () => {
		setErrorMessage("");

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.7,
		});

		if (!result.canceled && result.assets.length > 0) {
			setImageAsset(result.assets[0]);
			setImageUri(result.assets[0].uri);
		}
	};
	// 🟢 Submit complaint
	const handleSubmit = async () => {
		if (!user || !profile) return;

		if (!title.trim() || !description.trim()) {
			setErrorMessage("Veuillez saisir un titre et une description.");
			return;
		}

		setIsSubmitting(true);
		setErrorMessage("");

		try {
			let imageUrl: string | null = null;

			if (imageAsset) {
				const response = await fetch(imageAsset.uri);
				const blob = await response.blob();

				const imageRef = ref(
					storage,
					`complaints/${user.uid}/${Date.now()}.jpg`,
				);

				await uploadBytes(imageRef, blob, {
					contentType: imageAsset.mimeType ?? "image/jpeg",
				});

				imageUrl = await getDownloadURL(imageRef);

				// Release the temporary blob where supported.
				if ("close" in blob && typeof blob.close === "function") {
					blob.close();
				}
			}

			await createComplaint({
				userId: user.uid,
				userName: profile.fullName,
				floor: profile.floor,
				door: profile.door,
				title: title.trim(),
				description: description.trim(),
				category,
				priority,
				imageUrl,
			});

			setTitle("");
			setDescription("");
			setCategory("Maintenance");
			setPriority("Normale");
			setImageAsset(null);
			setImageUri(null);
			setModalVisible(false);
		} catch (error) {
			console.error("Error creating complaint:", error);
			setErrorMessage(
				"Impossible d'ajouter la réclamation. Vérifiez votre connexion et réessayez.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};
	return (
		<>
			<Pressable
				onPress={() => setModalVisible(true)}
				className="bg-green-700 rounded-xl active:opacity-80"
			>
				<View className="h-14 flex-row items-center justify-center px-4">
					<View className="bg-white/20 rounded-full w-9 h-9 items-center justify-center">
						<Ionicons
							name="add"
							size={20}
							color="white"
						/>
					</View>

					<Text className="text-white text-base font-bold ml-2">Réclamer</Text>
				</View>
			</Pressable>

			{/* 🟢 CREATE MODAL */}
			<Modal
				visible={modalVisible}
				animationType="slide"
				presentationStyle="fullScreen"
			>
				<SafeAreaView className="flex-1 bg-white">
					<View className="flex-1 justify-center p-5">
						<Text className="text-xl font-bold mb-4">Nouvelle Réclamation</Text>

						<TextInput
							placeholder="Title"
							value={title}
							onChangeText={setTitle}
							className="border p-3 rounded-md mb-3"
						/>

						<TextInput
							placeholder="Description"
							value={description}
							onChangeText={setDescription}
							className="border p-3 rounded-md mb-3"
						/>
						<Text className="font-semibold mb-2">
							Photo du problème (facultatif)
						</Text>

						<Pressable
							onPress={handlePickImage}
							className="flex-row items-center justify-center border border-dashed border-green-700 rounded-lg p-4 mb-3"
						>
							<Ionicons
								name="image-outline"
								size={22}
								color="#065F46"
							/>
							<Text className="text-green-800 font-semibold ml-2">
								{imageUri ? "Changer la photo" : "Choisir une photo"}
							</Text>
						</Pressable>

						{imageUri && (
							<View className="mb-4">
								<Image
									source={{ uri: imageUri }}
									className="w-full h-48 rounded-lg"
									resizeMode="cover"
								/>

								<Pressable
									onPress={() => {
										setImageUri(null);
										setImageAsset(null);
									}}
									className="mt-2 self-end"
								>
									<Text className="text-red-500 font-semibold">
										Supprimer la photo
									</Text>
								</Pressable>
							</View>
						)}

						{errorMessage !== "" && (
							<Text className="text-red-600 mb-3">{errorMessage}</Text>
						)}

						<Text className="font-semibold mb-2">Catégorie</Text>

						<View className="flex-row flex-wrap gap-2 mb-4">
							{["Maintenance", "Bruit", "Nettoyage", "Securité", "Autre"].map(
								(item) => (
									<Pressable
										key={item}
										onPress={() => setCategory(item as any)}
										className={`px-3 py-2 rounded-full border ${
											category === item
												? "bg-blue-600 border-blue-600"
												: "bg-white"
										}`}
									>
										<Text
											className={
												category === item ? "text-white" : "text-gray-700"
											}
										>
											{item}
										</Text>
									</Pressable>
								),
							)}
						</View>
						<Text className="font-semibold mb-2">Priorité</Text>

						<View className="flex-row gap-2 mb-4">
							{["Normale", "Importante"].map((item) => (
								<Pressable
									key={item}
									onPress={() => setPriority(item as any)}
									className={`px-3 py-2 rounded-full border ${
										priority === item
											? "bg-blue-600 border-blue-600"
											: "bg-white"
									}`}
								>
									<Text
										className={
											priority === item ? "text-white" : "text-gray-700"
										}
									>
										{item}
									</Text>
								</Pressable>
							))}
						</View>
						<Pressable
							onPress={handleSubmit}
							disabled={isSubmitting}
							className={`p-3 rounded-md mb-3 ${
								isSubmitting ? "bg-gray-400" : "bg-green-700"
							}`}
						>
							<Text className="text-white text-center text-xl">
								{isSubmitting ? "Envoi en cours..." : "Ajouter"}
							</Text>
						</Pressable>

						<Pressable onPress={() => setModalVisible(false)}>
							<Text className="text-center text-red-500 text-xl">Annuler</Text>
						</Pressable>
					</View>
				</SafeAreaView>
			</Modal>
		</>
	);
};

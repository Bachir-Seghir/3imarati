import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
	Image,
	Modal,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

import AppAlertModal from "@/src/components/AppAlertModal";
import { storage } from "@/src/services/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useAuth } from "../../auth/context/AuthContext";
import { createNotification } from "../services/norification.service";

export function AddNotificationModal() {
	const { user, profile } = useAuth();

	const [visible, setModalVisible] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState<string | null>(null);
	const [category, setCategory] = useState<"Importante" | "Info">("Info");
	const [loading, setLoading] = useState(false);

	// State for the reusable cross-platform alert modal
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertTitle, setAlertTitle] = useState("");
	const [alertMessage, setAlertMessage] = useState("");

	const showAppAlert = (title: string, message: string) => {
		setAlertTitle(title);
		setAlertMessage(message);
		setAlertVisible(true);
	};

	const takePhoto = async () => {
		try {
			const permission = await ImagePicker.requestCameraPermissionsAsync();

			if (!permission.granted) {
				showAppAlert("Permission refusée", "Accès à la caméra refusé.");
				return;
			}

			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ["images"],
				allowsEditing: false,
				quality: 0.7,
			});

			if (!result.canceled && result.assets[0]) {
				setImage(result.assets[0].uri);
			}
		} catch (error) {
			console.error("CAMERA ERROR", error);
			showAppAlert("Erreur", "Impossible d'ouvrir la caméra.");
		}
	};

	const pickImage = async () => {
		try {
			const permission =
				await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (!permission.granted) {
				showAppAlert("Permission refusée", "Accès à la galerie refusé.");
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: false,
				quality: 0.7,
			});

			if (!result.canceled && result.assets[0]) {
				setImage(result.assets[0].uri);
			}
		} catch (error) {
			console.error("IMAGE PICKER ERROR", error);
			showAppAlert("Erreur", "Impossible d'ouvrir la galerie.");
		}
	};
	const uploadNotificationImage = async (imageUri: string): Promise<string> => {
		// Convert the selected local image (camera/gallery or browser) to a Blob.
		const response = await fetch(imageUri);
		const blob = await response.blob();
		const imageRef = ref(
			storage,
			`notifications/${user.uid}/${Date.now()}.jpg`,
		);

		await uploadBytes(imageRef, blob, {
			contentType: blob.type || "image/jpeg",
		});

		return getDownloadURL(imageRef);
	};
	const handleCreate = async () => {
		if (!title.trim()) {
			showAppAlert(
				"Champ obligatoire",
				"Veuillez saisir le titre de la notification.",
			);
			return;
		}

		if (!user?.uid || !profile?.fullName) {
			showAppAlert(
				"Erreur",
				"Votre session utilisateur est introuvable. Veuillez vous reconnecter.",
			);
			return;
		}

		try {
			setLoading(true);

			// Upload the image first, if one was selected.
			const imageUrl = image ? await uploadNotificationImage(image) : null;

			// Save the image URL together with the notification in Firestore.
			await createNotification({
				title: title.trim(),
				description,
				imageUrl,
				category,
				createdById: user.uid,
				createdByName: profile.fullName,
			});

			setTitle("");
			setDescription("");
			setImage(null);
			setCategory("Info");
			setModalVisible(false);
			showAppAlert("Succès", "La notification a été publiée.");
		} catch (error) {
			console.error("CREATE NOTIFICATION ERROR", error);
			showAppAlert(
				"Erreur",
				"Impossible de publier la notification ou d'envoyer son image. Veuillez réessayer.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View className="w-[48%]">
			{/* Open button */}
			<Pressable
				onPress={() => setModalVisible(true)}
				className="mb-3 rounded-md bg-yellow-400 px-4 py-3"
			>
				<Text className="text-center text-lg font-bold text-green-800">
					Ajouter une Notification
				</Text>
			</Pressable>

			{/* Create notification modal */}
			<Modal
				visible={visible}
				animationType="slide"
				transparent
				onRequestClose={() => setModalVisible(false)}
			>
				<Pressable
					className="flex-1 justify-end bg-black/40"
					onPress={() => setModalVisible(false)}
				>
					<Pressable
						className="h-[80%] rounded-t-3xl bg-white p-6"
						onPress={(event) => event.stopPropagation()}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							<Text className="mb-6 text-2xl font-bold">
								Nouvelle notification
							</Text>

							<Text className="mb-2 font-semibold">Titre</Text>
							<TextInput
								value={title}
								onChangeText={setTitle}
								placeholder="Titre..."
								className="mb-4 rounded-lg border p-3"
							/>

							<Text className="mb-2 font-semibold">Description</Text>
							<TextInput
								multiline
								numberOfLines={6}
								textAlignVertical="top"
								value={description}
								onChangeText={setDescription}
								placeholder="Description..."
								className="mb-5 h-40 rounded-lg border p-3"
							/>

							{/* Image picker */}
							<Text className="mb-3 font-semibold">Image (facultatif)</Text>
							<View className="mb-4 flex-row gap-3">
								<Pressable
									onPress={takePhoto}
									disabled={loading}
									className="flex-1 rounded-lg bg-green-700 p-3"
								>
									<Text className="text-center font-semibold text-white">
										📷 Prendre une photo
									</Text>
								</Pressable>

								<Pressable
									onPress={pickImage}
									disabled={loading}
									className="flex-1 rounded-lg bg-gray-200 p-3"
								>
									<Text className="text-center font-semibold text-gray-800">
										🖼 Galerie
									</Text>
								</Pressable>
							</View>

							{image && (
								<View className="mb-5">
									<Image
										source={{ uri: image }}
										className="h-48 w-full rounded-xl"
										resizeMode="cover"
									/>
									<Pressable
										onPress={() => setImage(null)}
										disabled={loading}
										className="mt-2 rounded-lg bg-red-100 p-2"
									>
										<Text className="text-center font-semibold text-red-700">
											Supprimer l'image
										</Text>
									</Pressable>
								</View>
							)}

							{/* Category */}
							<Text className="mb-3 font-semibold">Catégorie</Text>
							<View className="mb-6 flex-row gap-3">
								<Pressable
									onPress={() => setCategory("Importante")}
									className={`rounded-lg px-4 py-3 ${
										category === "Importante" ? "bg-red-500" : "bg-gray-200"
									}`}
								>
									<Text
										className={`font-semibold ${
											category === "Importante" ? "text-white" : "text-black"
										}`}
									>
										Importante
									</Text>
								</Pressable>

								<Pressable
									onPress={() => setCategory("Info")}
									className={`rounded-lg px-4 py-3 ${
										category === "Info" ? "bg-green-700" : "bg-gray-200"
									}`}
								>
									<Text
										className={`font-semibold ${
											category === "Info" ? "text-white" : "text-black"
										}`}
									>
										Information
									</Text>
								</Pressable>
							</View>

							{/* Form buttons */}
							<View className="flex-row justify-end gap-3">
								<Pressable
									onPress={() => setModalVisible(false)}
									disabled={loading}
									className="rounded-lg bg-gray-300 px-5 py-3"
								>
									<Text>Annuler</Text>
								</Pressable>

								<Pressable
									disabled={loading}
									onPress={handleCreate}
									className="rounded-lg bg-green-800 px-5 py-3"
								>
									<Text className="font-semibold text-white">
										{loading ? "Enregistrement..." : "Publier"}
									</Text>
								</Pressable>
							</View>
						</ScrollView>
					</Pressable>
				</Pressable>
			</Modal>

			{/* Reusable cross-platform message modal */}
			<AppAlertModal
				visible={alertVisible}
				title={alertTitle}
				message={alertMessage}
				onClose={() => setAlertVisible(false)}
			/>
		</View>
	);
}

import { useState } from "react";
import {
	Modal,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

import { useAuth } from "../../auth/context/AuthContext";
import { createNotification } from "../services/norification.service";

export function AddNotificationModal() {
	const { user, profile } = useAuth();

	const [visible, setModalVisible] = useState(false);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	const [category, setCategory] = useState<"Importante" | "Info">("Info");

	const [loading, setLoading] = useState(false);

	const handleCreate = async () => {
		if (!title.trim()) return;

		try {
			setLoading(true);

			await createNotification({
				title,
				description,
				category,
				createdById: user.uid,
				createdByName: profile.fullName,
			});

			setTitle("");
			setDescription("");
			setCategory("Info");

			setModalVisible(false);
		} finally {
			setLoading(false);
		}
	};

	return (
		<View className="w-[48%]">
			{/* Button */}
			<Pressable
				onPress={() => setModalVisible(true)}
				className="rounded-md bg-red-400 py-3 px-4 mb-3"
			>
				<Text className="text-lg font-bold text-white text-center">
					Ajouter une Notification
				</Text>
			</Pressable>

			{/* Modal */}
			<Modal
				visible={visible}
				animationType="slide"
				transparent
				onRequestClose={() => setModalVisible(false)}
			>
				{/* BACKGROUND - click here closes modal */}
				<Pressable
					className="flex-1 justify-end bg-black/40"
					onPress={() => setModalVisible(false)}
				>
					{/* MODAL CONTENT - click here does NOT close modal */}
					<Pressable
						className="bg-white rounded-t-3xl p-6 max-h-[90%]"
						onPress={(e) => e.stopPropagation()}
					>
						<ScrollView showsVerticalScrollIndicator={false}>
							<Text className="text-2xl font-bold mb-6">
								Nouvelle notification
							</Text>

							{/* Title */}
							<Text className="font-semibold mb-2">Titre</Text>

							<TextInput
								value={title}
								onChangeText={setTitle}
								placeholder="Titre..."
								className="border rounded-lg p-3 mb-4"
							/>

							{/* Description */}
							<Text className="font-semibold mb-2">Description</Text>

							<TextInput
								multiline
								numberOfLines={6}
								textAlignVertical="top"
								value={description}
								onChangeText={setDescription}
								placeholder="Description..."
								className="border rounded-lg p-3 h-40 mb-5"
							/>

							{/* Category */}
							<Text className="font-semibold mb-3">Catégorie</Text>

							<View className="flex-row gap-3 mb-6">
								<Pressable
									onPress={() => setCategory("Importante")}
									className={`px-4 py-3 rounded-lg ${
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
									className={`px-4 py-3 rounded-lg ${
										category === "Info" ? "bg-blue-500" : "bg-gray-200"
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

							{/* Buttons */}
							<View className="flex-row justify-end gap-3">
								<Pressable
									onPress={() => setModalVisible(false)}
									className="bg-gray-300 rounded-lg px-5 py-3"
								>
									<Text>Annuler</Text>
								</Pressable>

								<Pressable
									disabled={loading}
									onPress={handleCreate}
									className="bg-blue-600 rounded-lg px-5 py-3"
								>
									<Text className="text-white font-semibold">
										{loading ? "Enregistrement..." : "Publier"}
									</Text>
								</Pressable>
							</View>
						</ScrollView>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

import { UserProfile } from "@/src/types/user";
import { Ionicons } from "@expo/vector-icons";
import { User } from "firebase/auth";
import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createComplaint } from "../services/complaint.service";
import { Complaint } from "../types/complaint";

type Category = Complaint["category"];
type Priority = Complaint["priority"];

type Props = {
	user: User;
	profile: UserProfile;
};
export const AddComplaintModal = ({ user, profile }: Props) => {
	const [modalVisible, setModalVisible] = useState(false);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState<Category>("Maintenance");

	const [priority, setPriority] = useState<Priority>("Normale");

	// 🟢 Submit complaint
	const handleSubmit = async () => {
		if (!user) return;

		await createComplaint({
			userId: user.uid,
			userName: profile.fullName,
			floor: profile.floor,
			door: profile.door,
			title,
			description,
			category,
			priority,
			imageUrl: null,
		});

		setTitle("");
		setDescription("");
		setCategory("Maintenance");
		setPriority("Normale");
		setModalVisible(false);
	};
	return (
		<>
			<Pressable
				onPress={() => setModalVisible(true)}
				className="absolute bottom-6 right-6 bg-blue-600 p-4 rounded-full"
			>
				<Ionicons
					name="add"
					size={24}
					color="white"
				/>
			</Pressable>

			{/* 🟢 CREATE MODAL */}
			<Modal
				visible={modalVisible}
				animationType="slide"
				presentationStyle="fullScreen"
			>
				<SafeAreaView className="flex-1 bg-white">
					<View className="flex-1 justify-center p-5">
						<Text className="text-xl font-bold mb-4">Nouveau Plainte</Text>

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
							className="bg-blue-600 p-3 rounded-md mb-3"
						>
							<Text className="text-white text-center text-xl">Ajouter</Text>
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

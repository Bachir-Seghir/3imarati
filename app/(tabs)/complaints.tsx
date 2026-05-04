import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { createComplaint } from "@/src/features/complaints/services/complaint.service";
import { Complaint } from "@/src/features/complaints/types/complaint";
import { db } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
	Modal,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Category = Complaint["category"];
type Priority = Complaint["priority"];

function getStatusColor(status: string) {
	switch (status) {
		case "En_Attente":
			return "text-red-400";
		case "En_Traitement":
			return "text-yellow-500";
		case "Résolue":
			return "text-green-500";
		default:
			break;
	}
}
export default function ComplaintsScreen() {
	const { user, profile } = useAuth();
	const [complaints, setComplaints] = useState<any[]>([]);
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

	useEffect(() => {
		const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));

		const unsubscribe = onSnapshot(q, (snap) => {
			const data = snap.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			setComplaints(data);
		});

		return () => unsubscribe();
	}, []);

	return (
		<Screen>
			<ScrollView
				className="flex-1  px-4 pt-10"
				contentContainerStyle={{
					paddingBottom: Platform.OS === "ios" ? 60 : 100,
					gap: 20,
				}}
			>
				<Text className="text-2xl font-bold mb-4">Plaintes</Text>

				{complaints.map((item) => (
					<View
						key={item.id}
						className="bg-white rounded-md border border-slate-200"
					>
						<View className="p-4 pb-3">
							<Text className="font-semibold text-gray-800 text-md">
								Titre : {item.title}
							</Text>
							<Text className="text-gray-500 mt-1">
								Détails : {item.description}
							</Text>
						</View>

						<View className="flex gap-y-1 bg-slate-100 p-4 pb-3 rounded-br-md rounded-bl-md">
							<View className={`flex flex-row justify-between py-1 rounded-md`}>
								<Text className="text-md font-bold text-gray-600">
									Catégorie : {item.category}
								</Text>
								<Text
									className={`${getStatusColor(item.status)} text-md font-semibold`}
								>
									État : {item.status}
								</Text>
							</View>
							<View className="flex items-end">
								<Text
									className={`${item.priority === "Importante" ? "text-red-400" : "text-gray-700"} text-md font-bold`}
								>
									Priorité: {item.priority}
								</Text>
							</View>
							<View className="flex flex-row justify-between">
								<Text className="  font-semibold text-blue-500 text-md mt-2">
									Creé par :
								</Text>
								<Text className="  font-semibold text-blue-500 text-md mt-2">
									{item.userName} - {item.floor}-{item.door}
								</Text>
							</View>
						</View>
					</View>
				))}
			</ScrollView>

			{/* ➕ Floating button */}
			{user && profile?.approved && (
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
									{[
										"Maintenance",
										"Bruit",
										"Nettoyage",
										"Securité",
										"Autre",
									].map((item) => (
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
									))}
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
									<Text className="text-white text-center text-xl">
										Ajouter
									</Text>
								</Pressable>

								<Pressable onPress={() => setModalVisible(false)}>
									<Text className="text-center text-red-500 text-xl">
										Annuler
									</Text>
								</Pressable>
							</View>
						</SafeAreaView>
					</Modal>
				</>
			)}
		</Screen>
	);
}

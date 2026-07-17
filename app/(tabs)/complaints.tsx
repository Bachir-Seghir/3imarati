import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { AddComplaintModal } from "@/src/features/complaints/components/AddComplaintModal";
import { db } from "@/src/services/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

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
	const [filteredComplaints, setFilteredComplaints] = useState<any[]>([]);
	const [selectedStatus, setSelectedStatus] = useState<string>("");

	useEffect(() => {
		const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));

		const unsubscribe = onSnapshot(q, (snap) => {
			const data = snap.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			setComplaints(data);
			setFilteredComplaints(data);
		});

		return () => unsubscribe();
	}, []);

	const handleFilter = (status: string) => {
		setSelectedStatus(status);

		setFilteredComplaints(complaints.filter((item) => item.status === status));
	};

	const handleReset = () => {
		setSelectedStatus("");
		setFilteredComplaints(complaints);
	};
	return (
		<Screen>
			<ScrollView
				className="flex-1  px-4 pt-10"
				contentContainerStyle={{
					paddingBottom: Platform.OS === "ios" ? 60 : 100,
					gap: 20,
				}}
			>
				<View className="bg-white rounded-md border border-slate-200 p-4 mb-4">
					<Text className="font-semibold mb-3">Filtrer par état</Text>

					<View className="flex-row flex-wrap gap-2">
						{["En_Attente", "En_Traitement", "Résolue"].map((status) => (
							<Pressable
								key={status}
								onPress={() => handleFilter(status)}
								className={`px-3 py-2 rounded-md ${
									selectedStatus === status ? "bg-blue-600" : "bg-gray-200"
								}`}
							>
								<Text
									className={`font-medium ${
										selectedStatus === status ? "text-white" : "text-black"
									}`}
								>
									{status.replace("_", " ")}
								</Text>
							</Pressable>
						))}

						<Pressable
							onPress={handleReset}
							className="px-3 py-2 rounded-md bg-red-500"
						>
							<Text className="text-white font-medium">Afficher tous</Text>
						</Pressable>
					</View>
				</View>
				<Text className="text-2xl font-bold mb-4">Plaintes</Text>

				{filteredComplaints.map((item) => (
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
				<AddComplaintModal
					user={user}
					profile={profile}
				/>
			)}
		</Screen>
	);
}

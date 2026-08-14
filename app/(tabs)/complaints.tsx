import { ComplaintsFilter } from "@/src/components/ComplaintsFilter";
import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { AddComplaintModal } from "@/src/features/complaints/components/AddComplaintModal";
import { db } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import {
	collection,
	doc,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
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
			return "text-gray-500";
	}
}

export default function ComplaintsScreen() {
	const { user, profile } = useAuth();

	const [complaints, setComplaints] = useState<any[]>([]);
	const [filteredComplaints, setFilteredComplaints] = useState<any[]>([]);
	const [filterActive, setFilterActive] = useState(false);

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
	const handleTakeComplaint = async (complaint: any) => {
		await updateDoc(doc(db, "complaints", complaint.id), {
			status: "En_Traitement",
			assignedToId: user?.uid,
			assignedToName: profile?.fullName,
			assignedAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
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
				<Text className="text-2xl mx-auto font-bold">Réclamations</Text>

				<ComplaintsFilter
					data={complaints}
					onFilter={setFilteredComplaints}
					onActiveChange={setFilterActive}
					highlight={filterActive}
				/>

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
							<View className="flex flex-row justify-between py-1">
								<Text className="text-md font-bold text-gray-600">
									Catégorie : {item.category}
								</Text>

								<Text
									className={`${getStatusColor(
										item.status,
									)} text-md font-semibold`}
								>
									État : {item.status}
								</Text>
							</View>

							<View className="items-end">
								<Text
									className={`${
										item.priority === "Importante"
											? "text-red-400"
											: "text-gray-700"
									} text-md font-bold`}
								>
									Priorité : {item.priority}
								</Text>
							</View>

							<View className="flex-row justify-between">
								<Text className="font-semibold text-blue-500 text-md mt-2">
									Créé par :
								</Text>

								<Text className="font-semibold text-blue-500 text-md mt-2">
									{item.userName} - {item.floor}-{item.door}
								</Text>
							</View>
							<View className="flex-row justify-between">
								{item.assignedToName && (
									<>
										<Text className="font-semibold text-orange-500 text-md mt-2">
											Pris en charge par : ''
											<Ionicons
												name="person-circle-outline"
												size={18}
												color="#orange"
											/>
											''
										</Text>
									</>
								)}
								<Text className="font-semibold text-orange-500 text-md mt-2">
									{item.assignedToName}
								</Text>
							</View>
							{item.status === "En_Attente" && (
								<Pressable
									className="bg-orange-500 mt-3 p-2 rounded-md"
									onPress={() => handleTakeComplaint(item)}
								>
									<Text className="text-white text-center font-semibold">
										Prendre en charge
									</Text>
								</Pressable>
							)}
						</View>
					</View>
				))}
			</ScrollView>

			{user && profile?.approved && (
				<AddComplaintModal
					user={user}
					profile={profile}
				/>
			)}
		</Screen>
	);
}

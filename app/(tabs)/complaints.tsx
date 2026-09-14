import { ComplaintsFilter } from "@/src/components/ComplaintsFilter";
import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { db } from "@/src/services/firebase";
import { hasAnyRole } from "@/src/utils/RolesCheck";
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
import {
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

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
	const handleReleaseComplaint = async (complaint: any) => {
		if (!user) return;

		const isAdmin = hasAnyRole(profile, ["admin", "superAdmin"]);
		const isAssignee = complaint.assignedToId === user.uid;

		// Assignee, admin or superAdmin can release the complaint
		if (!isAssignee && !isAdmin) return;

		await updateDoc(doc(db, "complaints", complaint.id), {
			status: "En_Attente",
			assignedToId: null,
			assignedToName: null,
			assignedAt: null,
			updatedAt: serverTimestamp(),
		});
	};
	const handleResolveComplaint = async (complaint: any) => {
		if (!user) return;

		const isAdmin = hasAnyRole(profile, ["admin", "superAdmin"]);
		const isAssignee = complaint.assignedToId === user.uid;

		// Only the assignee, admin or superAdmin can resolve
		if (!isAssignee && !isAdmin) return;

		await updateDoc(doc(db, "complaints", complaint.id), {
			status: "Résolue",
			resolvedAt: serverTimestamp(),
			resolvedById: user.uid,
			resolvedByName: profile?.fullName,
			updatedAt: serverTimestamp(),
		});
	};
	return (
		<Screen>
			<ScrollView
				className="flex-1 px-2"
				contentContainerStyle={{
					paddingBottom: Platform.OS === "ios" ? 60 : 100,
					gap: 20,
				}}
			>
				<Text className="text-xl mx-auto font-bold">Réclamations</Text>

				<ComplaintsFilter
					data={complaints}
					onFilter={setFilteredComplaints}
					onActiveChange={setFilterActive}
					highlight={filterActive}
					currentUserId={user?.uid}
					currentUserName={profile?.fullName}
				/>

				{filteredComplaints.map((item) => (
					<View
						key={item.id}
						className="bg-white rounded-md border border-slate-200 shadow-sm"
					>
						<View className="p-3">
							<Text className="font-semibold text-gray-800 text-md">
								Titre : {item.title}
							</Text>

							<TextInput
								maxLength={100}
								className="text-gray-500 text-sm"
							>
								Détails : {item.description}
							</TextInput>
						</View>

						<View className="flex gap-y-1 bg-slate-100 p-3 rounded-br-md rounded-bl-md">
							<View className="flex flex-row justify-between py-1">
								<Text className="text-sm font-bold text-gray-600">
									Catégorie : {item.category}
								</Text>

								<Text
									className={`${getStatusColor(
										item.status,
									)} text-sm font-semibold`}
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
									} text-sm font-bold`}
								>
									Priorité : {item.priority}
								</Text>
							</View>

							<View className="flex-row justify-between">
								<Text className="font-semibold text-blue-500 text-sm">
									Créé par :
								</Text>

								<Text className="font-semibold text-blue-500 text-sm">
									{item.userName} - {item.floor}-{item.door}
								</Text>
							</View>
							{item.assignedToName && (
								<View className="flex-row justify-between">
									<Text className="font-semibold text-orange-500 text-sm">
										Pris en charge par : ''
										<Ionicons
											name="person-circle-outline"
											size={18}
											color="#orange"
										/>
										''
									</Text>
									<Text className="font-semibold text-orange-500 text-sm">
										{item.assignedToName}
									</Text>
								</View>
							)}
							{item.status === "En_Attente" && (
								<Pressable
									className="bg-orange-500 p-2 rounded-md"
									onPress={() => handleTakeComplaint(item)}
								>
									<Text className="text-white text-sm text-center font-semibold">
										Prendre en charge
									</Text>
								</Pressable>
							)}
							<View className="flex-row gap-2">
								{item.status === "En_Traitement" &&
									item.assignedToId === user?.uid && (
										<Pressable
											className="bg-gray-500 p-2 mt-2 rounded-md flex-[2]"
											onPress={() => handleReleaseComplaint(item)}
										>
											<Text className="text-white text-center text-sm font-semibold">
												Ne pas prendre en charge
											</Text>
										</Pressable>
									)}
								{item.status === "En_Traitement" &&
									(item.assignedToId === user?.uid ||
										hasAnyRole(profile, ["admin", "superAdmin"])) && (
										<Pressable
											className="bg-green-600 p-2 mt-2 rounded-md flex-1"
											onPress={() => handleResolveComplaint(item)}
										>
											<Text className="text-white text-center text-sm font-semibold">
												Résolue
											</Text>
										</Pressable>
									)}
							</View>
						</View>
					</View>
				))}
			</ScrollView>
		</Screen>
	);
}

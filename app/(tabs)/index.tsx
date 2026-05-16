import { BudgetModal } from "@/src/components/BudgetModal";
import { CotisationBtn } from "@/src/components/CotisationBtn";
import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { AddComplaintModal } from "@/src/features/complaints/components/AddComplaintModal";
import { db } from "@/src/services/firebase";
import { router } from "expo-router";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
	const { user, profile } = useAuth();
	const [residents, setResidents] = useState<number | null>(0);
	const [complaints, setComplaints] = useState<any[]>([]);
	const [budget, setBudget] = useState<number | null>(0);

	useEffect(() => {
		const qUsers = query(
			collection(db, "users"),
			where("approved", "==", true),
		);

		const unsubscribeUsers = onSnapshot(qUsers, (snap) => {
			setResidents(snap.size);
		});

		const qComplaints = query(collection(db, "complaints"));

		const unsubscribeComp = onSnapshot(qComplaints, (snap) => {
			const data = snap.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			setComplaints(data);
		});
		const budgetRef = doc(db, "budget", "main");

		const unsubscribeBudget = onSnapshot(budgetRef, (docSnap) => {
			if (docSnap.exists()) {
				setBudget(docSnap.data().amount || 0);
			}
		});
		return () => {
			unsubscribeUsers();
			unsubscribeComp();
			unsubscribeBudget();
		};
	}, []);

	return (
		<Screen>
			<ScrollView
				className="flex-1 h-full px-4"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				{/* Stats Cards */}

				<View className="flex-row justify-between flex-wrap gap-4">
					<View className="bg-white p-4 rounded-2xl w-[48%] shadow-sm">
						<Text className="text-gray-500 font-semibold">
							Résidents Inscrits
						</Text>
						<Text className="text-xl font-bold mt-1">{residents} / 72</Text>
					</View>
					<View className="bg-white p-4 rounded-2xl w-[48%] shadow-sm">
						<Pressable onPress={() => router.push("/(tabs)/complaints")}>
							<Text className="text-gray-500 font-semibold">Plaintes</Text>
							<View className="flex flex-row gap-2 items-center">
								<Text className="text-md font-bold mt-1 text-yellow-500">
									{
										complaints.filter((c) => c.status === "En_Traitement")
											.length
									}{" "}
									/ {complaints.length}
								</Text>
								<Text>en traitement</Text>
							</View>
							<View className="flex flex-row gap-2 items-center">
								<Text className="text-md font-bold mt-1 text-red-300">
									{complaints.filter((c) => c.status === "En_Attente").length} /{" "}
									{complaints.length}
								</Text>
								<Text>en Attente</Text>
							</View>
							<View className="flex flex-row gap-2 items-center">
								<Text className="text-md font-bold mt-1 text-green-500">
									{complaints.filter((c) => c.status === "Résolue").length} /{" "}
									{complaints.length}
								</Text>
								<Text>Résolues</Text>
							</View>
						</Pressable>
					</View>

					<View className="bg-white p-4 rounded-2xl w-[48%] shadow-sm">
						<Text className="text-gray-500 font-semibold">
							Solde Caisse Noire
						</Text>
						<Text className="text-xl font-bold mt-1 text-orange-600">
							{budget}
						</Text>
					</View>
				</View>

				{/* Quick Actions */}
				<Text className="mt-8 mb-3 text-gray-700 font-semibold">
					Actions Rapides
				</Text>
				<View className="flex gap-y-2">
					<View className="bg-white p-4 rounded-2xl shadow-sm">
						<Pressable onPress={() => router.push("/(tabs)/complaints")}>
							<Text className="text-blue-600 font-semibold">
								+ Ajouter Une Plainte
							</Text>
							<Text className="text-gray-500 mt-1">
								Rapporter un nouveau probleme dans la residence
							</Text>
						</Pressable>
						{/* ➕ Floating button */}
						{user && profile?.approved && (
							<AddComplaintModal
								user={user}
								profile={profile}
							/>
						)}
					</View>
					<CotisationBtn />
					<BudgetModal />
				</View>

				{/* Notifications */}
				<View className="mt-auto mb-4 ">
					<Text className="mt-8 mb-3 text-green-500 font-semibold">
						Notifications Importantes
					</Text>
					<View className="flex flex-row gap-x-2">
						<View className="bg-red-400 p-4 rounded-2xl shadow-sm">
							<Text className="text-white mt-1 font-semibold text-xl">
								Problem du Cable Assenceurs Droite{"\n"}
								04 Personnes Max SVP
							</Text>
						</View>
						<View className="bg-green-400 p-4 rounded-2xl shadow-sm">
							<Text className="text-white mt-1 font-semibold text-xl">
								Lumiere exterieur reparee
							</Text>
						</View>
					</View>
				</View>
				{/* ➕ Floating button */}
			</ScrollView>
		</Screen>
	);
}

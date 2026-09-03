import { db } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import {
	collection,
	onSnapshot,
	orderBy,
	query,
	where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Linking,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";

type Resident = {
	id: string;
	fullName: string;
	phone?: string;
	floor?: number;
	door?: number;
	approved?: boolean;
	role?: string;
};

export default function ResidentsPhoneModal() {
	const [visible, setVisible] = useState(false);
	const [residents, setResidents] = useState<Resident[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!visible) return;

		setLoading(true);

		const q = query(
			collection(db, "users"),
			where("approved", "==", true),
			orderBy("fullName", "asc"),
		);

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const data = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Resident[];

				setResidents(data);
				setLoading(false);
			},
			(error) => {
				console.log("RESIDENTS ERROR:", error);
				setLoading(false);
			},
		);

		return unsubscribe;
	}, [visible]);

	const callResident = async (phone?: string) => {
		if (!phone) {
			alert("Numéro de téléphone indisponible.");
			return;
		}

		try {
			await Linking.openURL(`tel:${phone}`);
		} catch (error) {
			console.log("CALL ERROR:", error);
			alert("Impossible d'ouvrir l'application téléphone.");
		}
	};

	return (
		<>
			{/* Main screen button */}
			<Pressable
				onPress={() => setVisible(true)}
				className="bg-green-600 rounded-2xl p-3 flex-row items-center justify-center w-[100%]"
			>
				<Ionicons
					name="people-outline"
					size={26}
					color="white"
				/>

				<Text className="text-white font-bold text-md ml-2">
					Annuaire des résidents
				</Text>
			</Pressable>

			{/* Modal */}
			<Modal
				visible={visible}
				transparent
				animationType="slide"
				onRequestClose={() => setVisible(false)}
			>
				<View className="flex-1 bg-black/40 justify-end">
					<View className="bg-white rounded-t-3xl max-h-[90%]">
						{/* Header */}
						<View className="flex-row items-center justify-between p-5 border-b border-gray-200">
							<View>
								<Text className="text-2xl font-bold text-gray-800">
									Résidents
								</Text>

								<Text className="text-gray-500 mt-1">
									Annuaire téléphonique
								</Text>
							</View>

							<Pressable
								onPress={() => setVisible(false)}
								className="bg-gray-100 rounded-full p-2"
							>
								<Ionicons
									name="close"
									size={25}
									color="#374151"
								/>
							</Pressable>
						</View>

						{/* Content */}
						{loading ? (
							<View className="py-10 items-center">
								<ActivityIndicator size="large" />
							</View>
						) : (
							<ScrollView
								className="px-4"
								contentContainerStyle={{
									paddingTop: 15,
									paddingBottom: 40,
								}}
								showsVerticalScrollIndicator={false}
							>
								{residents.length === 0 ? (
									<View className="py-10 items-center">
										<Ionicons
											name="people-outline"
											size={45}
											color="#9ca3af"
										/>

										<Text className="text-gray-500 mt-3">
											Aucun résident trouvé.
										</Text>
									</View>
								) : (
									residents.map((resident) => (
										<View
											key={resident.id}
											className="bg-gray-100 rounded-2xl p-4 mb-3"
										>
											<View className="flex-row items-center">
												{/* Avatar */}
												<View className="bg-blue-500 rounded-full w-12 h-12 items-center justify-center">
													<Ionicons
														name="person"
														size={24}
														color="white"
													/>
												</View>

												{/* Information */}
												<View className="flex-1 ml-3">
													<Text className="font-bold text-lg text-gray-800">
														{resident.fullName}
													</Text>

													<Text className="text-gray-500 mt-1">
														Étage {resident.floor} • Porte {resident.door}
													</Text>

													<Text className="text-blue-600 font-semibold mt-1">
														{resident.phone || "Numéro indisponible"}
													</Text>
												</View>

												{/* Call */}
												<Pressable
													disabled={!resident.phone}
													onPress={() => callResident(resident.phone)}
													className={`rounded-full w-12 h-12 items-center justify-center ${
														resident.phone ? "bg-green-500" : "bg-gray-300"
													}`}
												>
													<Ionicons
														name="call"
														size={23}
														color="white"
													/>
												</Pressable>
											</View>
										</View>
									))
								)}
							</ScrollView>
						)}
					</View>
				</View>
			</Modal>
		</>
	);
}

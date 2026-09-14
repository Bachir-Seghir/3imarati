import { db } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import {
	collection,
	onSnapshot,
	orderBy,
	query,
	where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Linking,
	Modal,
	Pressable,
	ScrollView,
	Text,
	TextInput,
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

	// Filters
	const [searchName, setSearchName] = useState("");
	const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

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

	// Get available floors
	const floors = useMemo(() => {
		return [
			...new Set(
				residents
					.map((resident) => resident.floor)
					.filter((floor): floor is number => floor !== undefined),
			),
		].sort((a, b) => a - b);
	}, [residents]);
	// Filter residents
	const filteredResidents = useMemo(() => {
		const search = searchName.trim().toLowerCase();
		return residents.filter((resident) => {
			const matchesName =
				!search || resident.fullName?.toLowerCase().includes(search);
			const matchesFloor =
				selectedFloor === null || resident.floor === selectedFloor;
			return matchesName && matchesFloor;
		});
	}, [residents, searchName, selectedFloor]);

	const resetFilters = () => {
		setSearchName("");
		setSelectedFloor(null);
	};

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
				className="bg-green-600 rounded-md p-3 flex-row items-center justify-center"
			>
				<Ionicons
					name="call-outline"
					size={26}
					color="white"
				/>

				<Text className="text-white font-bold text-md ml-2">
					Annuaire Télephonique
				</Text>
			</Pressable>

			{/* Modal */}
			<Modal
				visible={visible}
				transparent
				animationType="slide"
				onRequestClose={() => setVisible(false)}
			>
				<View className="flex-1 bg-white pt-14">
					<View className="bg-white flex-1">
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
						{/* Filters */}
						{!loading && residents.length > 0 && (
							<View className="px-4">
								{/* Search by name */}
								<View className="flex-row items-center bg-gray-100 rounded-xl px-3 h-12">
									<Ionicons
										name="search-outline"
										size={21}
										color="#6b7280"
									/>
									<TextInput
										value={searchName}
										onChangeText={setSearchName}
										placeholder="Rechercher par nom..."
										placeholderTextColor="#9ca3af"
										className="flex-1 ml-2 text-gray-800"
										autoCapitalize="none"
									/>
									{searchName.length > 0 && (
										<Pressable onPress={() => setSearchName("")}>
											<Ionicons
												name="close-circle"
												size={20}
												color="#9ca3af"
											/>
										</Pressable>
									)}
								</View>
								{/* Floor filter */}
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									className="mt-3"
									contentContainerStyle={{ gap: 8 }}
								>
									{/* All floors */}
									<Pressable
										onPress={() => setSelectedFloor(null)}
										className={`px-4 py-2.5 rounded-full ${selectedFloor === null ? "bg-blue-500" : "bg-gray-100"}`}
									>
										<Text
											className={`font-semibold ${selectedFloor === null ? "text-white" : "text-gray-700"}`}
										>
											Tous
										</Text>
									</Pressable>
									{floors.map((floor) => (
										<Pressable
											key={floor}
											onPress={() => setSelectedFloor(floor)}
											className={`px-4 py-2.5 rounded-full ${selectedFloor === floor ? "bg-blue-500" : "bg-gray-100"}`}
										>
											<Text
												className={`font-semibold ${selectedFloor === floor ? "text-white" : "text-gray-700"}`}
											>
												Étage {floor}
											</Text>
										</Pressable>
									))}
								</ScrollView>
								{/* Result count + reset */}
								<View className="flex-row items-center justify-between mt-3 mb-1">
									<Text className="text-gray-500">
										{filteredResidents.length} résident
										{filteredResidents.length !== 1 ? "s" : ""}
									</Text>
									{(searchName || selectedFloor !== null) && (
										<Pressable onPress={resetFilters}>
											<Text className="text-blue-600 font-semibold">
												Réinitialiser
											</Text>
										</Pressable>
									)}
								</View>
							</View>
						)}
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

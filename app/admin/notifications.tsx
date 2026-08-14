import Screen from "@/src/components/Screen";
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
import { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

type SortOrder = "desc" | "asc";
type ActiveFilter = "all" | "active" | "inactive";

export default function NotificationsManager() {
	const [notifications, setNotifications] = useState<any[]>([]);

	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
	const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

	useEffect(() => {
		const q = query(
			collection(db, "notifications"),
			orderBy("createdAt", "desc"),
		);

		const unsubscribe = onSnapshot(q, (snap) => {
			const data = snap.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			setNotifications(data);
		});

		return () => unsubscribe();
	}, []);

	const hideNotification = async (notification: any) => {
		await updateDoc(doc(db, "notifications", notification.id), {
			active: false,
			updatedAt: serverTimestamp(),
		});
	};

	const showNotification = async (notification: any) => {
		await updateDoc(doc(db, "notifications", notification.id), {
			active: true,
			updatedAt: serverTimestamp(),
		});
	};

	/**
	 * Filter + sort notifications
	 */
	const filteredNotifications = useMemo(() => {
		let result = [...notifications];

		// Filter active / inactive
		if (activeFilter === "active") {
			result = result.filter((item) => item.active === true);
		}

		if (activeFilter === "inactive") {
			result = result.filter((item) => item.active === false);
		}

		// Sort by createdAt
		result.sort((a, b) => {
			const dateA = a.createdAt?.toMillis?.() ?? 0;
			const dateB = b.createdAt?.toMillis?.() ?? 0;

			if (sortOrder === "desc") {
				return dateB - dateA;
			}

			return dateA - dateB;
		});

		return result;
	}, [notifications, activeFilter, sortOrder]);

	return (
		<Screen>
			<ScrollView
				className="flex-1 px-4"
				contentContainerStyle={{
					paddingBottom: Platform.OS === "ios" ? 60 : 100,
					gap: 20,
				}}
			>
				<Text className="text-2xl font-bold mx-auto">Notifications</Text>

				{/* ========================= */}
				{/* FILTERS */}
				{/* ========================= */}

				<View className="bg-white rounded-2xl p-4 border border-slate-200">
					{/* Sort */}
					<Text className="font-semibold text-gray-700 mb-2">
						Trier par date
					</Text>

					<View className="flex-row gap-2 mb-4">
						<Pressable
							onPress={() => setSortOrder("desc")}
							className={`flex-row items-center px-4 py-2 rounded-lg ${
								sortOrder === "desc" ? "bg-blue-600" : "bg-gray-200"
							}`}
						>
							<Ionicons
								name="arrow-down"
								size={16}
								color={sortOrder === "desc" ? "white" : "#374151"}
							/>

							<Text
								className={`ml-2 font-semibold ${
									sortOrder === "desc" ? "text-white" : "text-gray-700"
								}`}
							>
								Plus récent
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setSortOrder("asc")}
							className={`flex-row items-center px-4 py-2 rounded-lg ${
								sortOrder === "asc" ? "bg-blue-600" : "bg-gray-200"
							}`}
						>
							<Ionicons
								name="arrow-up"
								size={16}
								color={sortOrder === "asc" ? "white" : "#374151"}
							/>

							<Text
								className={`ml-2 font-semibold ${
									sortOrder === "asc" ? "text-white" : "text-gray-700"
								}`}
							>
								Plus ancien
							</Text>
						</Pressable>
					</View>

					{/* Active filter */}
					<Text className="font-semibold text-gray-700 mb-2">État</Text>

					<View className="flex-row flex-wrap gap-2">
						<Pressable
							onPress={() => setActiveFilter("all")}
							className={`px-4 py-2 rounded-lg ${
								activeFilter === "all" ? "bg-gray-700" : "bg-gray-200"
							}`}
						>
							<Text
								className={`font-semibold ${
									activeFilter === "all" ? "text-white" : "text-gray-700"
								}`}
							>
								Toutes
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setActiveFilter("active")}
							className={`flex-row items-center px-4 py-2 rounded-lg ${
								activeFilter === "active" ? "bg-green-600" : "bg-gray-200"
							}`}
						>
							<Ionicons
								name="eye-outline"
								size={16}
								color={activeFilter === "active" ? "white" : "#374151"}
							/>

							<Text
								className={`ml-2 font-semibold ${
									activeFilter === "active" ? "text-white" : "text-gray-700"
								}`}
							>
								Actives
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setActiveFilter("inactive")}
							className={`flex-row items-center px-4 py-2 rounded-lg ${
								activeFilter === "inactive" ? "bg-red-600" : "bg-gray-200"
							}`}
						>
							<Ionicons
								name="eye-off-outline"
								size={16}
								color={activeFilter === "inactive" ? "white" : "#374151"}
							/>

							<Text
								className={`ml-2 font-semibold ${
									activeFilter === "inactive" ? "text-white" : "text-gray-700"
								}`}
							>
								Inactives
							</Text>
						</Pressable>
					</View>

					{/* Result count */}
					<Text className="text-gray-500 mt-4">
						{filteredNotifications.length} notification
						{filteredNotifications.length > 1 ? "s" : ""}
					</Text>
				</View>

				{/* ========================= */}
				{/* NOTIFICATIONS */}
				{/* ========================= */}

				{filteredNotifications.map((item) => {
					const important = item.category === "Importante";

					return (
						<View key={item.id}>
							<View
								className={`rounded-2xl p-5 ${
									important ? "bg-red-500" : "bg-blue-500"
								} ${!item.active ? "opacity-35" : ""}`}
							>
								<View className="flex-row items-center">
									<Ionicons
										name={important ? "alert-circle" : "information-circle"}
										size={22}
										color="white"
									/>

									<Text className="text-white font-bold text-lg ml-2">
										{item.category}
									</Text>

									<Text
										className="text-white font-bold text-lg ml-auto"
										numberOfLines={1}
									>
										Par : {item.createdByName}
									</Text>
								</View>

								<Text
									className="text-white font-bold text-xl mt-3"
									numberOfLines={2}
								>
									{item.title}
								</Text>

								{/* Actions */}
								<View className="flex-row justify-between">
									<Text
										className="text-white font-bold text-base mt-3"
										numberOfLines={2}
									>
										{item.createdAt?.toDate?.()?.toLocaleDateString()}
									</Text>
									{item.active ? (
										<Pressable
											onPress={() => hideNotification(item)}
											className="bg-white/20 p-2 rounded-lg"
										>
											<Ionicons
												name="eye-off-outline"
												size={22}
												color="white"
											/>
										</Pressable>
									) : (
										<Pressable
											onPress={() => showNotification(item)}
											className="bg-white/20 p-2 rounded-lg"
										>
											<Ionicons
												name="eye-outline"
												size={22}
												color="white"
											/>
										</Pressable>
									)}
								</View>
							</View>
						</View>
					);
				})}

				{filteredNotifications.length === 0 && (
					<View className="items-center py-10">
						<Ionicons
							name="notifications-off-outline"
							size={50}
							color="#9ca3af"
						/>

						<Text className="text-gray-500 mt-3">Aucune notification</Text>
					</View>
				)}
			</ScrollView>
		</Screen>
	);
}

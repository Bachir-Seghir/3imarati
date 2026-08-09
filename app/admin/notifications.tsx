import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
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

export default function NotificationsManager() {
	const { user, profile } = useAuth();

	const [notifications, setNotifications] = useState<any[]>([]);

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
	return (
		<Screen>
			<ScrollView
				className="flex-1 px-4 pt-10"
				contentContainerStyle={{
					paddingBottom: Platform.OS === "ios" ? 60 : 100,
					gap: 20,
				}}
			>
				<Text className="text-2xl font-bold">Notifications</Text>

				{notifications.map((item) => {
					const important = item.category === "Importante";
					return (
						<Pressable key={item.id}>
							<View
								className={`rounded-2xl p-5 ${
									important ? "bg-red-500" : "bg-blue-500"
								} ${!item.active ? "opacity-25" : ""}`}
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
									<Text className="text-white font-bold text-lg ml-auto">
										Par : {item.createdByName}
									</Text>
									<Pressable
										onPress={() => hideNotification(item)}
										className="ml-3"
									>
										<Ionicons
											name="trash-outline"
											size={22}
											color="white"
										/>
									</Pressable>
									<Pressable
										onPress={() => showNotification(item)}
										className="ml-3"
									>
										<Ionicons
											name="eye-outline"
											size={22}
											color="white"
										/>
									</Pressable>
								</View>

								<Text
									className="text-white font-bold text-xl mt-3"
									numberOfLines={2}
								>
									{item.title}
								</Text>
								<Text
									className="text-white font-bold text-base mt-3 ml-auto"
									numberOfLines={2}
								>
									{item.createdAt?.toDate()?.toLocaleDateString()}
								</Text>
							</View>
						</Pressable>
					);
				})}
			</ScrollView>
		</Screen>
	);
}

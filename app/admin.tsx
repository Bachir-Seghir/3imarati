import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { updateUserProfile } from "@/src/features/auth/services/user.service";
import { createMonthlyPayment } from "@/src/features/payments/services/payment.service";
import { db } from "@/src/services/firebase";
import { UserProfile } from "@/src/types/user";
import { Redirect } from "expo-router";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";
type UserItem = UserProfile & { id: string };

export default function AdminScreen() {
	const { profile } = useAuth();
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"users" | "budget">("users");
	if (profile?.role !== "admin") {
		return <Redirect href="/(tabs)" />;
	}

	const [users, setUsers] = useState<UserItem[]>([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const q = query(collection(db, "users"));

		const unsubUsers = onSnapshot(q, (snapshot) => {
			const list: UserItem[] = snapshot.docs.map((doc) => ({
				id: doc.id,
				...(doc.data() as UserProfile),
			}));
			setUsers(list);
			setLoading(false);
		});

		return () => {
			unsubUsers();
		};
	}, []);

	const handleApproveUser = async (uid: string) => {
		try {
			await updateUserProfile(uid, {
				approved: true,
			});
		} catch (e) {
			console.log("APPROVE USER ERROR", e);
		}
	};
	if (loading) {
		return (
			<View className="flex-1 justify-center items-center">
				<ActivityIndicator />
			</View>
		);
	}
	const generateMonthlyPayments = async () => {
		const usersSnap = await getDocs(collection(db, "users"));

		for (const userDoc of usersSnap.docs) {
			const user = userDoc.data();

			if (user.approved) {
				await createMonthlyPayment(userDoc.id);
			}
		}

		alert("Paiments Mensuels generés ✔");
	};

	return (
		<Screen>
			<ScrollView className="p-4">
				<Text className="text-2xl font-bold text-gray-800 mb-4">
					{profile?.role === "admin" ? "Administrateur" : "Manageur du Budget"}
				</Text>
				<View className="flex-row mb-4 border border-white rounded-md">
					<Pressable
						onPress={() => setActiveTab("users")}
						className={`flex-1 p-3 rounded-l-md ${activeTab === "users" && "bg-blue-500"}`}
					>
						<Text
							className={`text-center  font-semibold ${activeTab === "users" && "text-white"}`}
						>
							{" "}
							Utilisateurs
						</Text>
					</Pressable>
					<Pressable
						onPress={() => setActiveTab("budget")}
						className={`flex-1 p-3 rounded-r-md  ${activeTab === "budget" && "bg-blue-500"}`}
					>
						<Text
							className={`text-center font-semibold ${activeTab === "budget" && "text-white"}`}
						>
							Budget
						</Text>
					</Pressable>
				</View>
				<Pressable
					onPress={generateMonthlyPayments}
					className="rounded-md bg-blue-500 py-3 px-4 mb-3"
				>
					<Text className="text-xl font-bold text-white text-center">
						Generer les Paiments mensuels
					</Text>
				</Pressable>
				<Text className="text-xl font-bold mb-4">
					Pending Users ({users.length})
				</Text>

				{users.map((user: UserItem) => {
					return (
						<View
							key={user.id}
							className="bg-white p-4 rounded-md mb-4 shadow"
						>
							<Text className="font-bold text-lg">{user.fullName}</Text>
							<Text>{user.email}</Text>
							<Text>
								Floor: {user.floor} | Door: {user.door}
							</Text>
							{user.identityImage && (
								<Pressable
									className="pt-3"
									onPress={() => setSelectedImage(user.identityImage)}
								>
									<View className="relative">
										<Image
											source={{ uri: user.identityImage }}
											className="w-full h-48 rounded-xl"
											resizeMode="cover"
										/>

										{/* 🔹 Overlay */}
										<View className="absolute inset-0 bg-black/40 rounded-xl items-center justify-center">
											<Text className="text-white font-semibold text-lg">
												Appuyer pour Voire
											</Text>
											<Text className="text-white font-semibold text-lg">
												Piece d'identité
											</Text>
										</View>
									</View>
								</Pressable>
							)}

							{/* 🟢 APPROVAL */}
							{!user.approved && (
								<Pressable
									onPress={() => handleApproveUser(user.id)}
									className="bg-green-600 p-2 mt-3 rounded"
								>
									<Text className="text-white text-center">Approve User</Text>
								</Pressable>
							)}
						</View>
					);
				})}
				{/* This modal show identity card on full mode */}
				<Modal
					visible={!!selectedImage}
					transparent={true}
					animationType="fade"
				>
					<View className="flex-1 bg-black justify-center items-center">
						{/* ❌ Close button */}
						<Pressable
							onPress={() => setSelectedImage(null)}
							className="absolute top-12 right-6 z-10"
						>
							<Text className="text-white text-3xl font-bold">✕</Text>
						</Pressable>

						{/* 🖼 Full image */}
						{selectedImage && (
							<Image
								source={{ uri: selectedImage }}
								style={{ width: "100%", height: "80%" }}
								resizeMode="contain"
							/>
						)}
					</View>
				</Modal>
			</ScrollView>
		</Screen>
	);
}

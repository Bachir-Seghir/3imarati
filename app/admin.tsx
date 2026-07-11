import { BudgetSection } from "@/src/components/BudgetSection";
import Screen from "@/src/components/Screen";
import { UsersList } from "@/src/components/UsersList";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { createMonthlyPayment } from "@/src/features/payments/services/payment.service";
import { db } from "@/src/services/firebase";
import { Redirect, router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function AdminScreen() {
	const { profile } = useAuth();

	const [activeTab, setActiveTab] = useState<"users" | "budget">("users");
	if (profile?.role !== "admin") {
		return <Redirect href="/(tabs)" />;
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

				<Pressable
					onPress={generateMonthlyPayments}
					className="rounded-md bg-blue-500 py-3 px-4 mb-3"
				>
					<Text className="text-xl font-bold text-white text-center">
						Generer les Paiments mensuels
					</Text>
				</Pressable>
				<Pressable
					onPress={() => router.push("/(tabs)/payments")}
					className="rounded-md bg-orange-500 py-3 px-4 mb-3"
				>
					<Text className="text-xl font-bold text-white text-center">
						Passer au page des payments
					</Text>
				</Pressable>

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
				{activeTab === "users" ? <UsersList /> : <BudgetSection />}
			</ScrollView>
		</Screen>
	);
}

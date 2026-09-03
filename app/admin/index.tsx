import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { AddNotificationModal } from "@/src/features/notifications/components/AddNotificationModal";
import AdvancePaymentModal from "@/src/features/payments/components/AdvancePaymentModal";
import { createMonthlyPayment } from "@/src/features/payments/services/payment.service";
import {
	getPaymentSettings,
	updateMonthlyAmount,
} from "@/src/features/payments/services/paymentsSettings.service";
import { db } from "@/src/services/firebase";
import { getDashboardTitle, hasAnyRole } from "@/src/utils/RolesCheck";
import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function AdminScreen() {
	const { profile, user } = useAuth();
	const [monthlyAmount, setMonthlyAmount] = useState("");
	const [savingAmount, setSavingAmount] = useState(false);
	const [advancePaymentVisible, setAdvancePaymentVisible] = useState(false);
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
	useEffect(() => {
		const loadPaymentSettings = async () => {
			const settings = await getPaymentSettings();

			setMonthlyAmount(settings.monthlyAmount.toString());
		};

		loadPaymentSettings();
	}, []);
	const handleSaveMonthlyAmount = async () => {
		const amount = Number(monthlyAmount);

		if (!amount || amount <= 0) {
			alert("Veuillez saisir un montant valide.");
			return;
		}

		try {
			setSavingAmount(true);

			await updateMonthlyAmount(amount, user?.uid);

			alert("Montant mensuel mis à jour ✔");
		} catch (error) {
			console.error(error);
			alert("Erreur lors de la mise à jour du montant.");
		} finally {
			setSavingAmount(false);
		}
	};
	return (
		<Screen>
			<ScrollView
				className="flex-1 px-4"
				contentContainerStyle={{
					paddingBottom: 180,
				}}
			>
				<Text className="text-2xl text-center font-bold text-gray-800 mb-8">
					{getDashboardTitle(profile)}
				</Text>

				<View className="flex-row flex-wrap gap-2">
					<View className="w-full flex-row justify-start items-center gap-x-2 mb-4">
						<Text className="text-lg font-bold text-gray-800">
							Mensualité en DA
						</Text>

						<TextInput
							value={monthlyAmount}
							onChangeText={setMonthlyAmount}
							keyboardType="numeric"
							placeholder="Montant"
							className="w-[70px] border border-gray-300 bg-white rounded-lg p-3 font-semibold"
						/>

						<Pressable
							onPress={handleSaveMonthlyAmount}
							disabled={savingAmount}
							className="bg-teal-700 rounded-md p-3 ml-auto"
						>
							<Text className="text-white text-center font-bold">
								{savingAmount ? "Enregistrement..." : "Enregistrer"}
							</Text>
						</Pressable>
					</View>

					<Pressable
						onPress={() => router.push("/admin/notifications")}
						className="w-[48%] rounded-md bg-teal-700 py-3 px-4 mb-3"
					>
						<Text className="text-lg font-bold text-white text-center">
							Gérer les Notifications
						</Text>
					</Pressable>

					<Pressable
						onPress={() => router.push("/admin/users")}
						className="w-[48%] rounded-md bg-teal-700 py-3 px-4 mb-3"
					>
						<Text className="text-lg font-bold text-white text-center">
							Gérer les Utilisateurs
						</Text>
					</Pressable>

					{hasAnyRole(profile, ["superAdmin"]) && (
						<Pressable
							onPress={() => router.push("/admin/roles")}
							className="w-[48%] rounded-md bg-teal-700 py-3 px-4 mb-3"
						>
							<Text className="text-lg font-bold text-white text-center">
								Gérer les rôles
							</Text>
						</Pressable>
					)}
					<AddNotificationModal />

					<AdvancePaymentModal
						visible={advancePaymentVisible}
						onClose={() => setAdvancePaymentVisible(false)}
					/>
					{hasAnyRole(profile, ["superAdmin", "budgetManager"]) && (
						<>
							<Text className="text-2xl font-bold text-black text-center mt-6 mb-2">
								Gestion du Budget / Caisse
							</Text>
							<Pressable
								onPress={() => router.push("/admin/budget")}
								className="w-[48%] rounded-md bg-green-600 py-3 px-4 mb-3"
							>
								<Text className="text-lg font-bold text-white text-center">
									Passer au page du Budget
								</Text>
							</Pressable>
							<Pressable
								onPress={() => router.push("/(tabs)/payments")}
								className="w-[48%] rounded-md bg-green-600 py-3 px-4 mb-3"
							>
								<Text className="text-lg font-bold text-white text-center">
									Passer au page des payments
								</Text>
							</Pressable>
							<Pressable
								onPress={() => setAdvancePaymentVisible(true)}
								className="w-[48%] rounded-md bg-green-600 py-3 px-4 mb-3"
							>
								<Text className="text-lg font-bold text-white text-center">
									Paiement anticipé
								</Text>
							</Pressable>
							<Pressable
								onPress={generateMonthlyPayments}
								className="w-[48%] rounded-md bg-green-600 py-3 px-4 mb-3"
							>
								<Text className="text-lg font-bold text-white text-center">
									Déclancher les Paiments mensuels
								</Text>
							</Pressable>
						</>
					)}
				</View>
			</ScrollView>
		</Screen>
	);
}

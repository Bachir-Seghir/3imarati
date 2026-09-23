import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { AddNotificationModal } from "@/src/features/notifications/components/AddNotificationModal";
import AdvancePaymentModal from "@/src/features/payments/components/AdvancePaymentModal";
import { createMonthlyPayments } from "@/src/features/payments/services/payment.service";
import {
	getPaymentSettings,
	updatePaymentSettings,
} from "@/src/features/payments/services/paymentsSettings.service";
import { db } from "@/src/services/firebase";
import { getDashboardTitle, hasAnyRole } from "@/src/utils/RolesCheck";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

export default function AdminScreen() {
	const { profile, user } = useAuth();
	const [monthlyAmount, setMonthlyAmount] = useState("");
	const [paymentStartMonth, setPaymentStartMonth] = useState("");
	const [savingSettings, setSavingSettings] = useState(false);
	const [advancePaymentVisible, setAdvancePaymentVisible] = useState(false);
	const [generatingPayments, setGeneratingPayments] = useState(false);
	const generateMonthlyPayments = async () => {
		try {
			setGeneratingPayments(true);

			const usersSnap = await getDocs(collection(db, "users"));

			for (const userDoc of usersSnap.docs) {
				const user = userDoc.data();

				if (user.approved) {
					await createMonthlyPayments(userDoc.id);
				}
			}

			alert("Paiements mensuels générés ✔");
		} catch (error) {
			console.error(error);

			alert("Erreur lors de la génération des paiements.");
		} finally {
			setGeneratingPayments(false);
		}
	};
	useEffect(() => {
		const loadPaymentSettings = async () => {
			try {
				const settings = await getPaymentSettings();

				setMonthlyAmount(settings.monthlyAmount.toString());
				setPaymentStartMonth(settings.paymentStartMonth);
			} catch (error) {
				console.error("Erreur lors du chargement des paramètres:", error);
			}
		};

		loadPaymentSettings();
	}, []);
	const handleSavePaymentSettings = async () => {
		const amount = Number(monthlyAmount);

		if (!amount || amount <= 0) {
			alert("Veuillez saisir un montant valide.");
			return;
		}

		if (!paymentStartMonth) {
			alert("Veuillez sélectionner le mois de début des paiements.");
			return;
		}

		try {
			setSavingSettings(true);

			await updatePaymentSettings(
				{
					monthlyAmount: amount,
					paymentStartMonth,
				},
				user?.uid,
			);

			alert("Paramètres des paiements mis à jour ✔");
		} catch (error) {
			console.error(error);
			alert("Erreur lors de la mise à jour des paramètres.");
		} finally {
			setSavingSettings(false);
		}
	};
	const now = new Date();

	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth() + 1;

	const monthNames = [
		"Janvier",
		"Février",
		"Mars",
		"Avril",
		"Mai",
		"Juin",
		"Juillet",
		"Août",
		"Septembre",
		"Octobre",
		"Novembre",
		"Décembre",
	];

	const availableMonths: {
		label: string;
		value: string;
	}[] = [];

	for (let year = currentYear - 1; year <= currentYear; year++) {
		const lastMonth = year === currentYear ? currentMonth : 12;

		for (let month = 1; month <= lastMonth; month++) {
			const monthValue = String(month).padStart(2, "0");

			availableMonths.push({
				label: `${monthNames[month - 1]} ${year}`,
				value: `${year}-${monthValue}`,
			});
		}
	}
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
					<View className="w-full bg-white rounded-xl p-4 mb-4">
						<Text className="text-lg font-bold text-gray-800 mb-4">
							Paramètres des paiements
						</Text>

						{/* Monthly Amount */}
						<View className="flex-row items-center mb-4">
							<Text className="text-base font-semibold text-gray-700 flex-1">
								Mensualité en DA
							</Text>

							<TextInput
								value={monthlyAmount}
								onChangeText={setMonthlyAmount}
								keyboardType="numeric"
								placeholder="Montant"
								className="w-[90px] border border-gray-300 bg-white rounded-lg p-3 font-semibold"
							/>
						</View>

						{/* Payment Start Month */}
						<View className="mb-4">
							<Text className="text-base font-semibold text-gray-700 mb-2">
								Mois de début des paiements
							</Text>

							<View className="border border-gray-300 rounded-lg overflow-hidden">
								<Picker
									selectedValue={paymentStartMonth}
									onValueChange={(value) => setPaymentStartMonth(value)}
								>
									<Picker.Item
										label="Sélectionner un mois"
										value=""
									/>

									{availableMonths.map((month) => (
										<Picker.Item
											key={month.value}
											label={month.label}
											value={month.value}
										/>
									))}
								</Picker>
							</View>
						</View>

						{/* Save */}
						<Pressable
							onPress={handleSavePaymentSettings}
							disabled={savingSettings}
							className="bg-teal-700 rounded-md p-3"
						>
							<Text className="text-white text-center font-bold">
								{savingSettings
									? "Enregistrement..."
									: "Enregistrer les paramètres"}
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
					<AddNotificationModal />
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
								className="w-[48%] justify-center rounded-md bg-green-600 py-3 px-4 mb-3"
							>
								<Text className="text-lg font-bold text-white text-center">
									Paiement anticipé
								</Text>
							</Pressable>
							<Pressable
								onPress={generateMonthlyPayments}
								disabled={generatingPayments}
								className={`w-[48%] rounded-md py-3 px-4 mb-3 ${
									generatingPayments ? "bg-gray-400" : "bg-yellow-400"
								}`}
							>
								{generatingPayments ? (
									<View className="flex-row items-center justify-center">
										<ActivityIndicator
											size="small"
											color="white"
										/>

										<Text className="text-lg font-bold text-white ml-2">
											Génération en cours...
										</Text>
									</View>
								) : (
									<Text className="text-lg font-bold text-green-800 text-center">
										Déclencher les paiements mensuelss
									</Text>
								)}
							</Pressable>
						</>
					)}
				</View>
			</ScrollView>
		</Screen>
	);
}

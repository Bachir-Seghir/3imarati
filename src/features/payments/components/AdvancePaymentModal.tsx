import { Ionicons } from "@expo/vector-icons";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";

import { db } from "@/src/services/firebase";

import { createAdvancePayment } from "../services/payment.service";
import { getPaymentSettings } from "../services/paymentsSettings.service";

type Resident = {
	id: string;
	fullName: string;
	floor: number;
	door: number;
	phone?: string;
};

type Props = {
	visible: boolean;
	onClose: () => void;
	onSuccess?: () => void;
};

const getMonthString = (date: Date) => {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
		2,
		"0",
	)}`;
};

const addMonths = (date: Date, months: number) => {
	const result = new Date(date);
	result.setMonth(result.getMonth() + months);
	return result;
};

const formatMonth = (date: Date) => {
	return date.toLocaleDateString("fr-FR", {
		month: "long",
		year: "numeric",
	});
};

export default function AdvancePaymentModal({
	visible,
	onClose,
	onSuccess,
}: Props) {
	const [residents, setResidents] = useState<Resident[]>([]);
	const [selectedResident, setSelectedResident] = useState<Resident | null>(
		null,
	);

	const [showResidents, setShowResidents] = useState(false);

	const [numberOfMonths, setNumberOfMonths] = useState(1);
	const [monthlyAmount, setMonthlyAmount] = useState(0);

	const [loading, setLoading] = useState(false);
	const [loadingData, setLoadingData] = useState(false);

	// ==================================================
	// LOAD DATA
	// ==================================================

	useEffect(() => {
		if (!visible) return;

		const loadData = async () => {
			try {
				setLoadingData(true);

				// -----------------------------
				// Load payment settings
				// -----------------------------

				const settings = await getPaymentSettings();

				setMonthlyAmount(settings.monthlyAmount);

				// -----------------------------
				// Load residents
				// -----------------------------

				const snap = await getDocs(collection(db, "users"));

				const data = snap.docs
					.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}))
					.filter((user: any) => user.approved === true) as Resident[];

				setResidents(data);
			} catch (error) {
				console.log("LOAD ADVANCE PAYMENT DATA ERROR:", error);

				alert("Impossible de charger les données.");
			} finally {
				setLoadingData(false);
			}
		};

		loadData();
	}, [visible]);

	// ==================================================
	// RESET WHEN CLOSE
	// ==================================================

	useEffect(() => {
		if (!visible) {
			setSelectedResident(null);
			setShowResidents(false);
			setNumberOfMonths(1);
		}
	}, [visible]);

	// ==================================================
	// TOTAL
	// ==================================================

	const totalAmount = monthlyAmount * numberOfMonths;

	// ==================================================
	// MONTHS
	// ==================================================

	const months = Array.from({ length: numberOfMonths }, (_, index) => {
		return addMonths(new Date(), index);
	});

	// ==================================================
	// MONTH COUNTER
	// ==================================================

	const decreaseMonths = () => {
		setNumberOfMonths((prev) => Math.max(1, prev - 1));
	};

	const increaseMonths = () => {
		setNumberOfMonths((prev) => Math.min(24, prev + 1));
	};

	// ==================================================
	// SELECT RESIDENT
	// ==================================================

	const handleSelectResident = (resident: Resident) => {
		setSelectedResident(resident);
		setShowResidents(false);
	};

	// ==================================================
	// CONFIRM PAYMENT
	// ==================================================

	const handleConfirm = async () => {
		if (!selectedResident) {
			alert("Veuillez sélectionner un résident.");
			return;
		}

		if (numberOfMonths <= 0) {
			alert("Veuillez sélectionner au moins un mois.");
			return;
		}

		if (monthlyAmount <= 0) {
			alert("Le montant mensuel est invalide.");
			return;
		}

		try {
			setLoading(true);

			const result = await createAdvancePayment(
				selectedResident.id,
				numberOfMonths,
				monthlyAmount,
			);

			alert(
				`Paiement enregistré avec succès.\n\n` +
					`${result.processedMonths} mois traités\n` +
					`Total : ${result.totalAmount.toLocaleString("fr-FR")} DA`,
			);

			onSuccess?.();

			onClose();
		} catch (error) {
			console.log("ADVANCE PAYMENT ERROR:", error);

			alert("Une erreur est survenue lors du paiement.");
		} finally {
			setLoading(false);
		}
	};

	// ==================================================
	// MODAL
	// ==================================================

	if (!visible) return null;

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View className="flex-1 justify-end bg-black/50">
				<View className="bg-white rounded-t-3xl max-h-[92%]">
					<ScrollView
						className="p-6"
						showsVerticalScrollIndicator={false}
					>
						{/* ================================= */}
						{/* HEADER */}
						{/* ================================= */}

						<View className="flex-row justify-between items-center mb-6">
							<View>
								<Text className="text-2xl font-bold text-gray-800">
									Paiement anticipé
								</Text>

								<Text className="text-gray-500 mt-1">
									Paiement de plusieurs mois
								</Text>
							</View>

							<Pressable
								onPress={onClose}
								className="bg-gray-100 rounded-full p-2"
							>
								<Ionicons
									name="close"
									size={24}
									color="#374151"
								/>
							</Pressable>
						</View>

						{/* ================================= */}
						{/* RESIDENT SELECTOR */}
						{/* ================================= */}

						<Text className="font-bold text-gray-800 text-lg mb-3">
							Résident
						</Text>

						<Pressable
							onPress={() => setShowResidents((prev) => !prev)}
							className="border border-gray-300 rounded-2xl p-4 mb-3"
						>
							<View className="flex-row items-center justify-between">
								<View className="flex-1">
									<Text className="text-gray-500 text-sm">
										Résident sélectionné
									</Text>

									<Text className="text-lg font-bold text-gray-800 mt-1">
										{selectedResident
											? selectedResident.fullName
											: "Sélectionner un résident"}
									</Text>

									{selectedResident && (
										<Text className="text-gray-500 mt-1">
											Étage {selectedResident.floor} — Porte{" "}
											{selectedResident.door}
										</Text>
									)}
								</View>

								<Ionicons
									name={showResidents ? "chevron-up" : "chevron-down"}
									size={22}
									color="#374151"
								/>
							</View>
						</Pressable>

						{/* ================================= */}
						{/* RESIDENT LIST */}
						{/* ================================= */}

						{showResidents && (
							<View className="border border-gray-200 rounded-2xl mb-5 max-h-64">
								{loadingData ? (
									<View className="p-6">
										<ActivityIndicator />
									</View>
								) : (
									<ScrollView
										nestedScrollEnabled
										showsVerticalScrollIndicator={false}
									>
										{residents.length === 0 ? (
											<Text className="text-gray-500 text-center p-5">
												Aucun résident disponible.
											</Text>
										) : (
											residents.map((resident) => (
												<Pressable
													key={resident.id}
													onPress={() => handleSelectResident(resident)}
													className={`p-4 border-b border-gray-100 ${
														selectedResident?.id === resident.id
															? "bg-blue-50"
															: ""
													}`}
												>
													<View className="flex-row items-center">
														<View className="flex-1">
															<Text className="font-semibold text-gray-800 text-base">
																{resident.fullName}
															</Text>

															<Text className="text-gray-500 mt-1">
																Étage {resident.floor} — Porte {resident.door}
															</Text>

															{resident.phone && (
																<Text className="text-gray-500 mt-1">
																	{resident.phone}
																</Text>
															)}
														</View>

														{selectedResident?.id === resident.id && (
															<Ionicons
																name="checkmark-circle"
																size={24}
																color="#2563eb"
															/>
														)}
													</View>
												</Pressable>
											))
										)}
									</ScrollView>
								)}
							</View>
						)}

						{/* ================================= */}
						{/* MONTHLY AMOUNT */}
						{/* ================================= */}

						<View className="border border-gray-200 rounded-2xl p-4 mb-5">
							<Text className="text-gray-500">Montant mensuel</Text>

							{loadingData ? (
								<ActivityIndicator className="mt-2" />
							) : (
								<Text className="text-2xl font-bold text-blue-600 mt-1">
									{monthlyAmount.toLocaleString("fr-FR")} DA
								</Text>
							)}
						</View>

						{/* ================================= */}
						{/* NUMBER OF MONTHS */}
						{/* ================================= */}

						<Text className="font-bold text-gray-800 text-lg mb-3">
							Nombre de mois
						</Text>

						<View className="flex-row items-center justify-center mb-6">
							<Pressable
								onPress={decreaseMonths}
								disabled={numberOfMonths <= 1}
								className={`w-12 h-12 rounded-full items-center justify-center ${
									numberOfMonths <= 1 ? "bg-gray-200" : "bg-blue-600"
								}`}
							>
								<Ionicons
									name="remove"
									size={25}
									color={numberOfMonths <= 1 ? "#9ca3af" : "white"}
								/>
							</Pressable>

							<View className="mx-8 items-center">
								<Text className="text-4xl font-bold text-gray-800">
									{numberOfMonths}
								</Text>

								<Text className="text-gray-500">mois</Text>
							</View>

							<Pressable
								onPress={increaseMonths}
								disabled={numberOfMonths >= 24}
								className={`w-12 h-12 rounded-full items-center justify-center ${
									numberOfMonths >= 24 ? "bg-gray-200" : "bg-blue-600"
								}`}
							>
								<Ionicons
									name="add"
									size={25}
									color={numberOfMonths >= 24 ? "#9ca3af" : "white"}
								/>
							</Pressable>
						</View>

						{/* ================================= */}
						{/* TOTAL */}
						{/* ================================= */}

						<View className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
							<Text className="text-blue-700 font-semibold">Montant total</Text>

							<Text className="text-3xl font-bold text-blue-700 mt-1">
								{totalAmount.toLocaleString("fr-FR")} DA
							</Text>

							<Text className="text-blue-600 mt-1">
								{numberOfMonths} × {monthlyAmount.toLocaleString("fr-FR")} DA
							</Text>
						</View>

						{/* ================================= */}
						{/* ACTIONS */}
						{/* ================================= */}

						<View className="flex-row gap-3 pb-8">
							<Pressable
								onPress={onClose}
								disabled={loading}
								className="flex-1 bg-gray-200 rounded-xl p-4"
							>
								<Text className="text-gray-800 text-center font-bold">
									Annuler
								</Text>
							</Pressable>

							<Pressable
								onPress={handleConfirm}
								disabled={
									loading ||
									loadingData ||
									!selectedResident ||
									monthlyAmount <= 0
								}
								className={`flex-1 rounded-xl p-4 ${
									loading ||
									loadingData ||
									!selectedResident ||
									monthlyAmount <= 0
										? "bg-gray-400"
										: "bg-green-600"
								}`}
							>
								{loading ? (
									<ActivityIndicator color="white" />
								) : (
									<Text className="text-white text-center font-bold">
										Confirmer
									</Text>
								)}
							</Pressable>
						</View>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

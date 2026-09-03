import Screen from "@/src/components/Screen";

import { useAuth } from "@/src/features/auth/context/AuthContext";

import { CotisationList } from "@/src/features/payments/components/CotisationList";
import { MonthlyPaymentCalendar } from "@/src/features/payments/components/MonthlyPaymentCalendar";
import { MonthlyPaymentsList } from "@/src/features/payments/components/MonthlyPaymentList";

import { useCotisations } from "@/src/features/payments/hooks/useCotisations";
import { usePayments } from "@/src/features/payments/hooks/usePayments";

import {
	approveCotisation,
	rejectCotisation,
} from "@/src/features/payments/services/cotisation.service";

import { markPaymentAsPaid } from "@/src/features/payments/services/payment.service";
import { hasAnyRole } from "@/src/utils/RolesCheck";

import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function PaymentsScreen() {
	const { profile } = useAuth();

	const payments = usePayments();
	const cotisations = useCotisations();

	const currentDate = new Date();

	const currentYear = currentDate.getFullYear();

	const currentMonth = `${currentYear}-${String(
		currentDate.getMonth() + 1,
	).padStart(2, "0")}`;

	const [selectedYear, setSelectedYear] = useState(currentYear);
	const [selectedMonth, setSelectedMonth] = useState(currentMonth);

	const [activeTab, setActiveTab] = useState<"monthly" | "cotisations">(
		"monthly",
	);

	const canManage = hasAnyRole(profile, ["superAdmin", "budgetManager"]);

	// ======================================================
	// FILTER PAYMENTS BY SELECTED MONTH
	// ======================================================

	const selectedMonthPayments = payments.filter(
		(payment) => payment.month === selectedMonth,
	);

	// ======================================================
	// UNPAID
	// ======================================================

	const unpaidPayments = selectedMonthPayments.filter(
		(payment) => !payment.paid,
	);

	// ======================================================
	// PAID
	// ======================================================

	const paidPayments = selectedMonthPayments
		.filter((payment) => payment.paid)
		.sort((a, b) => {
			const aTime = a.createdAt?.toMillis?.() ?? 0;
			const bTime = b.createdAt?.toMillis?.() ?? 0;

			return bTime - aTime;
		});

	return (
		<Screen>
			<ScrollView
				className="flex-1 px-4 pt-10"
				contentContainerStyle={{
					paddingBottom: 120,
					gap: 20,
				}}
			>
				{/* ================================================= */}
				{/* TABS */}
				{/* ================================================= */}

				<View className="flex-row border border-white rounded-md">
					<Pressable
						onPress={() => setActiveTab("monthly")}
						className={`flex-1 p-3 rounded-l-md ${
							activeTab === "monthly" ? "bg-blue-500" : ""
						}`}
					>
						<Text
							className={`text-center font-semibold ${
								activeTab === "monthly" ? "text-white" : "text-gray-700"
							}`}
						>
							Mensualités
						</Text>
					</Pressable>

					<Pressable
						onPress={() => setActiveTab("cotisations")}
						className={`flex-1 p-3 rounded-r-md ${
							activeTab === "cotisations" ? "bg-blue-500" : ""
						}`}
					>
						<Text
							className={`text-center font-semibold ${
								activeTab === "cotisations" ? "text-white" : "text-gray-700"
							}`}
						>
							Cotisations
						</Text>
					</Pressable>
				</View>

				{/* ================================================= */}
				{/* MONTHLY PAYMENTS */}
				{/* ================================================= */}

				{activeTab === "monthly" ? (
					<>
						<MonthlyPaymentCalendar
							selectedMonth={selectedMonth}
							onSelectMonth={setSelectedMonth}
							selectedYear={selectedYear}
							onChangeYear={(year) => {
								setSelectedYear(year);

								// Automatically select January of the new year
								setSelectedMonth(`${year}-01`);
							}}
						/>

						{/* Selected month */}

						<View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
							<Text className="text-blue-700 font-bold text-lg">
								Mensualités : {selectedMonth}
							</Text>

							<Text className="text-gray-600 mt-1">
								{unpaidPayments.length} en attente • {paidPayments.length}{" "}
								payé(s)
							</Text>
						</View>

						{/* ================================================= */}
						{/* WAITING PAYMENTS */}
						{/* ================================================= */}

						{unpaidPayments.length > 0 && (
							<View>
								<Text className="text-xl font-bold text-orange-500 mb-3">
									En attente ({unpaidPayments.length})
								</Text>

								<MonthlyPaymentsList
									unpaid={unpaidPayments}
									paid={[]}
									canManage={canManage}
									onPay={markPaymentAsPaid}
								/>
							</View>
						)}

						{/* ================================================= */}
						{/* PAID PAYMENTS */}
						{/* ================================================= */}

						{paidPayments.length > 0 && (
							<View>
								<Text className="text-xl font-bold text-green-600 mb-3">
									Payées ({paidPayments.length})
								</Text>

								<MonthlyPaymentsList
									unpaid={[]}
									paid={paidPayments}
									canManage={canManage}
									onPay={markPaymentAsPaid}
								/>
							</View>
						)}

						{/* ================================================= */}
						{/* NO PAYMENTS */}
						{/* ================================================= */}

						{unpaidPayments.length === 0 && paidPayments.length === 0 && (
							<View className="bg-white rounded-2xl p-6 items-center">
								<Text className="text-gray-500 text-center">
									Aucune mensualité pour ce mois.
								</Text>
							</View>
						)}
					</>
				) : (
					<CotisationList
						cotisations={cotisations}
						canManage={canManage}
						onApprove={approveCotisation}
						onReject={rejectCotisation}
					/>
				)}
			</ScrollView>
		</Screen>
	);
}

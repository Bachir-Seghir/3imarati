import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { CotisationList } from "@/src/features/payments/components/CotisationList";
import { MonthlyPaymentsList } from "@/src/features/payments/components/MonthlyPaymentList";
import { useCotisations } from "@/src/features/payments/hooks/useCotisations";
import { usePayments } from "@/src/features/payments/hooks/usePayments";
import {
	approveCotisation,
	rejectCotisation,
} from "@/src/features/payments/services/cotisation.service";
import { markPaymentAsPaid } from "@/src/features/payments/services/payment.service";
import { useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

export default function PaymentsScreen() {
	const { profile } = useAuth();
	const payments = usePayments();
	const cotisations = useCotisations();

	const unpaidPayments = payments.filter((p) => !p.paid);
	const paidPayments = payments.filter((p) => p.paid);

	const [activeTab, setActiveTab] = useState<"monthly" | "cotisations">(
		"monthly",
	);
	const canManage =
		profile?.role === "admin" || profile?.role === "budget_manager";

	return (
		<Screen>
			<ScrollView
				className="flex-1 px-4 pt-10"
				contentContainerStyle={{
					paddingBottom: Platform.OS === "ios" ? 30 : 50,
					gap: 20,
				}}
			>
				{/* Tabs buttons */}
				<View className="flex-row mb-4 border border-white rounded-md">
					<Pressable
						onPress={() => setActiveTab("monthly")}
						className={`flex-1 p-3 rounded-l-md ${activeTab === "monthly" && "bg-blue-500"}`}
					>
						<Text
							className={`text-center  font-semibold ${activeTab === "monthly" && "text-white"}`}
						>
							{" "}
							Mensualités
						</Text>
					</Pressable>
					<Pressable
						onPress={() => setActiveTab("cotisations")}
						className={`flex-1 p-3 rounded-r-md  ${activeTab === "cotisations" && "bg-blue-500"}`}
					>
						<Text
							className={`text-center font-semibold ${activeTab === "cotisations" && "text-white"}`}
						>
							Cotisations
						</Text>
					</Pressable>
				</View>
				{activeTab === "monthly" ? (
					<MonthlyPaymentsList
						unpaid={unpaidPayments}
						paid={paidPayments}
						canManage={canManage}
						onPay={markPaymentAsPaid}
					/>
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

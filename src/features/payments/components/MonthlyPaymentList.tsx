import { Text, View } from "react-native";
import { PaymentCard } from "./PaymentCard";

export const MonthlyPaymentsList = ({
	unpaid,
	paid,
	canManage,
	onPay,
}: any) => {
	return (
		<>
			<Text className="text-xl font-bold mb-3">Paiements en attente</Text>

			{unpaid.map((p: any) => (
				<PaymentCard
					key={p.id}
					payment={p}
					canManage={canManage}
					onPay={onPay}
				/>
			))}
			<View className="border border-white" />
			<Text className="text-xl font-bold mt-6 mb-3 ">Historique</Text>

			{paid.map((p: any) => (
				<PaymentCard
					key={p.id}
					payment={p}
					canManage={canManage}
				/>
			))}
		</>
	);
};

import { View } from "react-native";
import { PaymentCard } from "./PaymentCard";

export const MonthlyPaymentsList = ({
	unpaid,
	paid,
	canManage,
	onPay,
	onCancel,
}: any) => {
	return (
		<>
			<View className="flex-row flex-wrap -mx-1">
				{unpaid.map((item: any) => (
					<View
						key={item.id}
						className="w-1/3 px-1 mb-2"
					>
						<PaymentCard
							payment={item}
							canManage={canManage}
							onPay={onPay}
							onCancel={onCancel}
						/>
					</View>
				))}
			</View>
			<View className="flex-row flex-wrap -mx-1">
				{paid.map((item: any) => (
					<View
						key={item.id}
						className="w-1/3 px-1 mb-2"
					>
						<PaymentCard
							payment={item}
							canManage={canManage}
							onPay={onPay}
							onCancel={onCancel}
						/>
					</View>
				))}
			</View>
		</>
	);
};

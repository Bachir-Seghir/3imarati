import { Pressable, Text, View } from "react-native";

export const PaymentCard = ({ payment, canManage, onPay }: any) => {
	return (
		<View className="bg-white p-3 rounded-xl mb-2  border border-slate-200">
			<Text>
				Aquéreur: {payment.fullName} - {payment.floor}-{payment.door}
			</Text>
			<Text>Mois: {payment.month}</Text>
			<Text>Montant: {payment.amount} DA</Text>
			{payment.paid ? (
				<Text className="text-green-500 mt-1">✔ Payé</Text>
			) : (
				<Text className="text-orange-500 mt-1">En attente</Text>
			)}
			{!payment.paid && canManage && (
				<Pressable
					onPress={() => onPay(payment.id)}
					className="bg-green-600 p-2 mt-2 mx-auto rounded w-[60%]"
				>
					<Text className="text-white text-center font-semibold">
						Paiment effectué
					</Text>
				</Pressable>
			)}
		</View>
	);
};

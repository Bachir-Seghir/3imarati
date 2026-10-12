import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type PaymentCardProps = {
	payment: any;
	canManage: boolean;
	onPay: (paymentId: string) => void;
	onCancel: (paymentId: string) => void;
};

export const PaymentCard = ({
	payment,
	canManage,
	onPay,
	onCancel,
}: PaymentCardProps) => {
	const [confirmVisible, setConfirmVisible] = useState(false);

	const handleConfirmCancellation = () => {
		setConfirmVisible(false);
		onCancel(payment.id);
	};

	return (
		<>
			<View
				className={`rounded-md border p-2 items-center justify-between min-h-[120px] ${
					payment.paid
						? "bg-green-50 border-green-200"
						: payment.cancelled
							? "bg-red-50 border-red-200"
							: "bg-white border-slate-200"
				}`}
			>
				{/* Floor - Door */}
				<Text
					className="text-base font-bold text-slate-800"
					numberOfLines={1}
				>
					{payment.floor} - {payment.door}
				</Text>

				{/* Month */}
				<Text className="text-xs text-slate-500 mt-1">{payment.month}</Text>

				{/* Status icon */}
				<View className="mt-2">
					{payment.cancelled ? (
						<Ionicons
							name="close-circle"
							size={24}
							color="#DC2626"
						/>
					) : payment.paid ? (
						<Ionicons
							name="checkmark-circle"
							size={24}
							color="#16A34A"
						/>
					) : (
						<Ionicons
							name="close-circle"
							size={24}
							color="#EA580C"
						/>
					)}
				</View>

				{/* Action button */}
				{canManage &&
					!payment.cancelled &&
					(payment.paid ? (
						<Pressable
							onPress={() => setConfirmVisible(true)}
							className="bg-orange-600 rounded-md px-2 py-1 mt-2 w-full"
						>
							<Text className="text-white text-xs font-semibold text-center">
								Annuler
							</Text>
						</Pressable>
					) : (
						<Pressable
							onPress={() => onPay(payment.id)}
							className="bg-green-600 rounded-md px-2 py-1 mt-2 w-full"
						>
							<Text className="text-white text-xs font-semibold text-center">
								Approuver
							</Text>
						</Pressable>
					))}
			</View>

			{/* Cancellation confirmation */}
			<Modal
				visible={confirmVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setConfirmVisible(false)}
			>
				<View className="flex-1 bg-black/50 justify-center items-center px-6">
					<View className="bg-white rounded-xl p-5 w-full max-w-md">
						<Text className="text-lg font-bold mb-3">
							Annuler le paiement ?
						</Text>

						<Text className="text-slate-600 mb-5">
							Confirmez-vous l'annulation du paiement de {payment.amount} DA
							pour {payment.month} ? Le montant sera déduit du budget du
							bâtiment.
						</Text>

						<Pressable
							onPress={handleConfirmCancellation}
							className="bg-orange-600 rounded-md p-3 mb-3"
						>
							<Text className="text-white text-center font-semibold">
								Confirmer l'annulation
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setConfirmVisible(false)}
							className="bg-slate-100 rounded-md p-3"
						>
							<Text className="text-slate-700 text-center font-semibold">
								Retour
							</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</>
	);
};

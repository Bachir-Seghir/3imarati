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
			<View className="bg-white p-3 rounded-xl mb-2 border border-slate-200">
				<Text>
					Résident : {payment.fullName} - {payment.floor}-{payment.door}
				</Text>

				<Text>Mois : {payment.month}</Text>
				<Text>Montant : {payment.amount} DA</Text>

				{payment.paid ? (
					<Text className="text-green-500 mt-1">✔ Payé</Text>
				) : (
					<Text className="text-orange-500 mt-1">En attente</Text>
				)}

				{canManage && (
					<>
						{!payment.paid && !payment.cancelled && (
							<Pressable
								onPress={() => onPay(payment.id)}
								className="bg-green-600 p-2 mt-2 mx-auto rounded w-[60%]"
							>
								<Text className="text-white text-center font-semibold">
									Paiement effectué
								</Text>
							</Pressable>
						)}

						{payment.paid && (
							<Pressable
								onPress={() => setConfirmVisible(true)}
								className="bg-orange-600 p-2 mt-2 mx-auto rounded w-[80%]"
							>
								<Text className="text-white text-center font-semibold">
									Annuler le paiement
								</Text>
							</Pressable>
						)}

						{payment.cancelled && (
							<Text className="text-red-600 mt-2">Paiement annulé</Text>
						)}
					</>
				)}
			</View>

			<Modal
				visible={confirmVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setConfirmVisible(false)}
			>
				<View className="flex-1 bg-black/50 justify-center items-center px-6">
					<View className="bg-white rounded-2xl p-5 w-full max-w-md">
						<Text className="text-xl font-bold mb-3">
							Annuler le paiement ?
						</Text>

						<Text className="text-gray-600 mb-5">
							Confirmez-vous l'annulation du paiement de {payment.amount} DA
							pour {payment.month} ? Le montant sera déduit du budget du
							bâtiment.
						</Text>

						<Pressable
							onPress={handleConfirmCancellation}
							className="bg-orange-600 rounded-lg p-3 mb-3"
						>
							<Text className="text-white text-center font-semibold">
								Confirmer l'annulation
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setConfirmVisible(false)}
							className="bg-gray-100 rounded-lg p-3"
						>
							<Text className="text-gray-700 text-center font-semibold">
								Retour
							</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</>
	);
};

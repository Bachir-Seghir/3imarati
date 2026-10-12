import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, Text, View } from "react-native";

type AppAlertModalProps = {
	visible: boolean;
	title: string;
	message: string;
	onClose: () => void;
	confirmText?: string;
	onConfirm?: () => void;
	destructive?: boolean;
};

export default function AppAlertModal({
	visible,
	title,
	message,
	onClose,
	confirmText = "OK",
	onConfirm,
	destructive = false,
}: AppAlertModalProps) {
	const handleConfirm = () => {
		if (onConfirm) {
			onConfirm();
		} else {
			onClose();
		}
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<View className="flex-1 items-center justify-center bg-black/50 px-6">
				<View className="w-full max-w-md rounded-2xl bg-white p-6">
					<View className="mb-4 items-center">
						<View
							className={`h-14 w-14 items-center justify-center rounded-full ${
								destructive ? "bg-red-100" : "bg-green-100"
							}`}
						>
							<Ionicons
								name={
									destructive
										? "alert-circle-outline"
										: "information-circle-outline"
								}
								size={30}
								color={destructive ? "#DC2626" : "#065F46"}
							/>
						</View>
					</View>

					<Text className="mb-2 text-center text-lg font-bold text-gray-900">
						{title}
					</Text>

					<Text className="mb-6 text-center text-base leading-6 text-gray-600">
						{message}
					</Text>

					<View className="flex-row gap-3">
						{onConfirm && (
							<Pressable
								onPress={onClose}
								className="flex-1 items-center rounded-xl border border-gray-300 py-3"
							>
								<Text className="font-semibold text-gray-700">Annuler</Text>
							</Pressable>
						)}

						<Pressable
							onPress={handleConfirm}
							className={`flex-1 items-center rounded-xl py-3 ${
								destructive ? "bg-red-600" : "bg-green-800"
							}`}
						>
							<Text className="font-semibold text-white">{confirmText}</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../features/auth/context/AuthContext";
import { createCotisation } from "../features/payments/services/cotisation.service";

export const CotisationBtn = () => {
	const { user, profile } = useAuth();
	const [modalVisible, setModalVisible] = useState(false);

	const [amount, setAmount] = useState<string>("");

	// 🟢 Submit add to budget
	const handleAdd = async () => {
		if (!user || !profile.approved) {
			alert("Vous n'etes pas encore apprové pour cotiser");
			setAmount("");
			setModalVisible(false);
			return;
		}

		await createCotisation(
			Number(amount),
			user.uid,
			profile?.floor,
			profile?.door,
			profile?.fullName,
		);
		setModalVisible(false);
		setAmount("");
	};

	return (
		<View className="bg-white p-4 rounded-2xl shadow-sm">
			<Pressable
				onPress={() => setModalVisible(true)}
				className="w-full"
			>
				<Text className="text-green-600 font-semibold">Cotiser</Text>
			</Pressable>
			<Modal
				visible={modalVisible}
				animationType="slide"
				presentationStyle="fullScreen"
			>
				<SafeAreaView className="flex-1 bg-white">
					<View className="flex-1 justify-center p-5">
						<Text className="text-xl font-bold mb-4">
							Cotisation Volentaire
						</Text>

						<TextInput
							placeholder="amount"
							inputMode="numeric"
							keyboardType="number-pad"
							value={amount}
							onChangeText={setAmount}
							className="border p-3 rounded-md mb-3"
						/>

						<Pressable
							onPress={handleAdd}
							className="bg-orange-500 p-3 rounded-md mb-3"
						>
							<Text className="text-white text-center text-xl">Cotiser</Text>
						</Pressable>

						<Pressable onPress={() => setModalVisible(false)}>
							<Text className="text-center text-red-500 text-xl">Annuler</Text>
						</Pressable>
					</View>
				</SafeAreaView>
			</Modal>
		</View>
	);
};

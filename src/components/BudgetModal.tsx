import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExpenseHistoryList } from "./ExpenseHistoryList";

export const BudgetModal = () => {
	const [modalVisible, setModalVisible] = useState(false);

	return (
		<View className="bg-white p-4 rounded-2xl shadow-sm">
			<Pressable
				onPress={() => setModalVisible(true)}
				className="w-full"
			>
				<Text className="text-orange-600 font-semibold">
					Consultation Budget et dépenses
				</Text>
			</Pressable>
			<Modal
				visible={modalVisible}
				animationType="slide"
				presentationStyle="fullScreen"
			>
				<SafeAreaView className="flex-1 bg-white py-6">
					<View className="flex-1 p-5">
						<ExpenseHistoryList />
						<Pressable onPress={() => setModalVisible(false)}>
							<Text className="w-[100px] px-2 py-1 rounded-md self-center bg-red-500 text-center text-white text-xl">
								Quitter
							</Text>
						</Pressable>
					</View>
				</SafeAreaView>
			</Modal>
		</View>
	);
};

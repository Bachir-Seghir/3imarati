import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExpenseHistoryList } from "./ExpenseHistoryList";

export const BudgetModal = () => {
	const [modalVisible, setModalVisible] = useState(false);
	return (
		<>
			<Pressable
				onPress={() => setModalVisible(true)}
				className="bg-orange-500 rounded-xl active:opacity-80"
			>
				<View className="h-14 flex-row items-center justify-center px-4">
					<View className="bg-white/20 rounded-full w-9 h-9 items-center justify-center">
						{" "}
						<Ionicons
							name="wallet-outline"
							size={21}
							color="white"
						/>{" "}
					</View>{" "}
					<Text className="text-white text-base font-bold ml-2">
						{" "}
						Consulter Budget{" "}
					</Text>{" "}
				</View>{" "}
			</Pressable>

			<Modal
				visible={modalVisible}
				animationType="slide"
				presentationStyle="fullScreen"
			>
				<SafeAreaView className="flex-1 bg-white py-6">
					<ScrollView>
						<View className="flex-1 p-5">
							<ExpenseHistoryList />
							<Pressable onPress={() => setModalVisible(false)}>
								<Text className="w-[100px] px-2 py-1 rounded-md self-center bg-red-500 text-center text-white text-xl">
									Quitter
								</Text>
							</Pressable>
						</View>
					</ScrollView>
				</SafeAreaView>
			</Modal>
		</>
	);
};

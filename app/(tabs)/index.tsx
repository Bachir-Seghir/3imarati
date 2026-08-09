import { BudgetModal } from "@/src/components/BudgetModal";
import { CotisationBtn } from "@/src/components/CotisationBtn";
import Screen from "@/src/components/Screen";
import { useBudget } from "@/src/features/dashboard/hooks/useBudget";
import { useCompalintsStats } from "@/src/features/dashboard/hooks/useComplaintsStats";
import { useResidentsCount } from "@/src/features/dashboard/hooks/useResidentsCount";
import { AddNotificationModal } from "@/src/features/notifications/components/AddNotificationModal";
import NotificationsCarousel from "@/src/features/notifications/components/NotificationsCarousel";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function HomeScreen() {
	const budget = useBudget();
	const residents = useResidentsCount();
	const complaints = useCompalintsStats();

	return (
		<Screen>
			<ScrollView
				className="flex-1 h-full px-2"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				{/* Stats Cards */}
				<View className="flex-row justify-between flex-wrap gap-4">
					<View className="w-[48%] gap-y-2">
						<View className="bg-white p-4 rounded-2xl shadow-sm">
							<Text className="text-gray-500 font-semibold">
								Résidents Inscrits
							</Text>
							<Text className="text-xl font-bold mt-1">{residents} / 72</Text>
						</View>
						<View className="bg-white p-4 rounded-2xl shadow-sm">
							<Text className="text-gray-500 font-semibold">
								Solde Caisse Noire
							</Text>
							<Text className="text-xl font-bold mt-1 text-orange-600">
								{budget}
							</Text>
						</View>
					</View>

					<View className="bg-white p-4 rounded-2xl w-[48%] shadow-sm">
						<Pressable onPress={() => router.push("/(tabs)/complaints")}>
							<Text className="text-gray-500 font-semibold">Plaintes</Text>
							<View className="flex flex-row gap-2 items-center">
								<Text className="text-md font-bold mt-1 text-yellow-500">
									{
										complaints.filter((c) => c.status === "En_Traitement")
											.length
									}{" "}
									/ {complaints.length}
								</Text>
								<Text>en traitement</Text>
							</View>
							<View className="flex flex-row gap-2 items-center">
								<Text className="text-md font-bold mt-1 text-red-300">
									{complaints.filter((c) => c.status === "En_Attente").length} /{" "}
									{complaints.length}
								</Text>
								<Text>en Attente</Text>
							</View>
							<View className="flex flex-row gap-2 items-center">
								<Text className="text-md font-bold mt-1 text-green-500">
									{complaints.filter((c) => c.status === "Résolue").length} /{" "}
									{complaints.length}
								</Text>
								<Text>Résolues</Text>
							</View>
						</Pressable>
					</View>
				</View>
				{/* Quick Actions */}
				<Text className="mt-8 mb-3 text-gray-700 font-semibold">
					Actions Rapides
				</Text>
				<View className="flex gap-y-2">
					<View className="bg-white p-4 rounded-2xl shadow-sm">
						<Pressable onPress={() => router.push("/(tabs)/complaints")}>
							<Text className="text-blue-600 font-semibold">
								+ Ajouter Une Plainte
							</Text>
							<Text className="text-gray-500 mt-1">
								Rapporter un nouveau probleme dans la residence
							</Text>
						</Pressable>
						{/* ➕ Floating button */}
					</View>
					<CotisationBtn />
					<BudgetModal />
					<AddNotificationModal />
				</View>
				{/* Notifications */}
				<NotificationsCarousel />
			</ScrollView>
		</Screen>
	);
}

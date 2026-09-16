import { BudgetModal } from "@/src/components/BudgetModal";
import { CotisationBtn } from "@/src/components/CotisationBtn";
import ResidentsPhoneModal from "@/src/components/ResidentsPhoneModal";
import Screen from "@/src/components/Screen";
import { AddComplaintModal } from "@/src/features/complaints/components/AddComplaintModal";

import { useBudget } from "@/src/features/dashboard/hooks/useBudget";
import { useCompalintsStats } from "@/src/features/dashboard/hooks/useComplaintsStats";
import { useResidentsCount } from "@/src/features/dashboard/hooks/useResidentsCount";

import NotificationsCarousel from "@/src/features/notifications/components/NotificationsCarousel";

import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function HomeScreen() {
	const budget = useBudget();
	const residents = useResidentsCount();
	const complaints = useCompalintsStats();

	const inProgress = complaints.filter(
		(c) => c.status === "En_Traitement",
	).length;

	const pending = complaints.filter((c) => c.status === "En_Attente").length;

	const resolved = complaints.filter((c) => c.status === "Résolue").length;

	return (
		<Screen>
			<View className="h-full px-2">
				{/* ================================================= */}
				{/* STATS */}
				{/* ================================================= */}
				<View>
					<Text className="mb-2 text-center text-gray-900 text-lg font-bold">
						Informations Générales
					</Text>
				</View>
				<View className="flex-row gap-3 h-[26%]">
					{/* LEFT COLUMN */}

					<View className="flex-1 gap-2">
						{/* Residents */}
						<View className="flex-1 bg-white px-3 rounded-md shadow-sm justify-center">
							<Text className="text-gray-500 font-semibold text-md">
								Résidents Inscrits
							</Text>

							<Text className="flex-md text-xl font-bold mt-1">
								{residents} / 72
							</Text>
						</View>

						{/* Budget */}
						<View className="flex-1 bg-white px-3 rounded-md shadow-sm justify-center">
							<Text className="text-gray-500 text-md font-semibold">
								Solde Caisse
							</Text>

							<Text className="flex-md text-xl font-bold mt-1 text-orange-600">
								{budget} DA
							</Text>
						</View>
					</View>

					{/* RIGHT COLUMN - COMPLAINTS */}
					<View className="flex-1 bg-white p-3 rounded-md shadow-sm justify-center">
						<Pressable
							className="flex-1"
							onPress={() => router.push("/(tabs)/complaints")}
						>
							<Text
								className="text-gray-500 text-md font-semibold mb-1"
								numberOfLines={1}
							>
								Réclamations
							</Text>

							{/* In progress */}
							<View className="flex-1 flex-row items-center gap-2">
								<Text className="text-lg font-bold text-yellow-500">
									{inProgress}/{complaints.length}
								</Text>

								<Text className="flex-1 text-md font-bold">en traitement</Text>
							</View>

							{/* Pending */}
							<View className="flex-1 flex-row items-center gap-2">
								<Text className="text-lg font-bold text-red-300">
									{pending}/{complaints.length}
								</Text>

								<Text className="flex-1 text-md font-bold">en Attente</Text>
							</View>

							{/* Resolved */}
							<View className="flex-1 flex-row items-center gap-2">
								<Text className="text-lg font-bold text-green-500">
									{resolved}/{complaints.length}
								</Text>

								<Text className="flex-1 text-md font-bold">Résolues</Text>
							</View>
						</Pressable>
					</View>
				</View>

				{/* ================================================= */}
				{/* QUICK ACTIONS */}
				{/* ================================================= */}

				<View className="mt-2 h-[30%]">
					<Text className="mb-2 text-gray-900  text-center text-lg font-bold">
						Actions Rapides
					</Text>

					{/* Row 1 */}
					<View className="flex-wrap w-full justify-center gap-2 flex-row mb-2">
						{/* Add complaint */}
						<View className="w-[44%]">
							<AddComplaintModal />
						</View>

						{/* Cotiser */}
						<View className="w-[44%]">
							<CotisationBtn />
						</View>
						<View className="w-[44%]">
							<BudgetModal />
						</View>

						{/* Residents */}
						<View className="w-[44%]">
							<ResidentsPhoneModal />
						</View>
					</View>
				</View>

				{/* ================================================= */}
				{/* NOTIFICATIONS */}
				{/* ================================================= */}
				<View className="h-30%">
					<NotificationsCarousel />
				</View>
			</View>
		</Screen>
	);
}

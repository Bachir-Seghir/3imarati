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
			<View className="flex-1 px-2">
				{/* ================================================= */}
				{/* STATS */}
				{/* ================================================= */}
				<View>
					<Text className="mb-2 text-gray-900 text-lg font-bold">
						Informations Générales
					</Text>
				</View>
				<View className="flex-row gap-3 flex-[1.5]">
					{/* LEFT COLUMN */}

					<View className="flex-1 gap-2">
						{/* Residents */}
						<View className="flex-1 bg-white px-3 rounded-md shadow-sm justify-center">
							<Text className="text-gray-500 font-semibold text-lg">
								Résidents Inscrits
							</Text>

							<Text className="flex-md text-2xl font-bold mt-1">
								{residents} / 72
							</Text>
						</View>

						{/* Budget */}
						<View className="flex-1 bg-white px-3 rounded-md shadow-sm justify-center">
							<Text className="text-gray-500 text-lg font-semibold">
								Solde Caisse
							</Text>

							<Text className="flex-md text-2xl font-bold mt-1 text-orange-600">
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
								className="text-gray-500 text-xl font-semibold mb-1"
								numberOfLines={1}
							>
								Réclamations
							</Text>

							{/* In progress */}
							<View className="flex-1 flex-row items-center gap-2">
								<Text className="text-lg font-bold text-yellow-500">
									{inProgress} / {complaints.length}
								</Text>

								<Text
									className="flex-1 text-lg font-bold"
									numberOfLines={1}
								>
									en traitement
								</Text>
							</View>

							{/* Pending */}
							<View className="flex-1 flex-row items-center gap-2">
								<Text className="text-base font-bold text-red-300">
									{pending} / {complaints.length}
								</Text>

								<Text
									className="flex-1 text-lg font-bold"
									numberOfLines={1}
								>
									en Attente
								</Text>
							</View>

							{/* Resolved */}
							<View className="flex-1 flex-row items-center gap-2">
								<Text className="text-base font-bold text-green-500">
									{resolved} / {complaints.length}
								</Text>

								<Text
									className="flex-1 text-lg font-bold"
									numberOfLines={1}
								>
									Résolues
								</Text>
							</View>
						</Pressable>
					</View>
				</View>

				{/* ================================================= */}
				{/* QUICK ACTIONS */}
				{/* ================================================= */}

				<View className="flex-[2] pt-5">
					<Text className="mb-2 text-gray-900 text-lg font-bold">
						Actions Rapides
					</Text>

					<View className="flex-1">
						{/* Row 1 */}
						<View className="flex-1 flex-row gap-4">
							{/* Add complaint */}
							<View className="flex-[1]">
								<AddComplaintModal />
							</View>

							{/* Cotiser */}
							<View className="flex-1">
								<CotisationBtn />
							</View>
						</View>

						{/* Budget */}
						<View className="flex-1">
							<BudgetModal />
						</View>

						{/* Residents */}
						<View className="flex-1">
							<ResidentsPhoneModal />
						</View>
					</View>
				</View>

				{/* ================================================= */}
				{/* NOTIFICATIONS */}
				{/* ================================================= */}

				<View className="flex-[2.4] min-h-0">
					<NotificationsCarousel />
				</View>
			</View>
		</Screen>
	);
}

import { FloorDoorFilter } from "@/src/components/FloorDoorFilter";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Cotisation } from "../types/cotisation";

export const CotisationList = ({
	cotisations,
	canManage,
	onApprove,
	onReject,
}: any) => {
	// filter approved and rejected cotisations
	const otherCotisations = cotisations.filter(
		(item: Cotisation) => item.status !== "pending",
	);

	// filter pending cotisations
	const pendingCotisations = cotisations.filter(
		(item: Cotisation) => item.status === "pending",
	);

	// Filter result
	const [filterResult, setFilterResult] =
		useState<Cotisation[]>(otherCotisations);

	// filter status On/Off
	const [filterActive, setFilterActive] = useState<boolean>(false);

	const parseUser = (createdBy: string) => {
		const [fullName, floor, door] = createdBy.split("-");

		return {
			fullName,
			floor,
			door,
		};
	};

	return (
		<>
			<Text className="text-xl font-bold mb-3">Cotisations en attente</Text>

			{pendingCotisations.map((r: any) => (
				<View
					key={r.id}
					className="bg-white p-3 rounded-md mb-2  border border-slate-200"
				>
					<Text className="font-semibold">Montant: {r.amount} DA</Text>
					<Text className="font-semibold">
						Par : {r.fullName}-{r.floor}-{r.door}
					</Text>

					{canManage ? (
						<View className="flex flex-row justify-between">
							<Pressable
								onPress={() => onApprove(r.id)}
								className="bg-green-600 py-2 px-6 mt-2 rounded-md"
							>
								<Text className="text-white text-center font-semibold">
									Approve
								</Text>
							</Pressable>
							<Pressable
								onPress={() => onReject(r.id)}
								className="bg-red-500 py-2 px-6 mt-2 rounded-md"
							>
								<Text className="text-white text-center font-semibold">
									Annuler
								</Text>
							</Pressable>
						</View>
					) : (
						<Text className="text-orange-600">En attente</Text>
					)}
				</View>
			))}

			<View className="border border-white" />
			<Text className="text-xl font-bold mt-6 mb-3">Historique</Text>

			<FloorDoorFilter
				data={otherCotisations}
				onFilter={setFilterResult}
				onActiveChange={setFilterActive}
				highlight
			/>
			{filterResult.map((r: any) => (
				<View
					key={r.id}
					className={` p-3 rounded-md mb-2 ${filterActive ? "bg-orange-100" : "bg-slate-100"}`}
				>
					<Text>Montant: {r.amount} DA</Text>
					<Text className="font-semibold">
						Par : {r.fullName}-{r.floor}-{r.door}
					</Text>
					<Text className="font-semibold">
						Date : {r.approvedAt?.toDate().toLocaleDateString()}
					</Text>
					{r.status === "approved" && (
						<Text className="text-green-500">✔ Approuvé</Text>
					)}
					{r.status === "rejected" && (
						<Text className="text-red-500">x Rejected</Text>
					)}
				</View>
			))}
		</>
	);
};

import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Complaint = {
	status: string;
	assignedToId?: string | null;
	[key: string]: any;
};

type Props = {
	data: Complaint[];
	currentUserId?: string;
	currentUserName?: string;
	onFilter: (filtered: Complaint[]) => void;
	onActiveChange?: (active: boolean) => void;
	highlight?: boolean;
};

export function ComplaintsFilter({
	data,
	currentUserId,
	currentUserName,
	onFilter,
	onActiveChange,
	highlight = false,
}: Props) {
	const [selectedFilter, setSelectedFilter] = useState("");

	const [active, setActive] = useState(false);

	const handleStatusFilter = (status: string) => {
		setSelectedFilter(status);

		const result = data.filter((item) => item.status === status);

		onFilter(result);
		setActive(true);
		onActiveChange?.(true);
	};

	const handleMyComplaints = () => {
		if (!currentUserId) return;

		setSelectedFilter("my");

		const result = data.filter((item) => item.assignedToId === currentUserId);

		onFilter(result);
		setActive(true);
		onActiveChange?.(true);
	};

	const handleReset = () => {
		setSelectedFilter("");
		onFilter(data);

		setActive(false);
		onActiveChange?.(false);
	};

	return (
		<View
			className={` ${
				active && highlight ? "bg-orange-100" : "bg-white"
			}  border-2 border-white p-4 rounded-md mb-4`}
		>
			<Text className="font-semibold mb-3">Filtrer les réclamations</Text>

			<View className="flex-row flex-wrap justify-center gap-2">
				{/* En attente */}
				<Pressable
					onPress={() => handleStatusFilter("En_Attente")}
					className={`px-3 py-2 rounded-md ${
						selectedFilter === "En_Attente" ? "bg-red-500" : "bg-gray-200"
					}`}
				>
					<Text
						className={`font-medium ${
							selectedFilter === "En_Attente" ? "text-white" : "text-black"
						}`}
					>
						En attente
					</Text>
				</Pressable>

				{/* En traitement */}
				<Pressable
					onPress={() => handleStatusFilter("En_Traitement")}
					className={`px-3 py-2 rounded-md ${
						selectedFilter === "En_Traitement" ? "bg-yellow-500" : "bg-gray-200"
					}`}
				>
					<Text
						className={`font-medium ${
							selectedFilter === "En_Traitement" ? "text-white" : "text-black"
						}`}
					>
						En traitement
					</Text>
				</Pressable>

				{/* Résolue */}
				<Pressable
					onPress={() => handleStatusFilter("Résolue")}
					className={`px-3 py-2 rounded-md ${
						selectedFilter === "Résolue" ? "bg-green-500" : "bg-gray-200"
					}`}
				>
					<Text
						className={`font-medium ${
							selectedFilter === "Résolue" ? "text-white" : "text-black"
						}`}
					>
						Résolue
					</Text>
				</Pressable>

				{/* Mes réclamations */}
				<Pressable
					onPress={handleMyComplaints}
					className={`px-3 py-2 rounded-md ${
						selectedFilter === "my" ? "bg-orange-500" : "bg-gray-200"
					}`}
				>
					<Text
						className={`font-medium ${
							selectedFilter === "my" ? "text-white" : "text-black"
						}`}
					>
						prise en charge par {currentUserName}
					</Text>
				</Pressable>
			</View>

			{/* Reset */}
			<Pressable
				onPress={handleReset}
				className="bg-blue-600 py-2 rounded-md mt-3"
			>
				<Text className="text-white text-center font-medium">
					Afficher tous
				</Text>
			</Pressable>
		</View>
	);
}

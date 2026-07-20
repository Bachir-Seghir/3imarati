import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Complaint = {
	status: string;
	[key: string]: any;
};

type Props = {
	data: Complaint[];
	onFilter: (filtered: Complaint[]) => void;
	onActiveChange?: (active: boolean) => void;
	highlight?: boolean;
};

export function ComplaintsFilter({
	data,
	onFilter,
	onActiveChange,
	highlight = false,
}: Props) {
	const [selectedStatus, setSelectedStatus] = useState("");
	const [active, setActive] = useState(false);

	const handleFilter = (status: string) => {
		setSelectedStatus(status);

		const result = data.filter((item) => item.status === status);

		onFilter(result);
		setActive(true);
		onActiveChange?.(true);
	};

	const handleReset = () => {
		setSelectedStatus("");
		onFilter(data);

		setActive(false);
		onActiveChange?.(false);
	};

	return (
		<View
			className={`${
				active && highlight ? "bg-orange-100" : ""
			} border-2 border-white p-4 rounded-md mb-4`}
		>
			<Text className="font-semibold mb-3">Filtrer par état</Text>

			<View className="flex-row flex-wrap justify-center gap-2">
				<Pressable
					onPress={() => handleFilter("En_Attente")}
					className={`px-3 py-2 rounded-md bg-gray-300 ${
						selectedStatus === "En_Attente" ? "bg-red-500" : "bg-gray-200"
					}`}
				>
					<Text
						className={`font-medium ${
							selectedStatus === "En_Attente" ? "text-white" : "text-black"
						}`}
					>
						En attente
					</Text>
				</Pressable>

				<Pressable
					onPress={() => handleFilter("En_Traitement")}
					className={`px-3 py-2 rounded-md bg-gray-300 ${
						selectedStatus === "En_Traitement" ? "bg-yellow-500" : "bg-gray-200"
					}`}
				>
					<Text
						className={`font-medium ${
							selectedStatus === "En_Traitement" ? "text-white" : "text-black"
						}`}
					>
						En traitement
					</Text>
				</Pressable>

				<Pressable
					onPress={() => handleFilter("Résolue")}
					className={`px-3 py-2 rounded-md bg-gray-300 ${
						selectedStatus === "Résolue" ? "bg-green-500" : "bg-gray-200"
					}`}
				>
					<Text
						className={`font-medium ${
							selectedStatus === "Résolue" ? "text-white" : "text-black"
						}`}
					>
						Résolue
					</Text>
				</Pressable>
			</View>

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

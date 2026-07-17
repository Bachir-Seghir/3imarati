import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Complaint } from "../features/complaints/types/complaint";

type Props = {
	data: Complaint[];
	onFilter: (filtered: Complaint[]) => void;
	onActiveChange?: (active: boolean) => void;
	highlight?: boolean;
};

const status = [
	{ label: "En attente", value: "en_attente" },
	{ label: "En traitement", value: "en_traitement" },
	{ label: "Résolues", value: "resolues" },
];

export function ComplaintStatusFilter({
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
			className={`${active && highlight ? "bg-orange-100" : ""} border-2 border-white p-4 rounded-md mb-4`}
		>
			<Text className="font-semibold mb-3">Filtrer par statut</Text>

			<View className="flex-row flex-wrap gap-2 mb-3">
				{status.map((s) => (
					<Pressable
						key={s.value}
						onPress={() => handleFilter(s.value)}
						className={`px-3 py-2 rounded-md ${
							selectedStatus === s.value ? "bg-blue-600" : "bg-gray-300"
						}`}
					>
						<Text
							className={`${
								selectedStatus === s.value ? "text-white" : "text-black"
							}`}
						>
							{s.label}
						</Text>
					</Pressable>
				))}
			</View>

			<Pressable
				onPress={handleReset}
				className="bg-blue-600 py-2 rounded-md"
			>
				<Text className="text-white text-center">Afficher tous</Text>
			</Pressable>
		</View>
	);
}

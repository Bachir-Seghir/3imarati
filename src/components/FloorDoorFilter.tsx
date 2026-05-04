import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Cotisation } from "../features/payments/types/cotisation";

type Props = {
	data: Cotisation[];
	onFilter: (filtered: Cotisation[]) => void;
	onActiveChange?: (active: boolean) => void;

	highlight: boolean;
};

export function FloorDoorFilter<T>({
	data,
	onFilter,
	onActiveChange,
	highlight = false,
}: Props) {
	const [floor, setFloor] = useState("");
	const [door, setDoor] = useState("");
	const [active, setActive] = useState(false);

	const handleSearch = () => {
		const result = data.filter((item) => {
			const matchFloor = floor ? item.floor.toString() === floor : true;
			const matchDoor = door ? item.door.toString() === door : true;
			return matchFloor && matchDoor;
		});

		onFilter(result);
		setActive(true);
		onActiveChange?.(true);
	};

	const handleReset = () => {
		onFilter(data);
		setFloor("");
		setDoor("");
		setActive(false);
		onActiveChange?.(false);
	};

	return (
		<View
			className={`${active && highlight ? "bg-orange-100" : ""} border-2 border-white  p-4 rounded-md mb-4`}
		>
			<Text className="font-semibold mb-2">Filtrer</Text>

			<TextInput
				placeholder="Étage: 3"
				value={floor}
				onChangeText={setFloor}
				keyboardType="numeric"
				className="border p-3 rounded-md d mb-2 bg-white"
			/>

			<TextInput
				keyboardType="numeric"
				placeholder="Porte : 7"
				value={door}
				onChangeText={setDoor}
				className="border p-3 rounded-md d mb-2 bg-white"
			/>
			<View className="flex flex-row justify-center gap-x-2">
				<Pressable
					onPress={handleSearch}
					className="bg-blue-600 py-2 px-3 rounded-md"
				>
					<Text className="text-white text-center">Filtrer</Text>
				</Pressable>
				<Pressable
					onPress={handleReset}
					className="bg-blue-600 py-2 px-3 rounded-md"
				>
					<Text className="text-white text-center">Afficher tous</Text>
				</Pressable>
			</View>
		</View>
	);
}

import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type Props = {
	selectedMonth: string;
	onSelectMonth: (month: string) => void;
	selectedYear: number;
	onChangeYear: (year: number) => void;
};

const months = [
	"Janvier",
	"Février",
	"Mars",
	"Avril",
	"Mai",
	"Juin",
	"Juillet",
	"Août",
	"Septembre",
	"Octobre",
	"Novembre",
	"Décembre",
];

export function MonthlyPaymentCalendar({
	selectedMonth,
	onSelectMonth,
	selectedYear,
	onChangeYear,
}: Props) {
	const currentYear = new Date().getFullYear();

	return (
		<View className="bg-white rounded-2xl p-4 mb-4">
			<View className="flex-row justify-between items-center mb-4">
				<Text className="text-lg font-bold text-gray-800">
					Mensualités {currentYear}
				</Text>
			</View>

			<View className="flex-row items-center justify-between mb-5">
				<Pressable
					onPress={() => onChangeYear(selectedYear - 1)}
					className="bg-gray-100 rounded-full w-10 h-10 items-center justify-center"
				>
					<Ionicons
						name="chevron-back"
						size={22}
						color="#374151"
					/>
				</Pressable>
				<Text className="text-2xl font-bold text-gray-800">{selectedYear}</Text>
				<Pressable
					onPress={() => onChangeYear(selectedYear + 1)}
					className="bg-gray-100 rounded-full w-10 h-10 items-center justify-center"
				>
					<Ionicons
						name="chevron-forward"
						size={22}
						color="#374151"
					/>
				</Pressable>
			</View>
			<View className="flex-row flex-wrap gap-2">
				{months.map((monthName, index) => {
					const monthNumber = String(index + 1).padStart(2, "0");

					const monthValue = `${currentYear}-${monthNumber}`;

					const selected = selectedMonth === monthValue;

					return (
						<Pressable
							key={monthValue}
							onPress={() => onSelectMonth(monthValue)}
							className={`w-[31.5%] rounded-xl p-3 ${
								selected ? "bg-blue-500" : "bg-gray-100"
							}`}
						>
							<Text
								className={`text-center font-semibold ${
									selected ? "text-white" : "text-gray-700"
								}`}
							>
								{monthName}
							</Text>

							<Text
								className={`text-center text-xs mt-1 ${
									selected ? "text-white" : "text-gray-400"
								}`}
							>
								{monthNumber}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</View>
	);
}

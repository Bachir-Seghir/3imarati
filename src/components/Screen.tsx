import { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "./AppHeader";

export default function Screen({ children }: { children: ReactNode }) {
	return (
		<SafeAreaView
			className="flex-1 bg-gray-200"
			edges={["top"]}
		>
			<AppHeader />

			<View className="flex-1 pt-4 ">{children}</View>
		</SafeAreaView>
	);
}

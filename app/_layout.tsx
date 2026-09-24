import * as Network from "expo-network";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

type Props = {
	children: React.ReactNode;
};

export default function NetworkGuard({ children }: Props) {
	const [checking, setChecking] = useState(true);
	const [hasInternet, setHasInternet] = useState(true);

	useEffect(() => {
		const checkNetwork = async () => {
			try {
				const state = await Network.getNetworkStateAsync();

				const connected =
					state.isConnected === true && state.isInternetReachable === true;

				setHasInternet(connected);
			} catch (error) {
				console.error("Network check error:", error);

				setHasInternet(false);
			} finally {
				setChecking(false);
			}
		};

		checkNetwork();

		const subscription = Network.addNetworkStateListener((state) => {
			const connected =
				state.isConnected === true && state.isInternetReachable === true;

			setHasInternet(connected);
		});

		return () => {
			subscription.remove();
		};
	}, []);

	if (checking) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<ActivityIndicator
					size="large"
					color="#065F46"
				/>
			</View>
		);
	}

	return (
		<View className="flex-1">
			{children}

			{!hasInternet && (
				<View className="absolute inset-0 bg-white items-center justify-center px-8">
					<Text className="text-5xl mb-6">📡</Text>

					<Text className="text-2xl font-bold text-gray-800 text-center">
						Problème de connexion
					</Text>

					<Text className="text-gray-500 text-center mt-3">
						Vérifiez votre connexion Internet puis réessayez.
					</Text>
				</View>
			)}
		</View>
	);
}

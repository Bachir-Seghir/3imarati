import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, Image, View } from "react-native";

const { height } = Dimensions.get("window");

export default function SplashScreen() {
	const translateY = useRef(new Animated.Value(-height)).current;
	const opacity = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.sequence([
			// 2️⃣ logo drops after
			Animated.parallel([
				Animated.timing(translateY, {
					toValue: 0,
					duration: 800,
					easing: Easing.out(Easing.exp),
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 1,
					duration: 500,
					useNativeDriver: true,
				}),
			]),
		]).start();

		const timer = setTimeout(() => {
			router.replace("/(tabs)");
		}, 1800);

		return () => clearTimeout(timer);
	}, []);

	return (
		<View className="flex-1 bg-white items-center justify-center">
			{/* 🔥 Logo */}
			<Animated.View
				style={{
					transform: [{ translateY }],
					opacity,
				}}
			>
				<Image
					source={require("@/assets/images/logo-3.png")}
					style={{ width: 160, height: 160 }}
					resizeMode="contain"
				/>
			</Animated.View>
		</View>
	);
}

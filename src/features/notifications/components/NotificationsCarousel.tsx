import { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { subscribeNotifications } from "../services/norification.service";
import { Notification } from "../types/notification";

const { width } = Dimensions.get("window");

export default function NotificationsCarousel() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);

	const flatListRef = useRef<FlatList>(null);
	const timer = useRef<number | null>(null);

	useEffect(() => {
		const unsubscribe = subscribeNotifications(setNotifications);

		return unsubscribe;
	}, []);

	useEffect(() => {
		if (notifications.length <= 1) return;

		timer.current = setInterval(() => {
			const next =
				currentIndex === notifications.length - 1 ? 0 : currentIndex + 1;

			flatListRef.current?.scrollToIndex({
				index: next,
				animated: true,
			});

			setCurrentIndex(next);
		}, 3000);

		return () => {
			timer.current && clearInterval(timer.current);
		};
	}, [currentIndex, notifications]);

	const pause = () => {
		if (timer.current) clearInterval(timer.current);
	};

	const resume = () => {
		if (notifications.length <= 1) return;

		timer.current = setInterval(() => {
			const next =
				currentIndex === notifications.length - 1 ? 0 : currentIndex + 1;

			flatListRef.current?.scrollToIndex({
				index: next,
				animated: true,
			});

			setCurrentIndex(next);
		}, 5000);
	};

	const renderItem = ({ item }: { item: Notification }) => {
		const important = item.category === "Importante";

		return (
			<View
				style={{
					width: width - 82,
				}}
			>
				<View
					className={`rounded-2xl p-5 mx-1 ${
						important ? "bg-red-400" : "bg-green-500"
					}`}
				>
					<View className="flex-row items-center gap-2">
						<Ionicons
							name={important ? "alert-circle" : "information-circle"}
							color="white"
							size={22}
						/>

						<Text className="text-white font-bold text-lg">
							{item.category}
						</Text>
					</View>

					<Text
						className="text-white font-semibold text-xl mt-3"
						numberOfLines={2}
					>
						{item.title}
					</Text>

					<Pressable className="mt-2 flex flex-row justify-end">
						<Text className="text-white font-semibold">Lire Plus</Text>
					</Pressable>
				</View>
			</View>
		);
	};

	if (!notifications.length) return null;

	return (
		<View>
			<Text className="mt-8 mb-3 text-green-500 font-semibold">
				Notifications Importantes
			</Text>

			<FlatList
				ref={flatListRef}
				data={notifications}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				keyExtractor={(item) => item.id}
				renderItem={renderItem}
				onTouchStart={pause}
				onTouchEnd={resume}
				onMomentumScrollEnd={(e) => {
					const index = Math.round(
						e.nativeEvent.contentOffset.x / (width - 82),
					);

					setCurrentIndex(index);
				}}
			/>

			<View className="flex-row justify-center mt-3">
				{notifications.map((_, index) => (
					<View
						key={index}
						className={`mx-1 rounded-full ${
							index === currentIndex
								? "bg-blue-600 w-3 h-3"
								: "bg-gray-300 w-2 h-2"
						}`}
					/>
				))}
			</View>
		</View>
	);
}

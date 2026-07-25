import { useEffect, useRef, useState } from "react";
import {
	Animated,
	Dimensions,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { subscribeNotifications } from "../services/norification.service";
import { Notification } from "../types/notification";

const { width } = Dimensions.get("window");

export default function NotificationsCarousel() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	//const [index, setIndex] = useState(0);

	const [selected, setSelected] = useState<Notification | null>(null);
	const [visible, setVisible] = useState(false);

	const translateX = useRef(new Animated.Value(width)).current;

	const animation = useRef<Animated.CompositeAnimation | null>(null);

	useEffect(() => {
		const unsubscribe = subscribeNotifications(setNotifications);

		return unsubscribe;
	}, []);

	useEffect(() => {
		if (notifications.length === 0) return;

		startAnimation();
	}, [notifications]);
	const CARD_WIDTH = width * 0.82 + 12;

	const startAnimation = () => {
		translateX.setValue(0);

		animation.current = Animated.loop(
			Animated.timing(translateX, {
				toValue: -(notifications.length * CARD_WIDTH),
				duration: notifications.length * 4000,
				useNativeDriver: true,
			}),
		);

		animation.current.start();
	};

	const stopAnimation = () => {
		animation.current?.stop();
	};

	const closeNotification = () => {
		setVisible(false);

		setTimeout(() => {
			startAnimation();
		}, 100);
	};

	if (!notifications.length) return null;

	const marqueeNotifications = [...notifications, ...notifications];
	return (
		<>
			<View className="mt-8 mb-4 overflow-hidden">
				<Text className="mb-3 text-green-500 font-semibold text-lg">
					Notifications
				</Text>
				<Animated.View
					style={{
						flexDirection: "row",
						transform: [{ translateX }],
					}}
				>
					{marqueeNotifications.map((item, i) => {
						const important = item.category === "Importante";

						return (
							<Pressable
								key={`${item.id}-${i}`}
								onPressIn={stopAnimation}
								onPressOut={startAnimation}
								style={{
									width: width * 0.82,
									marginRight: 12,
								}}
							>
								<View
									className={`rounded-2xl p-5 ${
										important ? "bg-red-500" : "bg-blue-500"
									}`}
								>
									<View className="flex-row items-center">
										<Ionicons
											name={important ? "alert-circle" : "information-circle"}
											size={22}
											color="white"
										/>

										<Text className="text-white font-bold ml-2">
											{item.category}
										</Text>
										<Text className="text-white font-bold ml-auto ">
											Par: {item.createdByName}
										</Text>
									</View>

									<Text
										className="text-white text-xl font-bold mt-3"
										numberOfLines={2}
									>
										{item.title}
									</Text>
									<Pressable
										className="flex flex-row justify-end"
										onPress={() => {
											stopAnimation();
											setSelected(item);
											setVisible(true);
										}}
									>
										<Text className="text-white text-xs font-bold mt-2">
											Click pour plus de détails
										</Text>
									</Pressable>
								</View>
							</Pressable>
						);
					})}
				</Animated.View>
			</View>

			<Modal
				visible={visible}
				transparent
				animationType="fade"
				onRequestClose={closeNotification}
			>
				<View className="flex-1 justify-center items-center bg-black/50 px-5">
					<View className="bg-white rounded-3xl w-full p-6">
						<View className="flex-row justify-between items-center mb-4">
							<View className="flex-row items-center">
								<Ionicons
									name={
										selected?.category === "Importante"
											? "alert-circle"
											: "information-circle"
									}
									size={22}
									color={
										selected?.category === "Importante" ? "#ef4444" : "#3b82f6"
									}
								/>

								<Text
									className={`font-bold text-xl ml-2 ${selected?.category === "Importante" ? "text-red-500" : "text-blue-500"}`}
								>
									{selected?.category}
								</Text>
							</View>

							<Pressable onPress={closeNotification}>
								<Ionicons
									name="close"
									size={28}
									color="black"
								/>
							</Pressable>
						</View>

						<Text className="font-bold text-2xl mb-4">{selected?.title}</Text>

						<ScrollView
							style={{
								maxHeight: 350,
							}}
							showsVerticalScrollIndicator={false}
						>
							<Text className="text-gray-700 text-lg leading-7">
								{selected?.description}
							</Text>
							<Text className="text-gray-700 font-bold ml-auto ">
								Par : {selected?.createdByName}
							</Text>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</>
	);
}

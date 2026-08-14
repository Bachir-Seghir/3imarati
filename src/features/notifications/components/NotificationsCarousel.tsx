import { useEffect, useState } from "react";
import {
	Dimensions,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";

import Carousel from "react-native-reanimated-carousel";

import { Ionicons } from "@expo/vector-icons";

import { subscribeNotifications } from "../services/norification.service";
import { Notification } from "../types/notification";

const { width } = Dimensions.get("window");

export default function NotificationsCarousel() {
	const [notifications, setNotifications] = useState<Notification[]>([]);

	const [selected, setSelected] = useState<Notification | null>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const unsubscribe = subscribeNotifications(setNotifications);

		return unsubscribe;
	}, []);

	const closeNotification = () => {
		setVisible(false);
	};

	if (!notifications.length) return null;

	return (
		<>
			<View className="mt-[60px]">
				<Text className="mb-1 mx-auto text-slate-700 font-semibold text-2xl">
					Notifications
				</Text>
				<Carousel
					loop
					autoPlay={true}
					autoPlayInterval={1000}
					scrollAnimationDuration={1500}
					width={width}
					height={180}
					data={notifications}
					pagingEnabled={true}
					snapEnabled={false}
					mode="parallax"
					renderItem={({ item }: { item: any }) => {
						const important = item.category === "Importante";

						return (
							<Pressable
								onPress={() => {
									setSelected(item);
									setVisible(true);
								}}
								style={{
									width: width,
									alignSelf: "center",
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

										<Text className="text-white font-bold text-lg ml-2">
											{item.category}
										</Text>
										<Text className="text-white font-bold text-lg ml-auto">
											Par : {item.createdByName}
										</Text>
									</View>

									<Text
										className="text-white font-bold text-xl mt-3"
										numberOfLines={2}
									>
										{item.title}
									</Text>
									<View className="flex-row justify-between">
										<Text className="text-white mt-4 opacity-80">
											Appuyez pour afficher plus...
										</Text>
										<Text className="text-white mt-4 opacity-80">
											{item.createdAt?.toDate?.()?.toLocaleDateString()}
										</Text>
									</View>
								</View>
							</Pressable>
						);
					}}
				/>
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

							<View className="flex-row justify-between mt-3">
								<Text className="text-gray-700">
									{selected?.createdAt?.toDate?.()?.toLocaleDateString()}
								</Text>
								<Text className="text-gray-700 font-bold ml-auto ">
									Par : {selected?.createdByName}
								</Text>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>
		</>
	);
}

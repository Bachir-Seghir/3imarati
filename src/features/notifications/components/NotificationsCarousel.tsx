import { useEffect, useState } from "react";
import {
	Dimensions,
	Image,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";

import { subscribeNotifications } from "../services/norification.service";
import { Notification } from "../types/notification";

const { width, height } = Dimensions.get("window");

export default function NotificationsCarousel() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [selected, setSelected] = useState<Notification | null>(null);
	const [visible, setVisible] = useState(false);
	const [imageVisible, setImageVisible] = useState(false);

	useEffect(() => {
		const unsubscribe = subscribeNotifications(setNotifications);
		return unsubscribe;
	}, []);

	const closeNotification = () => {
		setVisible(false);
	};

	const closeImage = () => {
		setImageVisible(false);
	};

	if (!notifications.length) return null;

	return (
		<>
			<View>
				<Text className="mb-1 mx-auto text-slate-700 font-semibold text-xl">
					Notifications
				</Text>

				<Carousel
					loop
					autoPlay
					autoPlayInterval={1000}
					scrollAnimationDuration={1500}
					width={width}
					height={180}
					data={notifications}
					pagingEnabled
					snapEnabled={false}
					mode="parallax"
					renderItem={({ item }: { item: Notification }) => {
						const important = item.category === "Importante";

						return (
							<Pressable
								onPress={() => {
									setSelected(item);
									setVisible(true);
								}}
								style={{
									width,
									alignSelf: "center",
								}}
							>
								<View
									className={`rounded-2xl p-5 ${
										important ? "bg-red-500" : "bg-green-700"
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

										<Text className="text-white font-bold text-sm ml-auto">
											Par : {item.createdByName}
										</Text>
									</View>

									<Text
										className="text-white font-bold text-lg mt-3"
										numberOfLines={2}
									>
										{item.title.slice(0, 30)}...
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

			{/* Notification details modal */}
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
										selected?.category === "Importante" ? "#ef4444" : "#065F46"
									}
								/>

								<Text
									className={`font-bold text-xl ml-2 ${
										selected?.category === "Importante"
											? "text-red-500"
											: "text-green-800"
									}`}
								>
									{selected?.category}
								</Text>
							</View>

							<Pressable
								onPress={closeNotification}
								hitSlop={10}
							>
								<Ionicons
									name="close"
									size={28}
									color="black"
								/>
							</Pressable>
						</View>

						<Text className="font-bold text-2xl mb-4">{selected?.title}</Text>

						<ScrollView
							style={{ maxHeight: height * 0.55 }}
							showsVerticalScrollIndicator={false}
						>
							<Text className="text-gray-700 text-lg leading-7">
								{selected?.description}
							</Text>

							{/* View image link: shown only if an image exists */}
							{selected?.imageUrl ? (
								<Pressable
									onPress={() => setImageVisible(true)}
									className="flex-row items-center self-start mt-5 rounded-xl bg-green-50 px-4 py-3"
								>
									<Ionicons
										name="image-outline"
										size={22}
										color="#065F46"
									/>
									<Text className="ml-2 font-semibold text-green-800 underline">
										Voir l’image
									</Text>
									<Ionicons
										name="open-outline"
										size={18}
										color="#065F46"
										style={{ marginLeft: 8 }}
									/>
								</Pressable>
							) : null}

							<View className="flex-row justify-between mt-5 mb-2">
								<Text className="text-gray-700">
									{selected?.createdAt?.toDate?.()?.toLocaleDateString()}
								</Text>

								<Text className="text-gray-700 font-bold ml-3">
									Par : {selected?.createdByName}
								</Text>
							</View>
						</ScrollView>
					</View>
				</View>
			</Modal>

			{/* Full-screen image preview modal */}
			<Modal
				visible={imageVisible}
				transparent
				animationType="fade"
				onRequestClose={closeImage}
			>
				<View className="flex-1 justify-center items-center bg-black">
					<Pressable
						onPress={closeImage}
						className="absolute top-12 right-5 z-10 rounded-full bg-white/20 p-2"
						accessibilityLabel="Fermer l’image"
					>
						<Ionicons
							name="close"
							size={30}
							color="white"
						/>
					</Pressable>

					{selected?.imageUrl ? (
						<Image
							source={{ uri: selected.imageUrl }}
							style={{
								width: width,
								height: height * 0.8,
							}}
							resizeMode="contain"
						/>
					) : null}

					<Pressable
						onPress={closeImage}
						className="absolute bottom-10 rounded-xl bg-white px-6 py-3"
					>
						<Text className="font-semibold text-gray-900">Fermer</Text>
					</Pressable>
				</View>
			</Modal>
		</>
	);
}

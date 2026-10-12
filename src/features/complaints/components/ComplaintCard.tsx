import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { hasAnyRole } from "@/src/utils/RolesCheck";

type ComplaintCardProps = {
	complaint: any;
	currentUserId?: string;
	profile: any;
	onTake: (complaint: any) => void;
	onRelease: (complaint: any) => void;
	onResolve: (complaint: any) => void;
};

function getStatusColor(status: string) {
	switch (status) {
		case "En_Attente":
			return "text-red-400";
		case "En_Traitement":
			return "text-yellow-500";
		case "Résolue":
			return "text-green-500";
		default:
			return "text-gray-500";
	}
}

export default function ComplaintCard({
	complaint,
	currentUserId,
	profile,
	onTake,
	onRelease,
	onResolve,
}: ComplaintCardProps) {
	const [imageVisible, setImageVisible] = useState(false);

	const isAdmin = hasAnyRole(profile, ["admin", "superAdmin"]);
	const isAssignee = complaint.assignedToId === currentUserId;
	const canManage = isAssignee || isAdmin;

	return (
		<>
			<View className="rounded-xl border border-slate-200 bg-white shadow-sm">
				{/* Complaint information */}
				<View className="p-4">
					<Text className="text-base font-bold text-gray-800">
						Titre : {complaint.title}
					</Text>

					<Text className="mt-1 text-sm leading-5 text-gray-600">
						Détails : {complaint.description}
					</Text>

					{/* Image link */}
					{complaint.imageUrl ? (
						<Pressable
							onPress={() => setImageVisible(true)}
							className="mt-4 flex-row items-center self-start rounded-lg bg-green-50 px-3 py-2"
							accessibilityRole="button"
							accessibilityLabel="Voir l'image de la réclamation"
						>
							<Ionicons
								name="image-outline"
								size={21}
								color="#065F46"
							/>
							<Text className="ml-2 font-semibold text-green-800 underline">
								Voir l’image
							</Text>
							<Ionicons
								name="open-outline"
								size={17}
								color="#065F46"
								style={{ marginLeft: 6 }}
							/>
						</Pressable>
					) : null}
				</View>

				{/* Status and actions */}
				<View className="gap-y-2 rounded-b-xl bg-slate-100 p-3">
					<View className="flex-row flex-wrap justify-between gap-2">
						<Text className="text-sm font-bold text-gray-600">
							Catégorie : {complaint.category}
						</Text>

						<Text
							className={`text-sm font-semibold ${getStatusColor(
								complaint.status,
							)}`}
						>
							État : {complaint.status}
						</Text>
					</View>

					<View className="items-end">
						<Text
							className={`text-sm font-bold ${
								complaint.priority === "Importante"
									? "text-red-500"
									: "text-gray-700"
							}`}
						>
							Priorité : {complaint.priority}
						</Text>
					</View>

					<View className="flex-row flex-wrap justify-between gap-1">
						<Text className="text-sm font-semibold text-green-800">
							Créé par :
						</Text>

						<Text className="text-sm font-semibold text-green-800">
							{complaint.userName} - {complaint.floor}-{complaint.door}
						</Text>
					</View>

					{complaint.assignedToName ? (
						<View className="flex-row flex-wrap items-center justify-between gap-1">
							<View className="flex-row items-center">
								<Ionicons
									name="person-circle-outline"
									size={18}
									color="#F97316"
								/>
								<Text className="ml-1 text-sm font-semibold text-orange-500">
									Pris en charge par :
								</Text>
							</View>

							<Text className="text-sm font-semibold text-orange-500">
								{complaint.assignedToName}
							</Text>
						</View>
					) : null}

					{complaint.status === "En_Attente" ? (
						<Pressable
							className="mt-1 rounded-lg bg-orange-500 p-3"
							onPress={() => onTake(complaint)}
							accessibilityRole="button"
						>
							<Text className="text-center text-sm font-semibold text-white">
								Prendre en charge
							</Text>
						</Pressable>
					) : null}

					<View className="flex-row gap-2">
						{complaint.status === "En_Traitement" && isAssignee ? (
							<Pressable
								className="mt-1 flex-[2] rounded-lg bg-gray-500 p-3"
								onPress={() => onRelease(complaint)}
								accessibilityRole="button"
							>
								<Text className="text-center text-sm font-semibold text-white">
									Ne pas prendre en charge
								</Text>
							</Pressable>
						) : null}

						{complaint.status === "En_Traitement" && canManage ? (
							<Pressable
								className="mt-1 flex-1 rounded-lg bg-green-600 p-3"
								onPress={() => onResolve(complaint)}
								accessibilityRole="button"
							>
								<Text className="text-center text-sm font-semibold text-white">
									Résolue
								</Text>
							</Pressable>
						) : null}
					</View>
				</View>
			</View>

			{/* Full-screen image preview */}
			<Modal
				visible={imageVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setImageVisible(false)}
			>
				<View className="flex-1 items-center justify-center bg-black">
					<Pressable
						onPress={() => setImageVisible(false)}
						className="absolute right-5 top-12 z-10 rounded-full bg-white/20 p-2"
						accessibilityRole="button"
						accessibilityLabel="Fermer l'image"
					>
						<Ionicons
							name="close"
							size={30}
							color="white"
						/>
					</Pressable>

					{complaint.imageUrl ? (
						<ScrollView
							className="flex-1 w-full"
							contentContainerStyle={{
								flexGrow: 1,
								justifyContent: "center",
							}}
							maximumZoomScale={3}
							centerContent
						>
							<Image
								source={{ uri: complaint.imageUrl }}
								style={{
									width: "100%",
									height: 450,
								}}
								resizeMode="contain"
							/>
						</ScrollView>
					) : null}

					<Pressable
						onPress={() => setImageVisible(false)}
						className="mb-10 rounded-xl bg-white px-8 py-3"
					>
						<Text className="font-semibold text-gray-900">Fermer</Text>
					</Pressable>
				</View>
			</Modal>
		</>
	);
}

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
	const [detailsVisible, setDetailsVisible] = useState(false);
	const isAdmin = hasAnyRole(profile, ["admin", "superAdmin"]);
	const isAssignee = complaint.assignedToId === currentUserId;
	const canManage = isAssignee || isAdmin;

	return (
		<>
			<View className="rounded-xl border border-slate-200 bg-white shadow-sm">
				{/* Complaint information */}
				<View className="p-4">
					<Text className="text-xs mb-2 font-bold text-gray-400">
						N° : {complaint.complaintNumber}
					</Text>
					<Text className="text-base font-bold text-gray-800">
						Titre : {complaint.title}
					</Text>

					<Text className="mt-1 text-sm leading-5 text-gray-600">
						Détails : {complaint.description.slice(0, 40)}...
					</Text>
					<Pressable
						onPress={() => setDetailsVisible(true)}
						className="w-[60%] mt-4 mx-auto flex-row items-center justify-center rounded-lg bg-gray-200 py-2 px-3"
						accessibilityRole="button"
					>
						<Ionicons
							name="eye-outline"
							size={20}
							color="#065F46"
						/>
						<Text className="ml-2 font-semibold text-green-700">
							Voir les détails
						</Text>
					</Pressable>
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
			{/* Complaint details modal */}
			<Modal
				visible={detailsVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setDetailsVisible(false)}
			>
				<View className="flex-1 justify-center bg-black/50 p-4">
					<View className="max-h-[85%] overflow-hidden rounded-2xl bg-white">
						{/* Modal header */}
						<View className="flex-row items-center justify-between bg-green-800 p-4">
							<View className="flex-1">
								<Text className="text-lg font-bold text-white">
									Détails de la réclamation
								</Text>

								<Text className="mt-1 text-sm text-green-100">
									N° {complaint.complaintNumber ?? "Non attribué"}
								</Text>
							</View>

							<Pressable
								onPress={() => setDetailsVisible(false)}
								accessibilityRole="button"
								accessibilityLabel="Fermer les détails"
								className="ml-3 rounded-full p-2"
							>
								<Ionicons
									name="close"
									size={26}
									color="#FFFFFF"
								/>
							</Pressable>
						</View>

						{/* Scrollable details */}
						<ScrollView
							showsVerticalScrollIndicator
							contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
						>
							{/* Complaint number */}
							<Text className="text-sm font-medium text-gray-500">
								Numéro de réclamation
							</Text>

							<Text className="mb-4 text-base font-bold text-green-800">
								{complaint.complaintNumber ?? "Non attribué"}
							</Text>

							{/* Title */}
							<Text className="text-sm font-medium text-gray-500">Titre</Text>

							<Text className="mb-4 text-base font-bold text-gray-900">
								{complaint.title}
							</Text>

							{/* Creator */}
							<View className="mb-4 rounded-xl bg-green-50 p-3">
								<View className="mb-2 flex-row items-center">
									<Ionicons
										name="person-circle-outline"
										size={22}
										color="#065F46"
									/>

									<Text className="ml-2 text-sm font-semibold text-green-800">
										Créée par
									</Text>
								</View>

								<Text className="text-base font-bold text-gray-900">
									{complaint.userName ??
										complaint.createdByName ??
										"Nom indisponible"}
								</Text>

								<Text className="mt-1 text-sm text-gray-600">
									Étage : {complaint.floor ?? "-"}
									{"  •  "}
									Porte : {complaint.door ?? "-"}
								</Text>
							</View>

							{/* Full description */}
							<Text className="text-sm font-medium text-gray-500">
								Description complète
							</Text>

							<Text className="mb-5 mt-2 text-base leading-6 text-gray-800">
								{complaint.description || "Aucune description"}
							</Text>

							{/* Images displayed directly */}
							{complaint.imageUrl ? (
								<View>
									<Text className="mb-3 text-sm font-semibold text-gray-700">
										Photos jointes
									</Text>

									<Pressable
										onPress={() => setImageVisible(true)}
										accessibilityRole="button"
										accessibilityLabel="Agrandir la photo"
									>
										<Image
											source={{ uri: complaint.imageUrl }}
											resizeMode="contain"
											style={{
												width: "100%",
												height: 280,
												borderRadius: 12,
												backgroundColor: "#F3F4F6",
											}}
										/>
									</Pressable>

									<Text className="mt-2 text-center text-xs text-gray-500">
										Appuyez sur la photo pour l’agrandir
									</Text>
								</View>
							) : (
								<View className="rounded-lg bg-gray-50 p-3">
									<Text className="text-sm text-gray-500">
										Aucune photo jointe
									</Text>
								</View>
							)}
						</ScrollView>

						{/* Footer */}
						<View className="border-t border-gray-200 p-3">
							<Pressable
								onPress={() => setDetailsVisible(false)}
								className="items-center rounded-xl bg-green-800 p-3"
								accessibilityRole="button"
							>
								<Text className="font-semibold text-white">Fermer</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>

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

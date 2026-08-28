import { useState } from "react";
import { Alert, Image, Modal, Pressable, Text, View } from "react-native";
import {
	deleteUser,
	updateUserProfile,
} from "../features/auth/services/user.service";
import { UserProfile } from "../types/user";
type UserItem = UserProfile & { id: string };
export const UserItemCard = ({ user }: { user: UserItem }) => {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const handleApproveUser = async (uid: string) => {
		Alert.alert(
			"Approuver utilisateur",
			"Voulez-vous vraiment Approuver cet utilisateur ?",
			[
				{ text: "Annuler", style: "cancel" },
				{
					text: "Approuver",
					style: "default",
					onPress: async () => {
						try {
							await updateUserProfile(uid, {
								approved: true,
							});
						} catch (e) {
							console.log("APPROVE USER ERROR", e);
						}
					},
				},
			],
		);
	};
	const handleDeleteUser = (uid: string) => {
		Alert.alert(
			"Supprimer utilisateur",
			"Voulez-vous vraiment supprimer cet utilisateur ?",
			[
				{ text: "Annuler", style: "cancel" },
				{
					text: "Supprimer",
					style: "destructive",
					onPress: async () => {
						try {
							await deleteUser(uid);
						} catch (e) {
							console.log("DELETE USER ERROR", e);
						}
					},
				},
			],
		);
	};
	return (
		<View className="bg-white p-4 rounded-md mb-4 shadow">
			<Text className="font-bold text-lg">{user.fullName}</Text>
			<Text>{user.email}</Text>
			<Text>
				Floor: {user.floor} | Door: {user.door}
			</Text>
			<Text>Num Tél: {user.phone}</Text>
			<View className="flex flex-row gap-x-2 justify-between">
				{user.identityImage && (
					<Pressable
						onPress={() => setSelectedImage(user.identityImage)}
						className="bg-blue-600 mt-3 p-2 rounded-md"
					>
						<Text className="text-white text-center font-semibold">
							Piece d'identité
						</Text>
					</Pressable>
				)}

				{/* 🟢 APPROVAL */}
				{!user.approved && (
					<Pressable
						onPress={() => handleApproveUser(user.id)}
						className="bg-green-600 p-2 mt-3 rounded"
					>
						<Text className="text-white text-center">Approver</Text>
					</Pressable>
				)}
				<Pressable
					onPress={() => handleDeleteUser(user.id)}
					className="bg-red-600 p-2 mt-3 rounded"
				>
					<Text className="text-white text-center">Supprimer</Text>
				</Pressable>
			</View>

			{/* This modal show identity card on full mode */}
			<Modal
				visible={!!selectedImage}
				transparent={true}
				animationType="fade"
			>
				<View className="flex-1 bg-black justify-center items-center">
					{/* ❌ Close button */}
					<Pressable
						onPress={() => setSelectedImage(null)}
						className="absolute top-12 right-6 z-10"
					>
						<Text className="text-white text-3xl font-bold">✕</Text>
					</Pressable>

					{/* 🖼 Full image */}
					{selectedImage && (
						<Image
							source={{ uri: selectedImage }}
							style={{ width: "100%", height: "80%" }}
							resizeMode="contain"
						/>
					)}
				</View>
			</Modal>
		</View>
	);
};

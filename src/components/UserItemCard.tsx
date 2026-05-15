import { useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { updateUserProfile } from "../features/auth/services/user.service";
import { UserProfile } from "../types/user";
type UserItem = UserProfile & { id: string };
export const UserItemCard = ({ user }: { user: UserItem }) => {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const handleApproveUser = async (uid: string) => {
		try {
			await updateUserProfile(uid, {
				approved: true,
			});
		} catch (e) {
			console.log("APPROVE USER ERROR", e);
		}
	};

	return (
		<View className="bg-white p-4 rounded-md mb-4 shadow">
			<Text className="font-bold text-lg">{user.fullName}</Text>
			<Text>{user.email}</Text>
			<Text>
				Floor: {user.floor} | Door: {user.door}
			</Text>
			{user.identityImage && (
				<Pressable
					className="pt-3"
					onPress={() => setSelectedImage(user.identityImage)}
				>
					<View className="relative">
						<Image
							source={{ uri: user.identityImage }}
							className="w-full h-48 rounded-xl"
							resizeMode="cover"
						/>

						{/* 🔹 Overlay */}
						<View className="absolute inset-0 bg-black/40 rounded-xl items-center justify-center">
							<Text className="text-white font-semibold text-lg">
								Appuyer pour Voire
							</Text>
							<Text className="text-white font-semibold text-lg">
								Piece d'identité
							</Text>
						</View>
					</View>
				</Pressable>
			)}

			{/* 🟢 APPROVAL */}
			{!user.approved && (
				<Pressable
					onPress={() => handleApproveUser(user.id)}
					className="bg-green-600 p-2 mt-3 rounded"
				>
					<Text className="text-white text-center">Approve User</Text>
				</Pressable>
			)}
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

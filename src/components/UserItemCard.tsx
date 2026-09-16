import { Alert, Pressable, Text, View } from "react-native";
import {
	deleteUser,
	updateUserProfile,
} from "../features/auth/services/user.service";
import { UserProfile } from "../types/user";
type UserItem = UserProfile & { id: string };
export const UserItemCard = ({ user }: { user: UserItem }) => {
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
				{/* 🟢 APPROVAL */}
				{!user.approved && (
					<Pressable
						onPress={() => handleApproveUser(user.id)}
						className="bg-green-600 p-2 mt-3 rounded"
					>
						<Text className="text-white text-center">Approuver</Text>
					</Pressable>
				)}
				<Pressable
					onPress={() => handleDeleteUser(user.id)}
					className="bg-red-600 p-2 mt-3 rounded"
				>
					<Text className="text-white text-center">Supprimer</Text>
				</Pressable>
			</View>
		</View>
	);
};

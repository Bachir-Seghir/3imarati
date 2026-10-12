import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import {
	deleteUser,
	updateUserProfile,
} from "../features/auth/services/user.service";
import { UserProfile } from "../types/user";

type UserItem = UserProfile & { id: string };

export const UserItemCard = ({ user }: { user: UserItem }) => {
	const [confirmVisible, setConfirmVisible] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const handleApproveUser = async (uid: string) => {
		try {
			await updateUserProfile(uid, {
				approved: true,
			});
		} catch (e) {
			console.log("APPROVE USER ERROR", e);
		}
	};

	const handleConfirmDelete = async () => {
		if (deleting) return;

		setDeleting(true);

		try {
			await deleteUser(user.id);
			setConfirmVisible(false);
		} catch (e) {
			console.log("DELETE USER ERROR", e);
		} finally {
			setDeleting(false);
		}
	};

	return (
		<>
			<View className="bg-white p-4 rounded-md mb-4 shadow">
				<Text className="font-bold text-lg">{user.fullName}</Text>
				<Text>{user.email}</Text>
				<Text>
					Étage : {user.floor} | Porte: {user.door}
				</Text>
				<Text>Num Tél: {user.phone}</Text>

				<View className="flex flex-row gap-x-2 justify-between">
					{!user.approved && (
						<Pressable
							onPress={() => handleApproveUser(user.id)}
							className="bg-green-600 p-2 mt-3 rounded"
						>
							<Text className="text-white text-center">Approuver</Text>
						</Pressable>
					)}

					{!user.roles.includes("superAdmin") && (
						<Pressable
							onPress={() => setConfirmVisible(true)}
							className="bg-red-600 p-2 mt-3 rounded"
						>
							<Text className="text-white text-center">Supprimer</Text>
						</Pressable>
					)}
				</View>
			</View>

			<Modal
				visible={confirmVisible}
				transparent
				animationType="fade"
				onRequestClose={() => {
					if (!deleting) setConfirmVisible(false);
				}}
			>
				<View className="flex-1 bg-black/50 justify-center items-center px-6">
					<View className="bg-white rounded-2xl p-5 w-full max-w-md">
						<Text className="text-xl font-bold mb-3">
							Supprimer cet utilisateur ?
						</Text>

						<Text className="text-gray-600 mb-5">
							Voulez-vous vraiment supprimer le compte de{" "}
							<Text className="font-semibold text-gray-900">
								{user.fullName}
							</Text>{" "}
							? Cette action est irréversible.
						</Text>

						<Pressable
							onPress={handleConfirmDelete}
							disabled={deleting}
							className={`rounded-lg p-3 mb-3 ${
								deleting ? "bg-red-300" : "bg-red-600"
							}`}
						>
							<Text className="text-white text-center font-semibold">
								{deleting ? "Suppression..." : "Confirmer la suppression"}
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setConfirmVisible(false)}
							disabled={deleting}
							className="bg-gray-100 rounded-lg p-3"
						>
							<Text className="text-gray-700 text-center font-semibold">
								Retour
							</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		</>
	);
};

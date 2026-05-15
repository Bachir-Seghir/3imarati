import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { db } from "../services/firebase";
import { UserProfile } from "../types/user";
import { UserItemCard } from "./UserItemCard";

type UserItem = UserProfile & { id: string };

export const UsersList = () => {
	const [users, setUsers] = useState<UserItem[]>([]);

	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const q = query(collection(db, "users"));

		const unsubUsers = onSnapshot(q, (snapshot) => {
			const list: UserItem[] = snapshot.docs.map((doc) => ({
				id: doc.id,
				...(doc.data() as UserProfile),
			}));
			const sorted = [...list].sort((a, b) => {
				return Number(a.approved) - Number(b.approved);
			});

			setUsers(sorted);
			setLoading(false);
		});

		return () => {
			unsubUsers();
		};
	}, []);

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center">
				<ActivityIndicator />
			</View>
		);
	}

	return (
		<>
			<Text className="text-xl font-bold mb-4">
				({users.length}) Acquéreurs
			</Text>
			{users.map((user: UserItem) => (
				<UserItemCard
					user={user}
					key={user.id}
				/>
			))}
		</>
	);
};

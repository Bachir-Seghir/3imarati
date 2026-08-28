import Screen from "@/src/components/Screen";
import { UserItemCard } from "@/src/components/UserItemCard";
import { db } from "@/src/services/firebase";
import { UserProfile } from "@/src/types/user";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

type UserItem = UserProfile & { id: string };

const UsersList = () => {
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
		<Screen>
			<ScrollView
				className="flex-1 h-full px-4"
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<Text className="text-2xl font-bold mb-4 mx-auto">
					({users.length}) Liste des Résidents
				</Text>
				{users.map((user: UserItem) => (
					<UserItemCard
						user={user}
						key={user.id}
					/>
				))}
			</ScrollView>
		</Screen>
	);
};

export default UsersList;

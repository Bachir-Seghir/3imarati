import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { db } from "@/src/services/firebase";
import { hasAnyRole } from "@/src/utils/RolesCheck";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type UserRole = "resident" | "admin" | "budgetManager" | "superAdmin";

type User = {
	id: string;
	fullName: string;
	email: string;
	roles: UserRole[];
	approved: boolean;
};

const availableRoles: {
	label: string;
	value: UserRole;
	required?: boolean;
}[] = [
	{ label: "Résident", value: "resident", required: true },
	{ label: "Admin", value: "admin" },
	{ label: "Gestionnaire Budget", value: "budgetManager" },
	{ label: "Super Admin", value: "superAdmin" },
];

export default function RolesScreen() {
	const { profile } = useAuth();

	const [users, setUsers] = useState<User[]>([]);

	if (!hasAnyRole(profile, ["superAdmin"])) {
		return <Redirect href="/(tabs)" />;
	}

	useEffect(() => {
		const unsubscribe = onSnapshot(collection(db, "users"), (snap) => {
			const data = snap.docs.map((item) => ({
				id: item.id,
				...item.data(),
			})) as User[];

			setUsers(data);
		});

		return unsubscribe;
	}, []);

	const toggleRole = async (user: User, role: UserRole) => {
		// Resident is mandatory
		if (role === "resident") {
			return;
		}

		const currentRoles = user.roles ?? [];
		const hasRole = currentRoles.includes(role);

		if (hasRole) {
			const newRoles = currentRoles.filter((item) => item !== role);

			await updateDoc(doc(db, "users", user.id), {
				roles: newRoles,
			});

			return;
		}

		await updateDoc(doc(db, "users", user.id), {
			roles: [...currentRoles, role],
		});
	};

	return (
		<Screen>
			<ScrollView
				className="flex-1 px-4 pt-6"
				contentContainerStyle={{
					paddingBottom: 120,
				}}
			>
				<Text className="text-2xl font-bold text-center mb-6">
					Gestion des rôles
				</Text>

				{users.map((user) => (
					<View
						key={user.id}
						className="bg-white rounded-xl p-4 mb-4"
					>
						<Text className="text-lg font-bold text-gray-800">
							{user.fullName}
						</Text>

						<Text className="text-gray-500 mb-4">{user.email}</Text>

						<View className="flex-row flex-wrap gap-2">
							{availableRoles.map((role) => {
								const active = user.roles?.includes(role.value) ?? false;
								const required = role.required === true;

								return (
									<Pressable
										key={role.value}
										disabled={required}
										onPress={() => toggleRole(user, role.value)}
										className={`flex-row items-center px-3 py-2 rounded-lg ${
											active ? "bg-blue-600" : "bg-gray-200"
										} ${required ? "opacity-90" : ""}`}
									>
										<Ionicons
											name={active ? "checkmark-circle" : "ellipse-outline"}
											size={18}
											color={active ? "white" : "#6b7280"}
										/>

										<Text
											className={`ml-2 font-semibold ${
												active ? "text-white" : "text-gray-700"
											}`}
										>
											{role.label}
										</Text>
									</Pressable>
								);
							})}
						</View>
					</View>
				))}
			</ScrollView>
		</Screen>
	);
}

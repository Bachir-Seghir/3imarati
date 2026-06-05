import { useAuth } from "@/src/features/auth/context/AuthContext";
import { db } from "@/src/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function TabsLayout() {
	const { user, profile, loading } = useAuth();
	const [pendingCount, setPendingCount] = useState(0);
	const router = useRouter();

	useEffect(() => {
		if (!user) {
			router.replace("/auth/login");
		}
	}, [user]);

	if (!user) return null;
	const canManage =
		profile?.role === "admin" || profile?.role === "budget_manager";

	useEffect(() => {
		if (!canManage) return;

		const unsub = onSnapshot(collection(db, "budget_requests"), (snap) => {
			const count = snap.docs.filter((doc) => {
				return doc.data().status === "pending";
			}).length;

			setPendingCount(count);
		});

		return () => unsub();
	}, [canManage]);
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#eb7125",
				tabBarStyle: {
					height: 80,
					paddingTop: 6,
					paddingBottom: 6,
					borderTopWidth: 0,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name="home-outline"
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="complaints"
				options={{
					title: "Plaintes",
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name="chatbubble-outline"
							size={size}
							color={color}
						/>
					),
				}}
			/>

			<Tabs.Screen
				name="payments"
				options={{
					title: "Paiments",
					tabBarBadge: canManage && pendingCount > 0 ? pendingCount : undefined,
					tabBarBadgeStyle: { backgroundColor: "red" },
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name="card-outline"
							size={size}
							color={color}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Compte",
					tabBarIcon: ({ color, size }) => (
						<Ionicons
							name="person-outline"
							size={size}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}

import { ComplaintsFilter } from "@/src/components/ComplaintsFilter";
import Screen from "@/src/components/Screen";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import ComplaintCard from "@/src/features/complaints/components/ComplaintCard";
import { db } from "@/src/services/firebase";
import { hasAnyRole } from "@/src/utils/RolesCheck";
import {
	collection,
	doc,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Platform, ScrollView, Text } from "react-native";
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

export default function ComplaintsScreen() {
	const { user, profile } = useAuth();

	const [complaints, setComplaints] = useState<any[]>([]);
	const [filteredComplaints, setFilteredComplaints] = useState<any[]>([]);
	const [filterActive, setFilterActive] = useState(false);

	useEffect(() => {
		const q = query(collection(db, "complaints"), orderBy("createdAt", "desc"));

		const unsubscribe = onSnapshot(q, (snap) => {
			const data = snap.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			setComplaints(data);
			setFilteredComplaints(data);
		});

		return () => unsubscribe();
	}, []);
	const handleTakeComplaint = async (complaint: any) => {
		await updateDoc(doc(db, "complaints", complaint.id), {
			status: "En_Traitement",
			assignedToId: user?.uid,
			assignedToName: profile?.fullName,
			assignedAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});
	};
	const handleReleaseComplaint = async (complaint: any) => {
		if (!user) return;

		const isAdmin = hasAnyRole(profile, ["admin", "superAdmin"]);
		const isAssignee = complaint.assignedToId === user.uid;

		// Assignee, admin or superAdmin can release the complaint
		if (!isAssignee && !isAdmin) return;

		await updateDoc(doc(db, "complaints", complaint.id), {
			status: "En_Attente",
			assignedToId: null,
			assignedToName: null,
			assignedAt: null,
			updatedAt: serverTimestamp(),
		});
	};
	const handleResolveComplaint = async (complaint: any) => {
		if (!user) return;

		const isAdmin = hasAnyRole(profile, ["admin", "superAdmin"]);
		const isAssignee = complaint.assignedToId === user.uid;

		// Only the assignee, admin or superAdmin can resolve
		if (!isAssignee && !isAdmin) return;

		await updateDoc(doc(db, "complaints", complaint.id), {
			status: "Résolue",
			resolvedAt: serverTimestamp(),
			resolvedById: user.uid,
			resolvedByName: profile?.fullName,
			updatedAt: serverTimestamp(),
		});
	};
	return (
		<Screen>
			<ScrollView
				className="flex-1 px-2"
				contentContainerStyle={{
					paddingBottom: Platform.OS === "ios" ? 60 : 100,
					gap: 20,
				}}
			>
				<Text className="text-xl mx-auto font-bold">Réclamations</Text>

				<ComplaintsFilter
					data={complaints}
					onFilter={setFilteredComplaints}
					onActiveChange={setFilterActive}
					highlight={filterActive}
					currentUserId={user?.uid}
					currentUserName={profile?.fullName}
				/>

				{filteredComplaints.map((item) => (
					<ComplaintCard
						key={item.id}
						complaint={item}
						currentUserId={user?.uid}
						profile={profile}
						onTake={handleTakeComplaint}
						onRelease={handleReleaseComplaint}
						onResolve={handleResolveComplaint}
					/>
				))}
			</ScrollView>
		</Screen>
	);
}

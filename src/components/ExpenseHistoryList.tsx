import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";
import { db } from "../services/firebase";

type Expense = {
	id: string;
	title: string;
	description: string;
	amount: number;
	imageUrl: string | null;
	createdAt: any;
};

export const ExpenseHistoryList = () => {
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	// 📚 Expenses history
	useEffect(() => {
		const q = query(
			collection(db, "budget_expenses"),
			orderBy("createdAt", "desc"),
		);

		const unsub = onSnapshot(q, (snap) => {
			const data: Expense[] = snap.docs.map((doc) => ({
				id: doc.id,
				...(doc.data() as Omit<Expense, "id">),
			}));

			setExpenses(data);
		});

		return () => unsub();
	}, []);

	return (
		<>
			<Text className="text-2xl font-bold mb-4 text-slate-800 mt-6">
				Historique des Dépenses
			</Text>

			{expenses.map((expense) => (
				<View
					key={expense.id}
					className="bg-white p-4 rounded-xl mb-3 border border-slate-200"
				>
					<Text className="text-lg font-bold text-slate-800">
						{expense.title}
					</Text>

					<Text className="text-red-600 font-semibold mt-1">
						- {expense.amount} DA
					</Text>

					{expense.description ? (
						<Text className="text-slate-600 mt-2">{expense.description}</Text>
					) : null}

					<Text className="text-slate-500 mt-2">
						{expense.createdAt?.toDate()?.toLocaleDateString()}
					</Text>

					{expense.imageUrl && (
						<Pressable
							onPress={() => setSelectedImage(expense.imageUrl)}
							className="bg-blue-600 mt-3 p-2 rounded-md"
						>
							<Text className="text-white text-center font-semibold">
								Voir Facture ou Photo
							</Text>
						</Pressable>
					)}
				</View>
			))}
			<Modal
				visible={!!selectedImage}
				transparent
				animationType="fade"
			>
				<View className="flex-1 bg-black/95 justify-center items-center px-4">
					{/* Close button */}
					<Pressable
						onPress={() => setSelectedImage(null)}
						className="absolute top-16 right-6 z-50 bg-black/50 rounded-full w-10 h-10 items-center justify-center"
					>
						<Text className="text-white text-xl font-bold">✕</Text>
					</Pressable>

					{/* Full image */}
					<Image
						source={{ uri: selectedImage || undefined }}
						className="w-full h-[80%]"
						resizeMode="contain"
					/>
				</View>
			</Modal>
		</>
	);
};

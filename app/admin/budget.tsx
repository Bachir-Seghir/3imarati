import { ExpenseHistoryList } from "@/src/components/ExpenseHistoryList";
import Screen from "@/src/components/Screen";
import { addToBudget } from "@/src/features/payments/services/budget.service";
import { db, storage } from "@/src/services/firebase";
import * as ImagePicker from "expo-image-picker";
import {
	addDoc,
	collection,
	doc,
	increment,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import {
	ActivityIndicator,
	Image,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

const BudgetSection = () => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [addAmount, setAddAmount] = useState("");
	const [processing, setProcessing] = useState(false);

	const [image, setImage] = useState<string | null>(null);

	const [loading, setLoading] = useState(false);

	const handleAddSolde = async () => {
		const amount = Number(addAmount);

		if (!amount || amount <= 0) {
			alert("Veuillez saisir un montant valide.");
			return;
		}

		try {
			setProcessing(true);

			await addToBudget(amount);

			alert("Solde ajouté ✔");
		} catch (error) {
			console.error(error);
			alert("Erreur lors de la transaction");
		} finally {
			setProcessing(false);
		}
	};

	const takePhoto = async () => {
		// 🔐 permission for camera
		const permission = await ImagePicker.requestCameraPermissionsAsync();

		if (!permission.granted) {
			alert("Permission caméra refusée");
			return;
		}

		// 📸 open camera
		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: false,
			quality: 0.7,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	// 📸 Pick image
	const pickImage = async () => {
		// 🔐 Ask permission
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permission.granted) {
			alert("Permission d'accès aux photos refusée");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: "images", // ✅ new API
			allowsEditing: false,
			quality: 0.7,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};

	// 💾 Submit expense
	const handleSubmit = async () => {
		if (!title || !amount) {
			alert("Veuillez remplir les champs");
			return;
		}

		try {
			setLoading(true);

			let imageUrl = null;

			// 🖼 Upload image
			if (image) {
				const response = await fetch(image);
				const blob = await response.blob();

				const fileName = `expenses/${Date.now()}.jpg`;

				const storageRef = ref(storage, fileName);

				await uploadBytes(storageRef, blob);

				imageUrl = await getDownloadURL(storageRef);
			}

			// ➕ Add expense document
			await addDoc(collection(db, "budget_expenses"), {
				title,
				description,
				amount: Number(amount),
				imageUrl,
				createdAt: serverTimestamp(),
			});

			// ➖ subtract from budget
			const budgetRef = doc(db, "budget", "main");

			await updateDoc(budgetRef, {
				amount: increment(-Number(amount)),
			});

			// 🔄 reset
			setTitle("");
			setDescription("");
			setAmount("");
			setImage(null);

			alert("Dépense ajoutée");
		} catch (e) {
			console.log("EXPENSE ERROR:", e);
			alert("Erreur");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Screen>
			<ScrollView
				className="flex-1 h-full px-4"
				contentContainerStyle={{
					paddingBottom: Platform.OS === "ios" ? 60 : 100,
					gap: 20,
					flexGrow: 1,
				}}
			>
				<Text className="text-2xl font-bold mb-5 mx-auto text-slate-800">
					Gestion du Budget
				</Text>
				<View className="bg-white px-3 py-4 rounded-lg">
					<Text className="font-semibold mb-2">Ajouter un solde</Text>

					<TextInput
						value={addAmount}
						onChangeText={setAddAmount}
						keyboardType="numeric"
						placeholder="Montant"
						className="bg-white border border-slate-200 p-3 rounded-md mb-4"
					/>
					<Pressable
						onPress={handleAddSolde}
						disabled={processing}
						className="bg-green-700 p-4 rounded-md"
					>
						{processing ? (
							<ActivityIndicator color="white" />
						) : (
							<Text className="text-white text-center font-bold">
								Ajouter au solde
							</Text>
						)}
					</Pressable>
				</View>
				<View className="bg-white px-3 py-4 rounded-lg">
					{/* Title */}
					<Text className="font-semibold mb-2">Titre</Text>

					<TextInput
						value={title}
						onChangeText={setTitle}
						placeholder="Ex: Achat peinture"
						className="bg-white border border-slate-200 p-3 rounded-md mb-4"
					/>

					{/* Description */}
					<Text className="font-semibold mb-2">Description</Text>

					<TextInput
						value={description}
						onChangeText={setDescription}
						placeholder="Description..."
						multiline
						className="bg-white border border-slate-200 p-3 rounded-md mb-4 min-h-[100px]"
					/>

					{/* Amount */}
					<Text className="font-semibold mb-2">Montant</Text>

					<TextInput
						value={amount}
						onChangeText={setAmount}
						placeholder="5000"
						keyboardType="numeric"
						className="bg-white border border-slate-200 p-3 rounded-md mb-4"
					/>

					{/* Image picker */}
					<Text className="font-semibold mb-2">
						Photo justifcatif ou facture
					</Text>
					<View className="flex-row gap-2 mb-6">
						<Pressable
							onPress={takePhoto}
							className="bg-blue-600 p-3 rounded-md flex-1"
						>
							<Text className="text-white text-center font-semibold">
								Prendre photo
							</Text>
						</Pressable>

						<Pressable
							onPress={pickImage}
							className="bg-gray-600 p-3 rounded-md flex-1"
						>
							<Text className="text-white text-center font-semibold">
								Galerie
							</Text>
						</Pressable>
					</View>

					{/* Preview */}
					{image && (
						<Image
							source={{ uri: image }}
							className="w-full h-52 rounded-md mb-4"
							resizeMode="cover"
						/>
					)}

					{/* Submit */}
					<Pressable
						onPress={handleSubmit}
						disabled={loading}
						className="bg-red-600 p-4 rounded-md"
					>
						{loading ? (
							<ActivityIndicator color="white" />
						) : (
							<Text className="text-white text-center font-bold">
								Ajouter Dépense
							</Text>
						)}
					</Pressable>
				</View>
				<ExpenseHistoryList />
			</ScrollView>
		</Screen>
	);
};

export default BudgetSection;

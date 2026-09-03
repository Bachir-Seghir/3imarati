import Screen from "@/src/components/Screen";

import { useAuth } from "@/src/features/auth/context/AuthContext";
import { updateUserProfile } from "@/src/features/auth/services/user.service";
import { auth } from "@/src/services/firebase";

import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import {
	EmailAuthProvider,
	reauthenticateWithCredential,
	signOut,
	updatePassword,
} from "firebase/auth";

import { useEffect, useState } from "react";

import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

export default function ProfileScreen() {
	const { user, profile, loading } = useAuth();

	// ==========================================
	// PROFILE
	// ==========================================

	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [floor, setFloor] = useState("");
	const [door, setDoor] = useState("");

	const [saving, setSaving] = useState(false);

	// ==========================================
	// PASSWORD
	// ==========================================

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [changingPassword, setChangingPassword] = useState(false);

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// ==========================================
	// LOAD PROFILE
	// ==========================================

	useEffect(() => {
		if (!profile) return;

		setFullName(profile.fullName || "");
		setPhone(profile.phone || "");
		setFloor(profile.floor?.toString() || "");
		setDoor(profile.door?.toString() || "");
	}, [profile]);

	// ==========================================
	// PROFILE CHANGES
	// ==========================================

	const hasProfileChanges =
		fullName !== (profile?.fullName || "") ||
		phone !== (profile?.phone || "") ||
		floor !== (profile?.floor?.toString() || "") ||
		door !== (profile?.door?.toString() || "");

	const handleSaveProfile = async () => {
		if (!user) return;

		if (!fullName.trim()) {
			Alert.alert("Erreur", "Veuillez saisir votre nom.");
			return;
		}

		if (!phone.trim()) {
			Alert.alert("Erreur", "Veuillez saisir votre numéro de téléphone.");
			return;
		}

		if (!floor.trim() || !door.trim()) {
			Alert.alert(
				"Erreur",
				"Veuillez saisir votre étage et votre numéro de porte.",
			);
			return;
		}

		try {
			setSaving(true);

			await updateUserProfile(user.uid, {
				fullName: fullName.trim(),
				phone: phone.trim(),
				floor: Number(floor),
				door: Number(door),
			});

			Alert.alert("Succès", "Votre profil a été mis à jour.");
		} catch (error) {
			console.log("UPDATE PROFILE ERROR:", error);

			Alert.alert("Erreur", "Impossible de mettre à jour votre profil.");
		} finally {
			setSaving(false);
		}
	};

	// ==========================================
	// CHANGE PASSWORD
	// ==========================================

	const handleChangePassword = async () => {
		if (!user || !user.email) return;

		if (!currentPassword || !newPassword || !confirmPassword) {
			Alert.alert("Erreur", "Veuillez remplir tous les champs.");
			return;
		}

		if (newPassword.length < 6) {
			Alert.alert(
				"Erreur",
				"Le nouveau mot de passe doit contenir au moins 6 caractères.",
			);
			return;
		}

		if (newPassword !== confirmPassword) {
			Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas.");
			return;
		}

		if (currentPassword === newPassword) {
			Alert.alert(
				"Erreur",
				"Le nouveau mot de passe doit être différent de l'ancien.",
			);
			return;
		}

		try {
			setChangingPassword(true);

			// Firebase requires recent authentication
			const credential = EmailAuthProvider.credential(
				user.email,
				currentPassword,
			);

			await reauthenticateWithCredential(user, credential);

			await updatePassword(user, newPassword);

			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");

			Alert.alert("Succès", "Votre mot de passe a été modifié avec succès.");
		} catch (error: any) {
			console.log("CHANGE PASSWORD ERROR:", error);

			if (error?.code === "auth/invalid-credential") {
				Alert.alert("Erreur", "L'ancien mot de passe est incorrect.");
			} else if (error?.code === "auth/wrong-password") {
				Alert.alert("Erreur", "L'ancien mot de passe est incorrect.");
			} else if (error?.code === "auth/weak-password") {
				Alert.alert("Erreur", "Le nouveau mot de passe est trop faible.");
			} else {
				Alert.alert("Erreur", "Impossible de modifier le mot de passe.");
			}
		} finally {
			setChangingPassword(false);
		}
	};

	// ==========================================
	// LOGOUT
	// ==========================================

	const handleLogout = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.log("LOGOUT ERROR:", error);
		}
	};

	// ==========================================
	// LOADING
	// ==========================================

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center">
				<ActivityIndicator />
			</View>
		);
	}

	if (!user) {
		return <Redirect href="/auth/login" />;
	}

	if (!profile?.approved) {
		return <Redirect href="/auth/pending" />;
	}

	// ==========================================
	// UI
	// ==========================================

	return (
		<Screen>
			<ScrollView
				className="flex-1 px-4"
				contentContainerStyle={{
					paddingBottom: 120,
				}}
				showsVerticalScrollIndicator={false}
			>
				<View className="p-4">
					{/* ================================= */}
					{/* HEADER */}
					{/* ================================= */}

					<View className="flex-row justify-between items-center mb-6">
						<Text className="text-2xl font-bold text-slate-800">
							Mon Compte
						</Text>

						<Pressable
							onPress={handleLogout}
							className="flex-row items-center bg-red-100 px-3 py-2 rounded-lg"
						>
							<Text className="text-red-600 font-semibold mr-2">Sortir</Text>

							<Ionicons
								name="exit-outline"
								size={22}
								color="red"
							/>
						</Pressable>
					</View>

					{/* ================================= */}
					{/* PROFILE INFORMATION */}
					{/* ================================= */}

					<View className="bg-white rounded-2xl p-5 mb-6">
						<Text className="text-xl font-bold text-gray-800 mb-5">
							Informations personnelles
						</Text>

						{/* Email */}

						<Text className="font-bold text-gray-700 mb-2">Email</Text>

						<TextInput
							value={user?.email}
							className="border border-gray-300 p-3 rounded-md mb-4"
							readOnly
						/>
						{/* Full Name */}

						<Text className="font-bold text-gray-700 mb-2">Nom & Prénom</Text>

						<TextInput
							value={fullName}
							onChangeText={setFullName}
							placeholder="Nom & Prénom"
							className="border border-gray-300 p-3 rounded-md mb-4"
						/>

						{/* Phone */}

						<Text className="font-bold text-gray-700 mb-2">
							Numéro de téléphone
						</Text>

						<TextInput
							value={phone}
							onChangeText={setPhone}
							placeholder="0770xxxxxx"
							keyboardType="phone-pad"
							className="border border-gray-300 p-3 rounded-md mb-4"
						/>
						<View className="flex-row gap-x-6 justify-evenly">
							{/* Floor */}
							<View>
								<Text className="font-bold text-gray-700 mb-2">N˚ Étage</Text>

								<TextInput
									value={floor}
									onChangeText={setFloor}
									placeholder="N˚ Étage"
									keyboardType="numeric"
									className="border border-gray-300 p-3 rounded-md mb-4"
								/>
							</View>

							{/* Door */}
							<View>
								<Text className="font-bold text-gray-700 mb-2">N˚ Porte</Text>

								<TextInput
									value={door}
									onChangeText={setDoor}
									placeholder="N˚ Porte"
									keyboardType="numeric"
									className="border border-gray-300 p-3 rounded-md mb-5"
								/>
							</View>
						</View>

						{/* Save */}

						<Pressable
							onPress={handleSaveProfile}
							disabled={saving || !hasProfileChanges}
							className={`p-3 rounded-md ${
								saving || !hasProfileChanges ? "bg-gray-400" : "bg-blue-600"
							}`}
						>
							{saving ? (
								<ActivityIndicator color="white" />
							) : (
								<Text className="text-white text-center font-semibold">
									Enregistrer les modifications
								</Text>
							)}
						</Pressable>
					</View>

					{/* ================================= */}
					{/* PASSWORD */}
					{/* ================================= */}

					<View className="bg-white rounded-2xl p-5">
						<Text className="text-xl font-bold text-gray-800 mb-2">
							Modifier le mot de passe
						</Text>

						<Text className="text-gray-500 mb-5">
							Pour votre sécurité, confirmez votre ancien mot de passe.
						</Text>

						{/* Current password */}

						<Text className="font-bold text-gray-700 mb-2">
							Mot de passe actuel
						</Text>

						<View className="relative mb-4">
							<TextInput
								value={currentPassword}
								onChangeText={setCurrentPassword}
								placeholder="Mot de passe actuel"
								secureTextEntry={!showCurrentPassword}
								className="border border-gray-300 p-3 pr-12 rounded-md"
							/>

							<Pressable
								onPress={() => setShowCurrentPassword((prev) => !prev)}
								className="absolute right-3 top-3"
							>
								<Ionicons
									name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
									size={22}
									color="#6b7280"
								/>
							</Pressable>
						</View>

						{/* New password */}

						<Text className="font-bold text-gray-700 mb-2">
							Nouveau mot de passe
						</Text>

						<View className="relative mb-4">
							<TextInput
								value={newPassword}
								onChangeText={setNewPassword}
								placeholder="Nouveau mot de passe"
								secureTextEntry={!showNewPassword}
								className="border border-gray-300 p-3 pr-12 rounded-md"
							/>

							<Pressable
								onPress={() => setShowNewPassword((prev) => !prev)}
								className="absolute right-3 top-3"
							>
								<Ionicons
									name={showNewPassword ? "eye-off-outline" : "eye-outline"}
									size={22}
									color="#6b7280"
								/>
							</Pressable>
						</View>

						{/* Confirm password */}

						<Text className="font-bold text-gray-700 mb-2">
							Confirmer le nouveau mot de passe
						</Text>

						<View className="relative mb-5">
							<TextInput
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								placeholder="Confirmer le nouveau mot de passe"
								secureTextEntry={!showConfirmPassword}
								className="border border-gray-300 p-3 pr-12 rounded-md"
							/>

							<Pressable
								onPress={() => setShowConfirmPassword((prev) => !prev)}
								className="absolute right-3 top-3"
							>
								<Ionicons
									name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
									size={22}
									color="#6b7280"
								/>
							</Pressable>
						</View>

						<Pressable
							onPress={handleChangePassword}
							disabled={changingPassword}
							className={`p-3 rounded-md ${
								changingPassword ? "bg-gray-400" : "bg-orange-600"
							}`}
						>
							{changingPassword ? (
								<ActivityIndicator color="white" />
							) : (
								<Text className="text-white text-center font-semibold">
									Modifier le mot de passe
								</Text>
							)}
						</Pressable>
					</View>
				</View>
			</ScrollView>
		</Screen>
	);
}

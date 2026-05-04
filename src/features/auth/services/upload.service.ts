import { storage } from "@/src/services/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const uploadIdentityImage = async (uri: string, uid: string) => {
    try {
        // 1. Convert URI → Blob (CRITICAL STEP)
        const response = await fetch(uri);
        const blob = await response.blob();

        // 2. Create storage reference
        const fileRef = ref(storage, `users/${uid}/identity.jpg`);

        // 3. Upload file
        await uploadBytes(fileRef, blob);

        // 4. Get download URL
        const downloadURL = await getDownloadURL(fileRef);

        return downloadURL;
    } catch (error) {
        console.log("UPLOAD ERROR:", error);
        throw error;
    }
};
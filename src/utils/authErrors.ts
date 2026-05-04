export const getAuthErrorMessage = (error: any): string => {
    const code = error?.code;

    switch (code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-email":
            return "Invalid email or password";

        case "auth/email-already-in-use":
            return "This email is already registered";

        case "auth/weak-password":
            return "Password should be at least 6 characters";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection";

        default:
            return "Something went wrong. Please try again";
    }
};
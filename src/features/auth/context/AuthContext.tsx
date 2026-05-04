import { createContext, useContext } from "react";
import { useAuthState } from "../hooks/useAuthState";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
	const auth = useAuthState();

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

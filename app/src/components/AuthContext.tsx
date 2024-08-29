"use client";

import { useToast } from "@/components/ui/use-toast";
import { getSession, signIn, signOut, signUp } from "@/lib/supabase/authServer";
import { Session } from "@/lib/supabase/supabaseSessionMapper";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthContextType = {
  session: Session | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType | null => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const session = await getSession();
        setSession(session);
      } catch (error) {
        console.error("Error initializing session:", error);
      }
    };

    initializeSession();
  }, []);

  const handleSignIn = useCallback(
    async (email: string, password: string) => {
      try {
        const session = await signIn(email, password);
        setSession(session);
        return true;
      } catch (error: any) {
        toast({ title: "Error", description: error.message });
        return false;
      }
    },
    [toast],
  );

  const handleSignUp = useCallback(
    async (email: string, password: string) => {
      try {
        const session = await signUp(email, password);
        setSession(session);
        return true;
      } catch (error: any) {
        toast({ title: "Error", description: error.message });
        return false;
      }
    },
    [toast],
  );

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setSession(null);
      return true;
    } catch (error: any) {
      toast({ title: "Error", description: error.message });
      return false;
    }
  }, [toast]);

  return (
    <AuthContext.Provider
      value={{
        session,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

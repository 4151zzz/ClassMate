import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  givenName?: string;
  familyName?: string;
}

const GOOGLE_AUTH_STORAGE_KEY = "classmate_google_auth_user";

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const saved = localStorage.getItem(GOOGLE_AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const isAuthenticated = !!user;

  // Save or remove user state
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to persist auth user:", e);
    }
  }, [user]);

  // Login action (supports direct Gmail login and Google OAuth profile)
  const login = useCallback(
    (userData: { email: string; name?: string; picture?: string }) => {
      const cleanEmail = userData.email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        toast.error("กรุณาระบุที่อยู่อีเมล Gmail ที่ถูกต้อง");
        return false;
      }

      // Generate avatar fallback if none provided
      const defaultName = userData.name || cleanEmail.split("@")[0];
      const avatarUrl =
        userData.picture ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          defaultName
        )}&backgroundColor=0284c7,0ea5e9,00f0ff`;

      const newUser: GoogleUser = {
        id: `g_${btoa(cleanEmail).replace(/=/g, "")}`,
        email: cleanEmail,
        name: defaultName,
        picture: avatarUrl,
      };

      setUser(newUser);
      toast.success(`เข้าสู่ระบบด้วย Google สำเร็จ: ${cleanEmail}`);
      return true;
    },
    []
  );

  // Logout action
  const logout = useCallback(() => {
    setUser(null);
    toast.info("ออกจากระบบเรียบร้อยแล้ว");
  }, []);

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}

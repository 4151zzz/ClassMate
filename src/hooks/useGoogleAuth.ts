import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getPermanentPortfolioUid, getCachedPortfolio } from "@/lib/cloudShare";

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

      // Check if we have cached portfolio for this email to get their real name and avatar immediately!
      let knownName = userData.name;
      let knownPicture = userData.picture;

      if (!knownName) {
        try {
          const accountUid = getPermanentPortfolioUid(cleanEmail);
          const cached = getCachedPortfolio(accountUid);
          if (cached && cached.student?.fullName) {
            knownName = cached.student.fullName;
            knownPicture = cached.student.avatar || knownPicture;
          }
        } catch {}
      }

      const defaultName = knownName || cleanEmail.split("@")[0];
      const avatarUrl =
        knownPicture ||
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
      toast.success(
        knownName
          ? `เข้าสู่ระบบสำเร็จ: ${knownName}`
          : `เข้าสู่ระบบด้วย Gmail: ${cleanEmail}`
      );
      return true;
    },
    []
  );

  // Update user profile name and avatar from loaded portfolio
  const updateUserProfile = useCallback((name: string, picture?: string) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        name: name || prev.name,
        picture: picture || prev.picture,
      };
    });
  }, []);

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
    updateUserProfile,
  };
}

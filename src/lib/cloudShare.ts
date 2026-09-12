/**
 * ClassMate Practicum - Cloud Portfolio Sharing & UID Engine
 * Allows sharing lightweight URLs (e.g. https://class-mate-nine.vercel.app/?u=2MWsXOha1W)
 * instead of massive multi-thousand-character hash URLs.
 */
import { PracticumData } from "@/types/practicum";

const CLOUD_STORAGE_API = "https://bytebin.lucko.me";
const CACHE_PREFIX = "classmate_shared_u_";

export async function publishPortfolioToCloud(data: PracticumData): Promise<string> {
  try {
    // Clone data to avoid mutating original
    const payload = JSON.parse(JSON.stringify(data));

    // Optimize huge base64 images if they exceed safety thresholds (keep URLs intact)
    if (payload.student?.avatar?.startsWith("data:") && payload.student.avatar.length > 50000) {
      // Keep avatar as-is if reasonable, or leave intact
    }

    const response = await fetch(`${CLOUD_STORAGE_API}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Cloud server responded with status: ${response.status}`);
    }

    const result = await response.json();
    if (result && result.key) {
      // Cache locally as well
      saveCachedPortfolio(result.key, data);
      return result.key;
    }

    throw new Error("No UID returned from cloud storage");
  } catch (error) {
    console.error("publishPortfolioToCloud error:", error);
    throw error;
  }
}

export async function fetchPortfolioFromCloud(uid: string): Promise<PracticumData | null> {
  const cleanUid = (uid || "").trim();
  if (!cleanUid) return null;

  // 1. Try local cache first for instant render
  const cached = getCachedPortfolio(cleanUid);

  try {
    const response = await fetch(`${CLOUD_STORAGE_API}/${encodeURIComponent(cleanUid)}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const remoteData = (await response.json()) as PracticumData;
      if (remoteData && remoteData.student && remoteData.school) {
        saveCachedPortfolio(cleanUid, remoteData);
        return remoteData;
      }
    }
  } catch (err) {
    console.warn("fetchPortfolioFromCloud network error, falling back to cache if available:", err);
  }

  return cached;
}

export function saveCachedPortfolio(uid: string, data: PracticumData): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${CACHE_PREFIX}${uid}`, JSON.stringify(data));
    }
  } catch (e) {
    console.warn("Failed to cache portfolio in localStorage:", e);
  }
}

export function getCachedPortfolio(uid: string): PracticumData | null {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`${CACHE_PREFIX}${uid}`);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (e) {
    console.warn("Failed to read cached portfolio:", e);
  }
  return null;
}

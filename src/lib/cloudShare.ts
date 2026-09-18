/**
 * ClassMate Practicum - Cloud Portfolio Real-Time Sharing Engine
 * Enables permanent live URLs (e.g. https://class-mate-nine.vercel.app/?u=p_x8k2m9)
 * with instant real-time cloud updates and automatic synchronization.
 */
import LZString from "lz-string";
import { PracticumData } from "@/types/practicum";

// Primary High-Speed Key-Value Cloud Storage (with full CORS & overwrite support)
const KV_STORAGE_API = "https://kvdb.io/VUGiMZC6hMo3E8jgAEJ4J7";
// Fallback for legacy shared links
const LEGACY_BYTEBIN_API = "https://bytebin.lucko.me";
const CACHE_PREFIX = "classmate_shared_u_";
const PERMANENT_UID_KEY = "classmate_permanent_portfolio_uid";

export interface CloudPublishResult {
  uid: string;
  updatedAt: number;
}

export interface CloudFetchResult {
  data: PracticumData;
  updatedAt: number;
}

/**
 * Generate a clean, friendly 8-character permanent UID
 */
export function generatePortfolioUid(): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let randomStr = "";
  for (let i = 0; i < 7; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `p_${randomStr}`;
}

/**
 * Get or create permanent UID for the portfolio (stored in localStorage)
 */
export function getPermanentPortfolioUid(email?: string): string {
  if (typeof window === "undefined") return generatePortfolioUid();

  const key = email
    ? `${PERMANENT_UID_KEY}_${email.toLowerCase().trim()}`
    : PERMANENT_UID_KEY;

  let existing = localStorage.getItem(key);
  if (!existing) {
    // Check if there was a previous published UID we can adopt
    const lastPublished = localStorage.getItem("classmate_last_published_uid");
    if (lastPublished && !lastPublished.startsWith("http")) {
      existing = lastPublished;
    } else {
      existing = generatePortfolioUid();
    }
    localStorage.setItem(key, existing);
    localStorage.setItem(PERMANENT_UID_KEY, existing);
  }

  return existing;
}

/**
 * Set/update the permanent UID
 */
export function setPermanentPortfolioUid(uid: string, email?: string): void {
  if (typeof window === "undefined") return;
  const cleanUid = (uid || "").trim();
  if (!cleanUid) return;

  const key = email
    ? `${PERMANENT_UID_KEY}_${email.toLowerCase().trim()}`
    : PERMANENT_UID_KEY;

  localStorage.setItem(key, cleanUid);
  localStorage.setItem(PERMANENT_UID_KEY, cleanUid);
}

/**
 * Publish / Overwrite portfolio data on cloud in Real Time
 */
export async function publishPortfolioToCloud(
  data: PracticumData,
  targetUid?: string,
  userEmail?: string
): Promise<CloudPublishResult> {
  const cleanUid = (targetUid || getPermanentPortfolioUid(userEmail)).trim();
  const timestamp = Date.now();

  try {
    // Clone data to avoid mutating original state
    const payload = JSON.parse(JSON.stringify(data));

    // Package envelope with timestamp and compressed data for ultra-fast sync
    const jsonString = JSON.stringify(payload);
    const compressed = LZString.compressToBase64(jsonString);

    const envelope = {
      v: 2,
      updatedAt: timestamp,
      studentName: payload.student?.fullName || "",
      studentId: payload.student?.studentId || "",
      compressed,
    };

    const response = await fetch(`${KV_STORAGE_API}/${encodeURIComponent(cleanUid)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(envelope),
    });

    if (!response.ok) {
      throw new Error(`Cloud KV returned status ${response.status}`);
    }

    // Save to local cache
    saveCachedPortfolio(cleanUid, data, timestamp);
    setPermanentPortfolioUid(cleanUid, userEmail);

    return {
      uid: cleanUid,
      updatedAt: timestamp,
    };
  } catch (error) {
    console.error("publishPortfolioToCloud error:", error);
    throw error;
  }
}

/**
 * Fetch portfolio data from cloud (supports new KVdb format and legacy Bytebin)
 */
export async function fetchPortfolioFromCloud(uid: string): Promise<CloudFetchResult | null> {
  const cleanUid = (uid || "").trim();
  if (!cleanUid) return null;

  // 1. Try Primary Cloud KV
  try {
    const response = await fetch(`${KV_STORAGE_API}/${encodeURIComponent(cleanUid)}`, {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    });

    if (response.ok) {
      const result = await response.json();

      // Case A: New compressed envelope
      if (result && result.compressed) {
        const decompressed = LZString.decompressFromBase64(result.compressed);
        if (decompressed) {
          const parsed = JSON.parse(decompressed) as PracticumData;
          const updatedAt = result.updatedAt || Date.now();
          saveCachedPortfolio(cleanUid, parsed, updatedAt);
          return { data: parsed, updatedAt };
        }
      }

      // Case B: Direct PracticumData object
      if (result && result.student && result.school) {
        const updatedAt = result.updatedAt || Date.now();
        saveCachedPortfolio(cleanUid, result, updatedAt);
        return { data: result, updatedAt };
      }
    }
  } catch (err) {
    console.warn("KV fetch error, checking legacy bytebin and cache:", err);
  }

  // 2. Fallback to Legacy Bytebin (for backwards compatibility with previously shared links)
  try {
    const legacyResp = await fetch(`${LEGACY_BYTEBIN_API}/${encodeURIComponent(cleanUid)}`, {
      headers: { Accept: "application/json" },
    });

    if (legacyResp.ok) {
      const remoteData = (await legacyResp.json()) as PracticumData;
      if (remoteData && remoteData.student && remoteData.school) {
        saveCachedPortfolio(cleanUid, remoteData, Date.now());
        return { data: remoteData, updatedAt: Date.now() };
      }
    }
  } catch (err) {
    console.warn("Legacy cloud fetch error:", err);
  }

  // 3. Fallback to local cache if offline
  const cached = getCachedPortfolio(cleanUid);
  if (cached) {
    return { data: cached, updatedAt: getCachedUpdatedAt(cleanUid) };
  }

  return null;
}

/**
 * Lightweight check to see if remote portfolio has newer data
 */
export async function checkRemotePortfolioUpdate(
  uid: string,
  lastKnownUpdatedAt: number
): Promise<CloudFetchResult | null> {
  const cleanUid = (uid || "").trim();
  if (!cleanUid) return null;

  try {
    const response = await fetch(`${KV_STORAGE_API}/${encodeURIComponent(cleanUid)}`, {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    });

    if (response.ok) {
      const result = await response.json();
      const remoteUpdatedAt = result?.updatedAt || 0;

      // Only decompress and return if remote is newer
      if (remoteUpdatedAt > lastKnownUpdatedAt) {
        if (result.compressed) {
          const decompressed = LZString.decompressFromBase64(result.compressed);
          if (decompressed) {
            const parsed = JSON.parse(decompressed) as PracticumData;
            saveCachedPortfolio(cleanUid, parsed, remoteUpdatedAt);
            return { data: parsed, updatedAt: remoteUpdatedAt };
          }
        } else if (result.student && result.school) {
          saveCachedPortfolio(cleanUid, result, remoteUpdatedAt);
          return { data: result, updatedAt: remoteUpdatedAt };
        }
      }
    }
  } catch {
    // Silent fail on background polling
  }

  return null;
}

export function saveCachedPortfolio(uid: string, data: PracticumData, updatedAt = Date.now()): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${CACHE_PREFIX}${uid}`, JSON.stringify(data));
      localStorage.setItem(`${CACHE_PREFIX}${uid}_time`, String(updatedAt));
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

export function getCachedUpdatedAt(uid: string): number {
  try {
    if (typeof window !== "undefined") {
      const time = localStorage.getItem(`${CACHE_PREFIX}${uid}_time`);
      if (time) return parseInt(time, 10);
    }
  } catch {
    // ignore
  }
  return 0;
}


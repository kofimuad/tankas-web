import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://tankas-server.onrender.com";

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("tankas_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = Cookies.get("tankas_refresh");
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refresh_token: refresh,
          });
          Cookies.set("tankas_token", data.access_token, { expires: 7 });
          Cookies.set("tankas_refresh", data.refresh_token, { expires: 30 });
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(error.config);
        } catch {
          Cookies.remove("tankas_token");
          Cookies.remove("tankas_refresh");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  badge_tier: "bronze" | "silver" | "gold";
  role: string;
  email_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
  token_type: string;
  email_verified: boolean;
  message?: string;
}

export interface Issue {
  id: string;
  user_id: string;
  title: string;
  description: string;
  picture_url: string;
  latitude: number;
  longitude: number;
  priority: "low" | "medium" | "high";
  difficulty: "easy" | "medium" | "hard";
  ai_labels: string[];
  ai_confidence_score: number;
  points_assigned: number;
  status: "open" | "resolved" | "pending_review" | "rejected";
  location_source: string;
  created_at: string;
}

export interface Pledge {
  id: string;
  user_id: string;
  issue_id: string;
  pledge_type: "money" | "equipment" | "volunteer" | "other";
  description: string;
  quantity: number;
  amount: number | null;
  status: "pending" | "fulfilled" | "cancelled";
  pledger_name?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export const authApi = {
  signup: async (data: {
    email: string;
    username: string;
    password: string;
    display_name?: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post("/auth/signup", data);
    return res.data;
  },

  login: async (data: {
    username: string;
    password: string;
  }): Promise<AuthResponse> => {
    const res = await apiClient.post("/auth/login", data);
    return res.data;
  },

  verifyOTP: async (email: string, otp_code: string) => {
    const res = await apiClient.post("/auth/otp/verify", { email, otp_code });
    return res.data;
  },

  resendOTP: async (email: string) => {
    const res = await apiClient.post("/auth/otp/resend", { email });
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Issues API
// ---------------------------------------------------------------------------

export const issuesApi = {
  getAll: async (status?: string): Promise<Issue[]> => {
    const res = await apiClient.get("/issues", { params: { status } });
    return res.data;
  },

  getById: async (id: string): Promise<Issue> => {
    const res = await apiClient.get(`/issues/${id}`);
    return res.data;
  },

  getNearby: async (
    lat: number,
    lng: number,
    radius = 10,
  ): Promise<Issue[]> => {
    const res = await apiClient.get("/issues/nearby", {
      params: { latitude: lat, longitude: lng, radius_km: radius },
    });
    return res.data.issues || res.data;
  },

  create: async (formData: FormData): Promise<Issue> => {
    const res = await apiClient.post("/issues", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Pledges API
// ---------------------------------------------------------------------------

export const pledgesApi = {
  getByIssue: async (issueId: string) => {
    const res = await apiClient.get(`/issues/${issueId}/pledges`);
    return res.data.data;
  },

  create: async (
    issueId: string,
    data: {
      pledge_type: string;
      description: string;
      quantity?: number;
      amount?: number;
    },
  ) => {
    const res = await apiClient.post(`/issues/${issueId}/pledges`, data);
    return res.data.data;
  },

  cancel: async (pledgeId: string) => {
    const res = await apiClient.delete(`/pledges/${pledgeId}`);
    return res.data.data;
  },

  getMyPledges: async (status?: string) => {
    const res = await apiClient.get("/users/me/pledges", {
      params: { status },
    });
    return res.data.data;
  },
};

// ---------------------------------------------------------------------------
// Volunteers API
// ---------------------------------------------------------------------------

export const volunteersApi = {
  join: async (issueId: string) => {
    const res = await apiClient.post("/volunteers", { issue_id: issueId });
    return res.data;
  },

  getGroup: async (groupId: string) => {
    const res = await apiClient.get(`/volunteers/groups/${groupId}`);
    return res.data;
  },

  getProfile: async (userId: string) => {
    const res = await apiClient.get(`/volunteers/profile/${userId}`);
    return res.data;
  },
};

// ---------------------------------------------------------------------------
// Leaderboard API
// ---------------------------------------------------------------------------

export const leaderboardApi = {
  get: async (type = "points", locationFilter = "global") => {
    const res = await apiClient.get(`/leaderboards/${type}`, {
      params: { location_type: locationFilter },
    });
    return res.data.data;
  },

  getUserRank: async (userId: string, type = "points") => {
    const res = await apiClient.get(`/users/${userId}/rank`, {
      params: { leaderboard_type: type },
    });
    return res.data.data;
  },
};

// ---------------------------------------------------------------------------
// Payments API
// ---------------------------------------------------------------------------

export const paymentsApi = {
  redeemPoints: async (data: {
    points: number;
    email: string;
    callback_url?: string;
  }) => {
    const res = await apiClient.post("/payments/redeem-points", data);
    return res.data.data;
  },

  verifyPayment: async (reference: string) => {
    const res = await apiClient.get(`/payments/verify/${reference}`);
    return res.data.data;
  },

  withdrawMomo: async (data: {
    points: number;
    momo_number: string;
    momo_provider: string;
  }) => {
    const res = await apiClient.post("/payments/withdraw-momo", data);
    return res.data.data;
  },

  getHistory: async (type?: string) => {
    const res = await apiClient.get("/payments/history", {
      params: { payment_type: type },
    });
    return res.data.data;
  },

  getRates: async () => {
    const res = await apiClient.get("/payments/rates");
    return res.data.data;
  },
};

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

export const adminApi = {
  getOverview: async () => {
    const res = await apiClient.get("/admin/overview");
    return res.data.data;
  },

  getUsers: async (params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const res = await apiClient.get("/admin/users", { params });
    return res.data.data;
  },

  banUser: async (userId: string, reason: string) => {
    const res = await apiClient.post(`/admin/users/${userId}/ban`, { reason });
    return res.data.data;
  },

  getPendingIssues: async () => {
    const res = await apiClient.get("/admin/issues/pending-review");
    return res.data.data;
  },

  classifyIssue: async (
    issueId: string,
    data: {
      difficulty: string;
      priority: string;
      approved: boolean;
      notes?: string;
    },
  ) => {
    const res = await apiClient.post(`/admin/issues/${issueId}/classify`, data);
    return res.data.data;
  },
};

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export const setTokens = (token: string, refreshToken: string) => {
  Cookies.set("tankas_token", token, { expires: 7 });
  Cookies.set("tankas_refresh", refreshToken, { expires: 30 });
};

export const clearTokens = () => {
  Cookies.remove("tankas_token");
  Cookies.remove("tankas_refresh");
};

export const getToken = () => Cookies.get("tankas_token");

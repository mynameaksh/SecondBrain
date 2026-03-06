import { useEffect, useMemo, useState, type FormEvent } from "react";
import Button from "./components/Button";
import Card from "./components/Card";
import CreateContentModal from "./components/CreateContentModal";
import Sidebar, { type ContentFilter } from "./components/Sidebar";
import { PlusIcon } from "./icons/PlusIcon";
import { ShareIcon } from "./icons/ShareIcon";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const TOKEN_STORAGE_KEY = "secondbrain_token";
const USERNAME_STORAGE_KEY = "secondbrain_username";

type ContentType = "twitter" | "youtube";

interface ContentItem {
  id: string;
  title: string;
  link: string;
  type: ContentType;
  createdAt: string;
}

interface ContentResponse {
  content: ContentItem[];
}

interface ShareResponse {
  hash: string;
}

interface PublicBrainResponse {
  username: string;
  content: ContentItem[];
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {};
  const existingHeaders = options.headers as Record<string, string> | undefined;

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(existingHeaders ?? {}),
    },
  });

  let data: unknown = {};
  const text = await response.text();
  if (text) {
    data = JSON.parse(text);
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

function AuthScreen({
  onSignedIn,
}: {
  onSignedIn: (token: string, username: string) => void;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const normalizedUsername = username.trim().toLowerCase();

    try {
      if (mode === "signup") {
        await apiRequest<{ message: string }>("/api/v1/signup", {
          method: "POST",
          body: JSON.stringify({
            username: normalizedUsername,
            password,
          }),
        });
      }

      const signinResult = await apiRequest<{ token: string }>("/api/v1/signin", {
        method: "POST",
        body: JSON.stringify({
          username: normalizedUsername,
          password,
        }),
      });

      onSignedIn(signinResult.token, normalizedUsername);
    } catch (authError) {
      const message =
        authError instanceof Error ? authError.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f4ff] px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-[#4f469c]">Second Brain</h1>
        <p className="mb-4 mt-1 text-sm text-gray-500">
          {mode === "signin" ? "Sign in to continue" : "Create your account"}
        </p>

        <form className="space-y-3" onSubmit={handleAuth}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#7164c0]"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-[#7164c0]"
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            type="submit"
            variant="primary"
            text={loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
            disabled={loading}
            fullWidth
          />
        </form>

        <button
          type="button"
          className="mt-3 cursor-pointer text-sm text-[#4f469c] hover:underline"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function SharedBrainScreen({ shareHash }: { shareHash: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<PublicBrainResponse | null>(null);

  useEffect(() => {
    async function fetchPublicBrain() {
      setLoading(true);
      setError("");
      try {
        const result = await apiRequest<PublicBrainResponse>(`/api/v1/brain/${shareHash}`);
        setData(result);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : "Unable to load shared brain.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchPublicBrain();
  }, [shareHash]);

  if (loading) {
    return <div className="p-6">Loading shared brain...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-red-600">{error || "Shared brain not found."}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-6">
      <h1 className="mb-1 text-2xl font-semibold text-[#4f469c]">{data.username}'s Brain</h1>
      <p className="mb-5 text-sm text-gray-500">Publicly shared content</p>
      {data.content.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-gray-500">
          No content has been shared yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.content.map((item) => (
            <Card key={item.id} id={item.id} title={item.title} link={item.link} type={item.type} />
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem(USERNAME_STORAGE_KEY) ?? "user"
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<ContentFilter>("all");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const shareHash = useMemo(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    if (parts.length === 2 && parts[0] === "share") {
      return parts[1];
    }
    return null;
  }, []);

  useEffect(() => {
    async function fetchContent() {
      if (!token) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const query = filter === "all" ? "" : `?type=${filter}`;
        const result = await apiRequest<ContentResponse>(`/api/v1/content${query}`, {}, token);
        setContents(result.content);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : "Failed to load content.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void fetchContent();
  }, [token, filter]);

  function handleSignedIn(nextToken: string, nextUsername: string) {
    setToken(nextToken);
    setUsername(nextUsername);
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    localStorage.setItem(USERNAME_STORAGE_KEY, nextUsername);
  }

  function handleLogout() {
    setToken(null);
    setContents([]);
    setShareUrl("");
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USERNAME_STORAGE_KEY);
  }

  async function handleCreateContent(payload: {
    title: string;
    link: string;
    type: ContentType;
  }) {
    if (!token) {
      throw new Error("Please sign in again.");
    }

    setIsSubmitting(true);
    try {
      await apiRequest<{ message: string }>(
        "/api/v1/content",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token
      );

      const query = filter === "all" ? "" : `?type=${filter}`;
      const result = await apiRequest<ContentResponse>(`/api/v1/content${query}`, {}, token);
      setContents(result.content);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteContent(contentId: string) {
    if (!token) {
      return;
    }

    try {
      await apiRequest<{ message: string }>(
        `/api/v1/content/${contentId}`,
        { method: "DELETE" },
        token
      );
      setContents((existing) => existing.filter((item) => item.id !== contentId));
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Failed to delete content.";
      setError(message);
    }
  }

  async function handleShareBrain() {
    if (!token) {
      return;
    }

    try {
      const result = await apiRequest<ShareResponse>(
        "/api/v1/brain/share",
        {
          method: "POST",
          body: JSON.stringify({ share: true }),
        },
        token
      );

      const url = `${window.location.origin}/share/${result.hash}`;
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // Keep the link visible even if clipboard access is blocked.
      }
    } catch (shareError) {
      const message =
        shareError instanceof Error ? shareError.message : "Failed to generate share URL.";
      setError(message);
    }
  }

  if (shareHash) {
    return <SharedBrainScreen shareHash={shareHash} />;
  }

  if (!token) {
    return <AuthScreen onSignedIn={handleSignedIn} />;
  }

  return (
    <div className="bg-[#f6f7fb]">
      <Sidebar filter={filter} setFilter={setFilter} username={username} onLogout={handleLogout} />

      <main className="min-h-screen px-4 py-4 sm:ml-72 sm:px-6">
        <CreateContentModal
          open={modalOpen}
          isSubmitting={isSubmitting}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateContent}
        />

        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
          <Button
            onClick={() => setModalOpen(true)}
            variant="primary"
            text="Add Content"
            startIcon={<PlusIcon />}
          />
          <Button variant="secondary" text="Share Brain" startIcon={<ShareIcon />} onClick={handleShareBrain} />
        </div>

        {shareUrl ? (
          <div className="mb-3 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            Share link copied to clipboard:{" "}
            <a className="underline" href={shareUrl} target="_blank" rel="noreferrer">
              {shareUrl}
            </a>
          </div>
        ) : null}

        {error ? (
          <div className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-gray-500">
            Loading content...
          </div>
        ) : contents.length === 0 ? (
          <div className="rounded-md border border-dashed border-gray-300 bg-white p-6 text-gray-500">
            No content yet. Add your first link.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {contents.map((item) => (
              <Card
                key={item.id}
                id={item.id}
                title={item.title}
                link={item.link}
                type={item.type}
                onDelete={handleDeleteContent}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

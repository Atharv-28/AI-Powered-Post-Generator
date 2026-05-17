import { useEffect, useState } from "react";
import DraftBuilder from "../components/DraftBuilder";
import DraftList from "../components/DraftList";
import Header from "../components/Header";
import RecentPosts from "../components/RecentPosts";
import ToastStack from "../components/ToastStack";
import { useToasts } from "../hooks/useToasts";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [editPrompts, setEditPrompts] = useState({});
  const { toasts, addToast, removeToast } = useToasts();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "1") {
      setConnected(true);
      addToast("success", "LinkedIn connected.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("auth_error")) {
      const error = params.get("auth_error");
      const description = params.get("auth_error_description");
      addToast("error", `Auth error: ${error}${description ? ` - ${description}` : ""}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [addToast]);

  // API base (deployed backend on Render). Exposed via Vercel as NEXT_PUBLIC_API_BASE
  const API_BASE = (typeof window !== "undefined" && process?.env?.NEXT_PUBLIC_API_BASE) || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

  const formatLinkedInError = (data) => {
    if (!data) return "Unknown error";
    const err = data.error || data;
    const code = err.code || err.status;
    const message = err.message || err.error_description || "Request failed";
    if (String(code) === "403" || err.code === "ACCESS_DENIED") {
      return "LinkedIn permissions missing. Enable Share on LinkedIn + w_member_social and reconnect.";
    }
    if (String(code) === "422" || err.message?.includes("DUPLICATE_POST")) {
      return "LinkedIn rejected a duplicate post. Try a slightly different draft.";
    }
    return `${message}`;
  };

  const generateDrafts = async () => {
    addToast("info", "Generating drafts...", 4000);
    const res = await fetch(`${API_BASE}/api/content/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setDrafts(data.drafts || []);
      addToast("success", "Drafts ready.", 4000);
    } else {
      addToast("error", formatLinkedInError(data));
    }
  };

  const connectLinkedIn = () => {
    // start OAuth flow (opens auth service)
    window.location.href = `${API_BASE}/oauth/linkedin/start`;
  };

  const loadRecentPosts = async () => {
    addToast("info", "Loading recent posts...", 4000);
    const res = await fetch(`${API_BASE}/api/linkedin/recent-posts`);
    const data = await res.json();
    if (data.ok) {
      setRecentPosts(data.posts || []);
      addToast("success", "Recent posts loaded.", 4000);
    } else {
      addToast("error", formatLinkedInError(data));
    }
  };

  const publishDraft = async (text) => {
    addToast("info", "Publishing post...", 4000);
    const res = await fetch(`${API_BASE}/api/linkedin/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text
      })
    });
    const data = await res.json();
    if (data.ok) addToast("success", "Published.", 4000);
    else addToast("error", formatLinkedInError(data));
  };

  const updateEditPrompt = (index, value) => {
    setEditPrompts((prev) => ({ ...prev, [index]: value }));
  };


  const reviseDraft = async (index) => {
    const instruction = editPrompts[index];
    if (!instruction || !instruction.trim()) {
      addToast("error", "Add a change request first.");
      return;
    }

    addToast("info", "Rewriting draft...", 4000);
    const res = await fetch(`${API_BASE}/api/content/revise`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft: drafts[index], instruction })
    });
    const data = await res.json();
    if (data.ok && data.draft) {
      setDrafts((prev) => prev.map((item, i) => (i === index ? data.draft : item)));
      addToast("success", "Draft updated.", 4000);
    } else {
      addToast("error", formatLinkedInError(data));
    }
  };

  return (
    <main className="page">
      <ToastStack toasts={toasts} onClose={removeToast} />
      <div className="glow" />
      <section className="shell">
        <Header connected={connected} onConnect={connectLinkedIn} />
        <DraftBuilder
          prompt={prompt}
          onPromptChange={setPrompt}
          onGenerateDrafts={generateDrafts}
          onLoadRecent={loadRecentPosts}
          disableRecentReason="No API access yet"
        />
        <RecentPosts posts={recentPosts} />
        <DraftList
          drafts={drafts}
          editPrompts={editPrompts}
          onEditPromptChange={updateEditPrompt}
          onRevise={reviseDraft}
          onPublish={publishDraft}
        />
      </section>
    </main>
  );
}

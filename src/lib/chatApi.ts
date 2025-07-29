// src/lib/chatApi.ts

function getChatApiUrl() {
  let base = import.meta.env.VITE_RUST_API_URL;
  if (!base) return null;
  // Remove trailing slash if present
  if (base.endsWith("/")) base = base.slice(0, -1);
  return base + "/chat";
}

export async function sendChatMessage(prompt: string) {
  const url = getChatApiUrl();
  if (!url) {
    // If no API URL, return null to indicate fallback to dummy
    return null;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_prompt: prompt }),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch chat response");
  }
  const data = await res.json();

  const content = data.reply.trim();

  return { reply: content, actionData: null };
}

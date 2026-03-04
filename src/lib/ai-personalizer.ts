const BASE = "/api/ai";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json();
}

export async function initSession() {
  return fetchJSON<{
    sessionId: string;
    question: { id: string; text: string; options: string[] };
  }>(`${BASE}/init`);
}

export async function submitAnswer(sessionId: string, answer: string) {
  return fetchJSON<{
    success: boolean;
    nextQuestion: { id: string; text: string; options: string[] } | null;
  }>(`${BASE}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, answer }),
  });
}

export async function getNextQuestion(sessionId: string) {
  return fetchJSON<{
    question: { id: string; text: string; options: string[] } | null;
    currentStep: number;
    done: boolean;
  }>(`${BASE}/next?sessionId=${encodeURIComponent(sessionId)}`);
}

export async function getSuggestions(sessionId: string, k = 6) {
  return fetchJSON<{
    suggestions: Record<string, unknown>[];
    aiResponse: string;
  }>(`${BASE}/suggestion?sessionId=${encodeURIComponent(sessionId)}&k=${k}`);
}

export async function askFollowup(sessionId: string, question: string) {
  return fetchJSON<{ response: string }>(
    `${BASE}/followup?sessionId=${encodeURIComponent(sessionId)}&question=${encodeURIComponent(question)}`
  );
}

export async function goBack(sessionId: string) {
  return fetchJSON<{
    question: { id: string; text: string; options: string[] };
  }>(`${BASE}/back?sessionId=${encodeURIComponent(sessionId)}`);
}

export async function resetSession(sessionId: string) {
  return fetchJSON<{ success: boolean }>(
    `${BASE}/reset?sessionId=${encodeURIComponent(sessionId)}`
  );
}

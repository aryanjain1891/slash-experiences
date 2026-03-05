#!/usr/bin/env node

const BASE = process.argv[2] || "https://slashexperiences.in";
const results = [];

async function test(name, fn) {
  try {
    const result = await fn();
    results.push({ name, status: "PASS", detail: result });
    console.log(`  PASS  ${name}${result ? ` (${result})` : ""}`);
  } catch (err) {
    results.push({ name, status: "FAIL", detail: err.message });
    console.log(`  FAIL  ${name}: ${err.message}`);
  }
}

async function fetchJSON(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

console.log(`\nSmoke Testing: ${BASE}\n`);
console.log("=== API Endpoints ===\n");

await test("GET /api/experiences returns 200 with array", async () => {
  const { status, body } = await fetchJSON("/api/experiences");
  if (status !== 200) throw new Error(`Status ${status}`);
  const exps = body?.experiences;
  if (!Array.isArray(exps)) throw new Error(`Expected array, got ${typeof exps}`);
  return `${exps.length} experiences`;
});

await test("Experiences have snake_case fields", async () => {
  const { body } = await fetchJSON("/api/experiences?featured=true");
  const exp = body?.experiences?.[0];
  if (!exp) throw new Error("No featured experiences");
  if (!("image_url" in exp)) throw new Error("Missing image_url (has imageUrl?)");
  if (!("niche_category" in exp)) throw new Error("Missing niche_category");
  if (!("exp_type" in exp)) throw new Error("Missing exp_type");
  return "snake_case OK";
});

await test("Experience images are valid HTTPS URLs", async () => {
  const { body } = await fetchJSON("/api/experiences");
  const exps = body?.experiences || [];
  let broken = 0;
  for (const exp of exps) {
    const imgUrl = exp.image_url;
    if (!imgUrl) { broken++; continue; }
    try {
      const parsed = JSON.parse(imgUrl);
      const url = Array.isArray(parsed) ? parsed[0] : imgUrl;
      if (!url.startsWith("https://")) broken++;
    } catch {
      if (!imgUrl.startsWith("https://")) broken++;
    }
  }
  if (broken > 0) throw new Error(`${broken} experiences with non-HTTPS images`);
  return `All ${exps.length} images OK`;
});

await test("Category filter works (adventure)", async () => {
  const { status, body } = await fetchJSON("/api/experiences?category=adventure");
  if (status !== 200) throw new Error(`Status ${status}`);
  const exps = body?.experiences || [];
  if (exps.length === 0) throw new Error("No results for adventure");
  const wrongCat = exps.filter(e => e.category !== "adventure");
  if (wrongCat.length > 0) throw new Error(`${wrongCat.length} wrong category`);
  return `${exps.length} adventure experiences`;
});

await test("Search works", async () => {
  const { status, body } = await fetchJSON("/api/experiences?search=scuba");
  if (status !== 200) throw new Error(`Status ${status}`);
  const exps = body?.experiences || [];
  if (exps.length === 0) throw new Error("No results for 'scuba'");
  return `${exps.length} results`;
});

await test("GET /api/experiences/:id returns single experience", async () => {
  const { body: list } = await fetchJSON("/api/experiences");
  const id = list?.experiences?.[0]?.id;
  if (!id) throw new Error("No experience ID to test");
  const { status, body } = await fetchJSON(`/api/experiences/${id}`);
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!body?.experience) throw new Error("Missing experience in response");
  if (!body.experience.title) throw new Error("Missing title");
  return body.experience.title;
});

await test("GET /api/content/faqs returns data", async () => {
  const { status, body } = await fetchJSON("/api/content/faqs");
  if (status !== 200) throw new Error(`Status ${status}`);
  const items = Array.isArray(body) ? body : body?.items || [];
  if (items.length === 0) throw new Error("No FAQs returned");
  return `${items.length} FAQs`;
});

await test("Auth endpoint responds", async () => {
  const { status, body } = await fetchJSON("/api/auth/ok");
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!body?.ok) throw new Error("Auth not OK");
  return "Auth OK";
});

await test("Cart requires auth", async () => {
  const { status } = await fetchJSON("/api/cart");
  if (status !== 401) throw new Error(`Expected 401, got ${status}`);
  return "401 Unauthorized (correct)";
});

await test("Wishlist requires auth", async () => {
  const { status } = await fetchJSON("/api/wishlist");
  if (status !== 401) throw new Error(`Expected 401, got ${status}`);
  return "401 Unauthorized (correct)";
});

await test("AI init creates session", async () => {
  const { status, body } = await fetchJSON("/api/ai/init");
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!body?.sessionId) throw new Error("No sessionId");
  if (!body?.question) throw new Error("No question");
  return `Session: ${body.sessionId.substring(0, 8)}...`;
});

await test("Payment create-order requires auth", async () => {
  const { status } = await fetchJSON("/api/payment/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 100 }),
  });
  if (status !== 401) throw new Error(`Expected 401, got ${status}`);
  return "401 Unauthorized (correct)";
});

console.log("\n=== Page Routes ===\n");

const pageTests = [
  ["/", "Homepage"],
  ["/experiences", "All Experiences"],
  ["/experience/1db816d6-0ef5-413b-973e-3feb0d2487dc", "Experience Detail"],
  ["/gift-personalizer", "Gift Personalizer"],
  ["/about-us", "About Us"],
  ["/faq", "FAQ"],
  ["/contact", "Contact"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
  ["/swipe", "Swipe"],
  ["/cart", "Cart"],
  ["/profile", "Profile"],
  ["/wishlist", "Wishlist"],
  ["/not-a-real-page", "404 Page"],
];

for (const [path, name] of pageTests) {
  await test(`Page ${name} (${path})`, async () => {
    const res = await fetch(`${BASE}${path}`);
    if (path === "/not-a-real-page") {
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
      return "404 (correct)";
    }
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    if (!html.includes("Slash")) throw new Error("Missing Slash in HTML");
    return "200 OK";
  });
}

console.log("\n=== Summary ===\n");
const passed = results.filter(r => r.status === "PASS").length;
const failed = results.filter(r => r.status === "FAIL").length;
console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

if (failed > 0) {
  console.log("\nFailed tests:");
  results.filter(r => r.status === "FAIL").forEach(r => {
    console.log(`  - ${r.name}: ${r.detail}`);
  });
  process.exit(1);
}

console.log("\nAll tests passed!");

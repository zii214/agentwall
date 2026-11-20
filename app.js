"use strict";
/* ============================================================
   AgentWall frontend
   - Reads the wall through a public BSC RPC (no wallet needed).
   - Identity: .ai names are resolved ON-CHAIN via the Agent ID
     contract's handleOf(address) — verified to resolve the test
     wallet 0x1626…7104 to "ziman" (displayed as ziman.ai).
   - Writing: injected wallet provider only (window.ethereum).
     No QR / pairing-code login, no credential collection — the
     wallet shows and confirms every transaction itself.
   ============================================================ */

// ---------- CONFIG (edit after deployment) ----------
const CONFIG = {
  // TODO: replace with the deployed AgentWall address after mainnet deployment.
  AGENTWALL_ADDRESS: "0x29a6f587829d52d723d4e6a498054d892b99fb7e",
  AGENT_ID_ADDRESS: "0x60b9262456de011f7d15a54cdd8c48baaa8b022f", // SPACE ID Agent ID, BSC mainnet
  BSC_RPC_URL: "https://bsc-dataseed.binance.org",
  CHAIN_ID: 56,
  POSTER_GOAL: 30,        // hackathon milestone: 30 unique Agent ID posters
  PAGE_SIZE: 50,          // messages per messages() call
  MAX_TEXT_BYTES: 280,
  REFRESH_MS: 30000,
};

// ---------- Minimal ABIs ----------
const WALL_ABI = [
  "function messageCount() view returns (uint256)",
  "function uniquePosters() view returns (uint256)",
  "function messages(uint256 offset, uint256 limit) view returns (address[] authors, string[] texts, uint256[] timestamps)",
  "function post(string text)",
  "event MessagePosted(address indexed author, uint256 indexed index, uint256 timestamp)",
];
const AGENT_ID_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function handleOf(address owner) view returns (string)",
];

// ---------- State ----------
const deployed = CONFIG.AGENTWALL_ADDRESS !== "0x0000000000000000000000000000000000000000";
const readProvider = new ethers.JsonRpcProvider(CONFIG.BSC_RPC_URL);
const agentID = new ethers.Contract(CONFIG.AGENT_ID_ADDRESS, AGENT_ID_ABI, readProvider);
const wall = deployed ? new ethers.Contract(CONFIG.AGENTWALL_ADDRESS, WALL_ABI, readProvider) : null;

let signer = null;
let account = null;
let accountHandle = null; // string like "ziman" or null
const nameCache = new Map(); // address(lowercase) -> display name

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);
const shortAddr = (a) => a.slice(0, 6) + "…" + a.slice(-4);
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function timeAgo(tsSeconds) {
  const d = Math.max(0, Math.floor(Date.now() / 1000) - tsSeconds);
  if (d < 60) return "just now";
  if (d < 3600) return Math.floor(d / 60) + "m ago";
  if (d < 86400) return Math.floor(d / 3600) + "h ago";
  return Math.floor(d / 86400) + "d ago";
}
const byteLen = (s) => new TextEncoder().encode(s).length;

/// Resolve an address to its .ai display name, on-chain via handleOf().
/// Falls back to a shortened address when the wallet holds no Agent ID
/// or the call fails.
async function resolveName(address) {
  const key = address.toLowerCase();
  if (nameCache.has(key)) return nameCache.get(key);
  let display = shortAddr(address);
  try {
    const handle = await agentID.handleOf(address);
    if (handle && handle.length > 0) display = handle + ".ai";
  } catch (_) { /* keep fallback */ }
  nameCache.set(key, display);
  return display;
}

// ---------- Reading the wall ----------
async function loadWall() {
  if (!deployed) {
    $("deployNotice").classList.remove("hidden");
    $("wallFeed").innerHTML = '<p class="empty">The wall goes live as soon as the contract is deployed.</p>';
    return;
  }
  try {
    const [count, posters] = await Promise.all([wall.messageCount(), wall.uniquePosters()]);
    $("statMessages").textContent = count.toString();
    $("statPosters").textContent = posters.toString();
    const pct = Math.min(100, (Number(posters) / CONFIG.POSTER_GOAL) * 100);
    $("progressBar").style.width = pct + "%";
    $("progressText").textContent = `${posters} / ${CONFIG.POSTER_GOAL}`;

    // Fetch all messages in pages (chronological), then render newest first.
    const total = Number(count);
    const all = [];
    for (let offset = 0; offset < total; offset += CONFIG.PAGE_SIZE) {
      const page = await wall.messages(offset, CONFIG.PAGE_SIZE);
      for (let i = 0; i < page.authors.length; i++) {
        all.push({ author: page.authors[i], text: page.texts[i], ts: Number(page.timestamps[i]) });
      }
    }
    if (all.length === 0) {
      $("wallFeed").innerHTML = '<p class="empty">No posts yet — be the first Agent ID holder on the wall.</p>';
      return;
    }
    const names = await Promise.all(all.map((m) => resolveName(m.author)));
    $("wallFeed").innerHTML = all
      .map((m, i) => ({ m, name: names[i] }))
      .reverse()
      .map(({ m, name }) => {
        const isName = name.endsWith(".ai");
        return `<article class="post">
          <div class="post-meta">
            <span class="post-author">${escapeHtml(name)}${isName ? ` <span class="addr">${shortAddr(m.author)}</span>` : ""}</span>
            <span class="post-time" title="${new Date(m.ts * 1000).toUTCString()}">${timeAgo(m.ts)}</span>
          </div>
          <p class="post-text">${escapeHtml(m.text)}</p>
        </article>`;
      })
      .join("");
  } catch (e) {
    console.error(e);
    $("wallFeed").innerHTML = '<p class="empty">Could not load the wall from the network. Try Refresh.</p>';
  }
}

// ---------- Wallet (injected provider only) ----------
async function connect() {
  const state = $("accountState");
  if (!window.ethereum) {
    state.className = "account-state warn";
    state.textContent = "No wallet found in this browser. Open this page in a browser with a Web3 wallet (for example the Binance Wallet extension or a wallet's built-in browser) to post.";
    return;
  }
  try {
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    await browserProvider.send("eth_requestAccounts", []);
    let network = await browserProvider.getNetwork();
    if (Number(network.chainId) !== CONFIG.CHAIN_ID) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x" + CONFIG.CHAIN_ID.toString(16) }],
        });
        network = await browserProvider.getNetwork(); // re-read after the switch
      } catch (_) { /* handled by the chain check below */ }
      if (Number(network.chainId) !== CONFIG.CHAIN_ID) {
        state.className = "account-state warn";
        state.textContent = "Please switch your wallet to BNB Smart Chain (chain 56) and reconnect.";
        return;
      }
    }
    signer = await browserProvider.getSigner();
    account = await signer.getAddress();
    $("connectBtn").textContent = shortAddr(account);
    await refreshAccountState();
  } catch (e) {
    console.error(e);
    state.className = "account-state warn";
    state.textContent = "Wallet connection was cancelled or failed.";
  }
}

async function refreshAccountState() {
  const state = $("accountState");
  if (!account) return;
  try {
    const bal = await agentID.balanceOf(account);
    if (bal > 0n) {
      accountHandle = await agentID.handleOf(account).catch(() => "");
      const name = accountHandle ? accountHandle + ".ai" : shortAddr(account);
      state.className = "account-state ok";
      state.innerHTML = `Connected as <strong>${escapeHtml(name)}</strong> — your Agent ID unlocks posting.`;
      $("postText").disabled = !deployed;
      $("postBtn").disabled = !deployed;
    } else {
      accountHandle = null;
      state.className = "account-state warn";
      state.innerHTML = `This wallet (${shortAddr(account)}) does not hold an Agent ID, so it can read but not post. ` +
        `Agent IDs are claimed inside the <strong>Binance App</strong>: Wallet → homepage banner → Agent ID. Once this wallet holds one, reconnect to post.`;
      $("postText").disabled = true;
      $("postBtn").disabled = true;
    }
  } catch (e) {
    console.error(e);
    state.className = "account-state warn";
    state.textContent = "Could not verify Agent ID ownership right now. Try reconnecting.";
  }
}

// ---------- Posting ----------
async function submitPost() {
  const status = $("postStatus");
  const text = $("postText").value;
  const bytes = byteLen(text);
  status.className = "post-status";
  if (bytes === 0) { status.textContent = "Write something first."; status.classList.add("err"); return; }
  if (bytes > CONFIG.MAX_TEXT_BYTES) { status.textContent = "Too long — 280 bytes max."; status.classList.add("err"); return; }
  if (!signer || !deployed) return;
  try {
    status.textContent = "Confirm the post in your wallet…";
    const wallWrite = new ethers.Contract(CONFIG.AGENTWALL_ADDRESS, WALL_ABI, signer);
    const tx = await wallWrite.post(text);
    status.textContent = "Posting on-chain…";
    await tx.wait();
    $("postText").value = "";
    updateByteCount();
    status.textContent = "Posted! It is on the wall now.";
    status.classList.add("ok");
    nameCache.delete(account.toLowerCase());
    await loadWall();
  } catch (e) {
    console.error(e);
    const msg = (e.shortMessage || e.message || "").toString();
    if (msg.includes("cooldown")) status.textContent = "One post per minute — wait a few seconds and try again.";
    else if (msg.includes("Agent ID required")) status.textContent = "This wallet does not hold an Agent ID.";
    else if (e.code === "ACTION_REJECTED") status.textContent = "Transaction cancelled in the wallet.";
    else status.textContent = "Posting failed. Check your wallet and network, then try again.";
    status.classList.add("err");
  }
}

function updateByteCount() {
  const n = byteLen($("postText").value);
  $("byteCount").textContent = `${n} / ${CONFIG.MAX_TEXT_BYTES} bytes`;
  $("byteCount").style.color = n > CONFIG.MAX_TEXT_BYTES ? "var(--err)" : "";
}

// ---------- Wire up ----------
$("connectBtn").addEventListener("click", connect);
$("postBtn").addEventListener("click", submitPost);
$("refreshBtn").addEventListener("click", loadWall);
$("postText").addEventListener("input", updateByteCount);
if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => { signer = null; account = null; $("connectBtn").textContent = "Connect wallet"; $("postText").disabled = true; $("postBtn").disabled = true; $("accountState").className = "account-state"; $("accountState").textContent = "Wallet account changed — reconnect to post."; });
  window.ethereum.on("chainChanged", () => window.location.reload());
}
if (deployed) {
  $("wallAddr").innerHTML = `<a href="https://bscscan.com/address/${CONFIG.AGENTWALL_ADDRESS}" target="_blank" rel="noopener">${CONFIG.AGENTWALL_ADDRESS}</a>`;
  // Live-refresh when a new post lands on-chain.
  wall.on("MessagePosted", () => loadWall());
}
loadWall();
setInterval(loadWall, CONFIG.REFRESH_MS);

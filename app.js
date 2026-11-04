// Clock In app. Talks only to its own backend; no keys or secrets live here.
(() => {
  const API = "https://xgxswoaxalhdfjjxelyt.supabase.co/functions/v1/clockin-api";
  const $ = (id) => document.getElementById(id);
  const TOKEN_KEY = "clk_token";
  let token = localStorage.getItem(TOKEN_KEY) || "";
  let state = null; // {mode, telnyxReady, settings, last}
  let busy = false;
  let draft = { in: [], out: [] };
  let audio = null, playingId = null;

  // ---------- api ----------
  async function api(path, opts = {}) {
    const headers = { "content-type": "application/json" };
    if (token) headers.authorization = "Bearer " + token;
    let r;
    try {
      r = await fetch(API + path, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : undefined, cache: "no-store" });
    } catch (e) { throw new Error("No connection. Check your internet and try again."); }
    if (opts.raw) { if (r.status === 401) logout(); return r; }
    const data = await r.json().catch(() => ({}));
    if (r.status === 401 && path !== "/login") { logout(); throw new Error("Please log in again"); }
    if (!r.ok || data.ok === false) throw new Error(data.error || ("Error " + r.status));
    return data;
  }

  // ---------- helpers ----------
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const fmtDay = (iso) => {
    const d = new Date(iso), t = new Date(), y = new Date(Date.now() - 864e5);
    if (d.toDateString() === t.toDateString()) return "Today";
    if (d.toDateString() === y.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  };
  const verb = (a) => (a === "in" ? "Clocked in" : a === "out" ? "Clocked out" : "Test call");
  const label = (a) => (a === "in" ? "Clock In" : a === "out" ? "Clock Out" : "Test call");
  const pretty = (n) => {
    const d = String(n || "").replace(/\D/g, "");
    if (d.length === 11 && d[0] === "1") return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
    return n || "";
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- views ----------
  function show(view) {
    for (const v of ["login", "home", "history", "settings"]) $(v).hidden = v !== view;
    $("tabs").hidden = view === "login";
    document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("on", a.dataset.tab === view));
    if (view === "history") loadHistory();
    if (view === "settings") fillSettings();
    window.scrollTo(0, 0);
  }
  function route() {
    if (!token) return show("login");
    const v = (location.hash || "#home").slice(1);
    show(["home", "history", "settings"].includes(v) ? v : "home");
  }
  window.addEventListener("hashchange", route);

  // ---------- login ----------
  $("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("loginErr").hidden = true;
    try {
      const d = await api("/login", { method: "POST", body: { password: $("pw").value } });
      token = d.token; localStorage.setItem(TOKEN_KEY, token);
      $("pw").value = "";
      await loadState();
      location.hash = "#home"; route();
    } catch (err) { $("loginErr").textContent = err.message; $("loginErr").hidden = false; }
  });
  function logout() {
    token = ""; localStorage.removeItem(TOKEN_KEY); state = null;
    show("login");
  }
  $("logout").addEventListener("click", logout);

  // ---------- state ----------
  async function loadState() {
    state = await api("/state");
    const test = state.mode === "test";
    $("modeBadge").textContent = test ? "Test mode" : "Live";
    $("modeBadge").classList.toggle("live", !test);
    $("listen").checked = !!state.settings.listen_live;
    if (!busy) showLast(state.last);
  }
  function setResult(kind, icon, title, sub) {
    const r = $("result");
    r.className = "result " + kind;
    $("resultIcon").innerHTML = icon;
    $("resultTitle").textContent = title;
    $("resultSub").textContent = sub || "";
  }
  function showLast(a) {
    if (!a) return setResult("idle", "&#128222;", "Ready", "Tap a button when you start or stop work");
    if (a.status === "done") return setResult("ok", "&#9989;", `${verb(a.action)} ${fmtTime(a.created_at)}`, (fmtDay(a.created_at) === "Today" ? "" : fmtDay(a.created_at) + " \u00b7 ") + (a.mode === "test" ? "Test mode, no real call" : "All keys sent"));
    if (a.status === "failed") return setResult("bad", "&#10060;", "Failed, try again", a.stage || "");
    return setResult("busy", '<div class="spin"></div>', a.stage || "Calling...", label(a.action));
  }

  // ---------- calling ----------
  function lock(on) { busy = on; $("btnIn").disabled = on; $("btnOut").disabled = on; $("testBtn").disabled = on; }
  function confirmSheet(title, sub) {
    return new Promise((res) => {
      $("sheetTitle").textContent = title; $("sheetSub").textContent = sub; $("sheet").hidden = false;
      const done = (v) => { $("sheet").hidden = true; $("sheetYes").onclick = $("sheetNo").onclick = $("sheet").onclick = null; res(v); };
      $("sheetYes").onclick = () => done(true);
      $("sheetNo").onclick = () => done(false);
      $("sheet").onclick = (e) => { if (e.target === $("sheet")) done(false); };
    });
  }
  async function placeCall(action, onUpdate) {
    lock(true);
    try {
      const d = await api("/call", { method: "POST", body: { action, listen: $("listen").checked } });
      let a = d.attempt; onUpdate(a);
      const t0 = Date.now();
      while (!["done", "failed"].includes(a.status) && Date.now() - t0 < 200000) {
        await new Promise((r) => setTimeout(r, 1000));
        try { a = (await api("/attempt/" + a.id)).attempt; onUpdate(a); } catch (_) { /* keep polling */ }
      }
      return a;
    } finally { lock(false); }
  }
  async function clock(action) {
    if (busy) return;
    const s = state?.settings || {};
    const listen = $("listen").checked;
    const sub = (state?.mode === "test" ? "Test mode: the call is simulated. " : "") +
      (listen ? `Your cell rings first. Pick up and you'll hear it dial ${pretty(s.clock_number)} and press the keys.` : `Calls ${pretty(s.clock_number)} and presses the ${action === "in" ? "clock-in" : "clock-out"} keys.`);
    if (!(await confirmSheet(action === "in" ? "Clock in now?" : "Clock out now?", sub))) return;
    try {
      const a = await placeCall(action, showLast);
      showLast(a);
    } catch (err) { setResult("bad", "&#10060;", "Failed, try again", err.message); }
  }
  $("btnIn").addEventListener("click", () => clock("in"));
  $("btnOut").addEventListener("click", () => clock("out"));
  $("listen").addEventListener("change", async () => {
    try { await api("/listen", { method: "PUT", body: { listen_live: $("listen").checked } }); state.settings.listen_live = $("listen").checked; } catch (_) { /* local only */ }
  });

  // ---------- history ----------
  async function loadHistory() {
    const box = $("histList");
    if (!box.children.length) box.innerHTML = '<div class="empty">Loading...</div>';
    try {
      const { attempts } = await api("/history?limit=200");
      if (!attempts.length) { box.innerHTML = '<div class="empty">No calls yet</div>'; return; }
      let html = "", day = "";
      for (const a of attempts) {
        const d = fmtDay(a.created_at);
        if (d !== day) { html += `<div class="hist-day">${esc(d)}</div>`; day = d; }
        const chip = a.status === "done" ? '<span class="chip ok">Done</span>' : a.status === "failed" ? '<span class="chip bad">Failed</span>' : '<span class="chip busy">In progress</span>';
        const tchip = a.mode === "test" ? '<span class="chip t">Test</span>' : "";
        const sub = a.status === "failed" ? a.stage : a.status === "done" ? ((a.listen && a.action !== "test" ? "Listened live \u00b7 " : "") + (a.mode === "test" ? "Placeholder recording" : (a.has_recording ? "Recorded" : "Recording not saved yet"))) : a.stage;
        const play = a.has_recording ? `<button class="play" data-play="${a.id}" aria-label="Play recording">&#9654;</button>` : "";
        html += `<div class="hist-item"><div class="hist-ico ${a.action}">${a.action === "test" ? "TEST" : a.action.toUpperCase()}</div>
          <div class="hist-main"><div class="hist-title">${esc(label(a.action))} \u00b7 ${esc(fmtTime(a.created_at))}${chip}${tchip}</div>
          <div class="hist-sub">${esc(sub || "")}</div></div>${play}</div>`;
      }
      box.innerHTML = html;
    } catch (err) { box.innerHTML = `<div class="empty">${esc(err.message)}</div>`; }
  }
  $("refreshHist").addEventListener("click", loadHistory);
  $("histList").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-play]");
    if (!b) return;
    const id = b.dataset.play;
    if (audio && playingId === id) { audio.pause(); return; }
    if (audio) audio.pause();
    document.querySelectorAll(".play.on").forEach((x) => { x.classList.remove("on"); x.innerHTML = "&#9654;"; });
    b.innerHTML = "&#8230;";
    try {
      const r = await api("/recording/" + id, { raw: true });
      if (!r.ok) throw new Error("Recording not available yet");
      const url = URL.createObjectURL(await r.blob());
      audio = new Audio(url); playingId = id;
      b.classList.add("on"); b.innerHTML = "&#10073;&#10073;";
      const stop = () => { b.classList.remove("on"); b.innerHTML = "&#9654;"; playingId = null; URL.revokeObjectURL(url); };
      audio.onended = stop; audio.onpause = stop;
      await audio.play();
    } catch (err) { b.innerHTML = "&#9654;"; alert(err.message); }
  });

  // ---------- settings ----------
  function fillSettings() {
    if (!state) return;
    const s = state.settings;
    $("clockNumber").value = pretty(s.clock_number);
    $("workerCell").value = pretty(s.worker_cell);
    draft = { in: JSON.parse(JSON.stringify(s.in_steps || [])), out: JSON.parse(JSON.stringify(s.out_steps || [])) };
    $("forceTest").checked = !state.telnyxReady || !!s.force_test;
    $("forceTest").disabled = !state.telnyxReady;
    $("forceSub").textContent = state.telnyxReady ? "On: calls are simulated. Off: real calls." : "On until the phone line is connected. Calls are simulated.";
    $("setMsg").hidden = true;
    drawSteps();
  }
  function drawSteps() {
    for (const k of ["in", "out"]) {
      const box = $(k + "Steps");
      box.innerHTML = draft[k].map((s, i) => `<div class="step" data-k="${k}" data-i="${i}">
        <span class="step-n">${i + 1}</span>
        <span class="step-kind">${s.t === "wait" ? "Wait" : "Press"}</span>
        ${s.t === "wait"
          ? `<input type="number" inputmode="decimal" min="0.5" max="30" step="0.5" value="${esc(s.s)}" data-f="s" aria-label="Seconds"><span class="unit">sec</span>`
          : `<input type="text" inputmode="tel" value="${esc(s.d)}" data-f="d" aria-label="Keys" placeholder="e.g. 123456#">`}
        <button type="button" data-mv="-1" aria-label="Move up">&#8593;</button>
        <button type="button" data-del aria-label="Remove">&#10005;</button>
      </div>`).join("") || '<div class="muted small">No steps yet</div>';
    }
  }
  document.addEventListener("input", (e) => {
    const row = e.target.closest(".step");
    if (!row) return;
    const s = draft[row.dataset.k][+row.dataset.i];
    if (e.target.dataset.f === "s") s.s = Number(e.target.value);
    if (e.target.dataset.f === "d") s.d = e.target.value.replace(/\s/g, "");
  });
  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) { draft[add.dataset.add].push(add.dataset.t === "wait" ? { t: "wait", s: 2 } : { t: "press", d: "" }); drawSteps(); return; }
    const row = e.target.closest(".step");
    if (!row) return;
    const list = draft[row.dataset.k], i = +row.dataset.i;
    if (e.target.closest("[data-del]")) { list.splice(i, 1); drawSteps(); }
    else if (e.target.closest("[data-mv]") && i > 0) { [list[i - 1], list[i]] = [list[i], list[i - 1]]; drawSteps(); }
  });
  function msg(el, text, ok) { el.textContent = text; el.className = "small " + (ok ? "ok" : "bad"); el.hidden = false; }
  $("setForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("saveBtn").disabled = true;
    try {
      const d = await api("/settings", { method: "PUT", body: {
        clock_number: $("clockNumber").value, worker_cell: $("workerCell").value,
        in_steps: draft.in, out_steps: draft.out, listen_live: $("listen").checked,
        force_test: state.telnyxReady ? $("forceTest").checked : false,
      } });
      state.settings = d.settings; state.mode = d.mode;
      await loadState(); fillSettings();
      msg($("setMsg"), "Saved \u2713", true);
    } catch (err) { msg($("setMsg"), err.message, false); }
    finally { $("saveBtn").disabled = false; }
  });
  $("testBtn").addEventListener("click", async () => {
    if (busy) return;
    if (!(await confirmSheet("Make a test call?", (state?.mode === "test" ? "Test mode: the call is simulated. " : "") + "Your cell rings and plays the clock-in keys. Nothing goes to the clock-in line."))) return;
    try {
      const a = await placeCall("test", (a) => msg($("testMsg"), a.stage || "Calling...", a.status !== "failed"));
      msg($("testMsg"), a.status === "done" ? "\u2705 Test call finished. Recording is in History." : "\u274c " + (a.stage || "Test call failed"), a.status === "done");
    } catch (err) { msg($("testMsg"), err.message, false); }
  });

  // ---------- boot ----------
  (async () => {
    if (token) { try { await loadState(); } catch (_) { /* shown on next action */ } }
    route();
  })();
})();

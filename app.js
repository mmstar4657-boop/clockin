// Clock In app. Talks only to its own backend; no keys or secrets live here.
// It calls only when the worker taps a button. Nothing here schedules or auto-fires a call.
(() => {
  const API = "https://xgxswoaxalhdfjjxelyt.supabase.co/functions/v1/clockin-api";
  const $ = (id) => document.getElementById(id);
  const TOKEN_KEY = "clk_token";
  let token = localStorage.getItem(TOKEN_KEY) || "";
  let S = null;                 // {mode, telnyxReady, settings, agencies, open, last}
  let busy = false, cur = null; // current call attempt
  let range = 7, page = 0, attRows = [], attAll = [];
  let audio = null, playingKey = null;

  // ---------- icons (stroke icons, drawn inline) ----------
  const P = {
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    timer: '<path d="M10 2h4M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
    pct: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    flask: '<path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3L14 9V3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
    // agency icons
    handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  };
  const AG_ICONS = ["handshake", "heart", "users", "hand", "star", "home", "briefcase", "smile", "sun", "building"];
  const COLORS = ["#2563eb", "#ef4444", "#16a34a", "#7c3aed", "#f59e0b", "#0891b2", "#db2777", "#0b1f4d"];
  const ic = (n, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24">${P[n] || P.briefcase}</svg>`;
  const playIc = (on) => `<svg viewBox="0 0 24 24">${on ? P.pause : P.play}</svg>`;

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
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();
  const fmtDate = (iso) => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  const fmtDayShort = (iso) => new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const dur = (ms) => { const m = Math.max(0, Math.round(ms / 60000)); return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`; };
  const pretty = (n) => { const d = String(n || "").replace(/\D/g, ""); return d.length === 11 && d[0] === "1" ? `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}` : (n || ""); };
  const verb = (a) => (a === "in" ? "Clocked in" : a === "out" ? "Clocked out" : "Test call");
  const agById = (id) => (S?.agencies || []).find((a) => a.id === id);
  const agIco = (a, size = "ag-ico") => `<span class="${size}" style="background:${esc(a?.color || "#94a3b8")}">${ic(a?.icon || "briefcase")}</span>`;
  function toast(t) { const el = $("toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 2600); }

  // ---------- routing ----------
  const VIEWS = [["clock", "Clock", "clock"], ["attendance", "Attendance", "cal"], ["settings", "Settings", "sliders"]];
  $("nav").innerHTML = VIEWS.map(([k, t, i]) => `<a href="#${k}" data-v="${k}">${ic(i)}${t}</a>`).join("");
  $("tabs").innerHTML = VIEWS.map(([k, t, i]) => `<a href="#${k}" data-v="${k}">${ic(i)}${t}</a>`).join("");
  $("logoutSide").innerHTML = ic("logout") + "Log out";
  function route() {
    if (!token) { $("login").hidden = false; $("shell").hidden = true; return; }
    $("login").hidden = true; $("shell").hidden = false;
    let v = (location.hash || "#clock").slice(1);
    if (!VIEWS.some(([k]) => k === v)) v = "clock";
    for (const [k] of VIEWS) $("v-" + k).hidden = k !== v;
    document.querySelectorAll("[data-v]").forEach((a) => a.classList.toggle("on", a.dataset.v === v));
    if (v === "clock") drawClock();
    if (v === "attendance") loadAttendance();
    if (v === "settings") drawSettings();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  // ---------- login ----------
  $("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("loginErr").hidden = true;
    try {
      const d = await api("/login", { method: "POST", body: { password: $("pw").value } });
      token = d.token; localStorage.setItem(TOKEN_KEY, token); $("pw").value = "";
      await loadState(); location.hash = "#clock"; route();
    } catch (err) { $("loginErr").textContent = err.message; $("loginErr").hidden = false; }
  });
  function logout() { token = ""; localStorage.removeItem(TOKEN_KEY); S = null; route(); }
  $("logoutSide").addEventListener("click", logout);

  async function loadState() { S = await api("/state"); }

  // ---------- sheet ----------
  function sheet(html) { $("sheetCard").innerHTML = html; $("sheet").hidden = false; }
  function closeSheet() { $("sheet").hidden = true; $("sheetCard").innerHTML = ""; }
  $("sheet").addEventListener("click", (e) => { if (e.target === $("sheet") && !$("sheet").dataset.lock) closeSheet(); });
  function confirmSheet(title, sub, yes = "Call now") {
    return new Promise((res) => {
      sheet(`<h2>${esc(title)}</h2><p class="muted">${esc(sub)}</p>
        <button class="btn primary wide" id="cYes">${ic("phone")}${esc(yes)}</button>
        <button class="btn ghost wide" id="cNo">Cancel</button>`);
      $("cYes").onclick = () => { closeSheet(); res(true); };
      $("cNo").onclick = () => { closeSheet(); res(false); };
    });
  }

  // ---------- clock screen ----------
  const openFor = (id) => (S?.open || []).find((o) => o.agency_id === id);
  function resultHtml() {
    const a = cur || S?.last;
    if (!a) return { k: "idle", i: "&#128222;", t: "Ready", s: "Tap an agency when you start or stop work" };
    const who = a.agency_name ? ` \u00b7 ${a.agency_name}` : "";
    if (a.status === "done") return { k: "ok", i: "&#9989;", t: `${verb(a.action)} ${fmtTime(a.created_at)}`, s: (isToday(a.created_at) ? "" : fmtDayShort(a.created_at) + " \u00b7 ") + (a.agency_name || "") + (a.mode === "test" ? " \u00b7 Test mode, no real call" : " \u00b7 All keys sent") };
    if (a.status === "failed") return { k: "bad", i: "&#10060;", t: "Failed, try again", s: (a.stage || "") + who };
    return { k: "busy", i: '<div class="spin"></div>', t: a.stage || "Calling...", s: (a.action === "in" ? "Clock in" : a.action === "out" ? "Clock out" : "Test call") + who };
  }
  function drawResult() {
    const r = resultHtml(), el = $("result");
    if (!el) return;
    el.className = "result " + r.k;
    el.innerHTML = `<div class="result-icon">${r.i}</div><div><div class="result-title">${esc(r.t)}</div><div class="result-sub">${esc(r.s)}</div></div>`;
  }
  function agBtn(a, kind) {
    const o = openFor(a.id);
    let sub = pretty(a.clock_number), cls = "";
    if (o) { sub = kind === "out" ? `In since ${fmtTime(o.since)} \u00b7 ${dur(Date.now() - new Date(o.since))}` : `Clocked in at ${fmtTime(o.since)}`; cls = kind === "out" ? " open" : ""; }
    return `<button class="ag-btn${cls}" data-clock="${kind}" data-ag="${a.id}" ${busy ? "disabled" : ""}>
      ${agIco(a)}<span class="ag-main"><span class="ag-name">${esc(a.name)}</span><span class="ag-sub${o ? " on" : ""}" style="display:block">${esc(sub)}</span></span>
      <span class="ag-go ${kind}">${ic(kind === "in" ? "login" : "logout")}</span></button>`;
  }
  function drawClock() {
    if (!S) return;
    const test = S.mode === "test";
    const ags = S.agencies || [];
    $("v-clock").innerHTML = `
      <div class="ph"><div class="ph-l"><div class="ph-ico">${ic("clock")}</div><div><h1>Clock</h1><div class="ph-sub">Tap when you start or stop work</div></div></div>
        <span class="badge ${test ? "" : "live"}">${test ? "Test mode" : "Live"}</span></div>
      <div id="remind"></div>
      <div class="top-row">
        <div class="card"><div id="result" class="result"></div></div>
        <div class="card"><label class="tog"><span class="tog-ico">${ic("headphones")}</span><span class="tog-main"><span class="tog-t" style="display:block">Listen live</span><span class="muted small">Rings your cell first so you hear the call</span></span>
          <input id="listen" type="checkbox" class="switch" ${S.settings.listen_live ? "checked" : ""}></label></div>
      </div>
      <div class="clock-cards">
        <div class="cc"><div class="cc-h in"><span class="dot">${ic("login")}</span><div><b>Clock In</b><span>Starting work</span></div></div>
          <div class="cc-list">${ags.map((a) => agBtn(a, "in")).join("") || '<div class="empty">Add an agency in Settings</div>'}</div></div>
        <div class="cc"><div class="cc-h out"><span class="dot">${ic("logout")}</span><div><b>Clock Out</b><span>Done with work</span></div></div>
          <div class="cc-list">${ags.map((a) => agBtn(a, "out")).join("") || '<div class="empty">Add an agency in Settings</div>'}</div></div>
      </div>`;
    drawResult(); drawReminder();
    $("listen").addEventListener("change", async (e) => {
      S.settings.listen_live = e.target.checked;
      try { await api("/listen", { method: "PUT", body: { listen_live: e.target.checked } }); } catch (_) { /* keeps local */ }
    });
  }
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-clock]");
    if (!b || busy) return;
    const kind = b.dataset.clock, ag = agById(b.dataset.ag);
    if (!ag) return;
    const listen = !!S.settings.listen_live;
    const sub = (S.mode === "test" ? "Test mode: the call is simulated. " : "") +
      (listen ? `Your cell rings first. Pick up and you'll hear it dial ${ag.name} and press the keys.` : `Calls ${ag.name} at ${pretty(ag.clock_number)} and presses the ${kind === "in" ? "clock-in" : "clock-out"} keys.`);
    if (!(await confirmSheet(`${kind === "in" ? "Clock in" : "Clock out"} \u00b7 ${ag.name}?`, sub))) return;
    await placeCall(kind, ag.id, () => { drawResult(); });
    try { await loadState(); } catch (_) { /* */ }
    if (!$("v-clock").hidden) drawClock();
  });
  async function placeCall(action, agencyId, onUpdate) {
    busy = true; document.querySelectorAll("[data-clock],[data-test]").forEach((x) => (x.disabled = true));
    try {
      const d = await api("/call", { method: "POST", body: { action, agency_id: agencyId, listen: !!S.settings.listen_live } });
      cur = d.attempt; onUpdate(cur);
      const t0 = Date.now();
      while (!["done", "failed"].includes(cur.status) && Date.now() - t0 < 200000) {
        await new Promise((r) => setTimeout(r, 1000));
        try { cur = (await api("/attempt/" + cur.id)).attempt; onUpdate(cur); } catch (_) { /* keep polling */ }
      }
    } catch (err) {
      cur = { status: "failed", stage: err.message, action, created_at: new Date().toISOString(), agency_name: agById(agencyId)?.name || "" };
      onUpdate(cur);
    } finally { busy = false; document.querySelectorAll("[data-clock],[data-test]").forEach((x) => (x.disabled = false)); }
    return cur;
  }

  // ---------- reminder (never calls; banner + notification only) ----------
  function overdue() {
    if (!S?.settings?.remind_out) return [];
    const lim = (S.settings.remind_hours || 8) * 3600000;
    return (S.open || []).filter((o) => Date.now() - new Date(o.since) > lim);
  }
  function drawReminder() {
    const el = $("remind"); if (!el) return;
    const od = overdue();
    el.innerHTML = od.map((o) => { const a = agById(o.agency_id); return `<div class="remind">${ic("bell")}<span>Still clocked in with ${esc(a?.name || "an agency")} since ${fmtTime(o.since)} (${dur(Date.now() - new Date(o.since))}). Tap Clock Out when you're done.</span></div>`; }).join("");
  }
  async function notifyOverdue() {
    const od = overdue();
    for (const o of od) {
      const key = "clk_reminded_" + o.agency_id + "_" + o.since;
      if (localStorage.getItem(key)) continue;
      localStorage.setItem(key, "1");
      const a = agById(o.agency_id);
      const body = `Still clocked in with ${a?.name || "an agency"} since ${fmtTime(o.since)}. Open the app to clock out.`;
      try {
        if ("Notification" in window && Notification.permission === "granted") {
          const reg = navigator.serviceWorker && (await navigator.serviceWorker.getRegistration());
          if (reg) reg.showNotification("Clock out reminder", { body, tag: key, icon: "icons/icon-192.png" });
          else new Notification("Clock out reminder", { body, tag: key, icon: "icons/icon-192.png" });
        }
      } catch (_) { /* banner still shows */ }
    }
    drawReminder();
  }
  setInterval(async () => { if (token && !busy) { try { await loadState(); } catch (_) { /* */ } if (!$("v-clock").hidden) drawClock(); notifyOverdue(); } }, 60000);
  document.addEventListener("visibilitychange", async () => { if (!document.hidden && token && !busy) { try { await loadState(); } catch (_) { /* */ } route(); notifyOverdue(); } });

  // ---------- attendance ----------
  function pair(attempts) {
    const list = attempts.filter((a) => a.action === "in" || a.action === "out").sort((x, y) => new Date(x.created_at) - new Date(y.created_at));
    const open = new Map(), rows = [];
    for (const a of list) {
      const key = a.agency_id || a.agency_name;
      if (a.action === "in" && a.status === "done") {
        if (open.has(key)) rows.push({ in: open.get(key), status: "warn" });
        open.set(key, a);
      } else if (a.action === "in" && a.status === "failed") rows.push({ in: a, status: "bad" });
      else if (a.action === "out" && a.status === "done") {
        if (open.has(key)) { rows.push({ in: open.get(key), out: a, status: "ok" }); open.delete(key); }
        else rows.push({ out: a, status: "ok" });
      } else if (a.action === "out" && a.status === "failed") rows.push({ out: a, status: "bad" });
      else rows.push({ [a.action]: a, status: "open" }); // still calling
    }
    for (const a of open.values()) rows.push({ in: a, status: "open" });
    for (const r of rows) r.t = new Date((r.in || r.out).created_at);
    return rows.sort((x, y) => y.t - x.t);
  }
  async function loadAttendance() {
    drawAttendanceShell();
    try {
      const { attempts } = await api("/history?days=" + range);
      attAll = attempts; attRows = pair(attempts); page = 0;
      drawAttendance();
    } catch (err) { $("attBody").innerHTML = `<div class="empty">${esc(err.message)}</div>`; }
  }
  function drawAttendanceShell() {
    $("v-attendance").innerHTML = `
      <div class="ph"><div class="ph-l"><div class="ph-ico">${ic("cal")}</div><div><h1>Attendance</h1><div class="ph-sub">Every clock in and out, with recordings</div></div></div>
        <div class="seg" id="rangeSeg">${[[7, "Last 7 days"], [30, "Last 30 days"], [0, "All"]].map(([d, t]) => `<button data-range="${d}" class="${d === range ? "on" : ""}">${t}</button>`).join("")}</div></div>
      <div class="stats" id="stats"></div>
      <div class="card" id="attBody"><div class="empty">Loading...</div></div>`;
  }
  const PILL = { ok: '<span class="pill ok">Successful</span>', bad: '<span class="pill bad">Failed</span>', open: '<span class="pill open">Clocked in</span>', warn: '<span class="pill warn">No clock out</span>' };
  function recBtns(r) {
    let h = "";
    if (r.in?.has_recording) h += `<button class="play" data-play="${r.in.id}">${playIc(playingKey === r.in.id)}In</button>`;
    if (r.out?.has_recording) h += `<button class="play" data-play="${r.out.id}">${playIc(playingKey === r.out.id)}Out</button>`;
    return h ? `<div class="recs">${h}</div>` : '<span class="muted">\u2014</span>';
  }
  function drawAttendance() {
    const sessions = attRows.filter((r) => r.in && r.out && r.status === "ok");
    const totalMs = sessions.reduce((s, r) => s + (new Date(r.out.created_at) - new Date(r.in.created_at)), 0);
    const calls = attAll.filter((a) => (a.action === "in" || a.action === "out") && ["done", "failed"].includes(a.status));
    const okCalls = calls.filter((a) => a.status === "done").length;
    const stats = [
      ["list", "#2563eb", "#e8f0fe", sessions.length, "Total sessions"],
      ["clock", "#7c3aed", "#f3e8ff", (totalMs / 3600000).toFixed(1) + "h", "Total hours"],
      ["timer", "#0891b2", "#cffafe", sessions.length ? dur(totalMs / sessions.length) : "\u2014", "Avg session"],
      ["pct", "#16a34a", "#dcfce7", calls.length ? Math.round((okCalls / calls.length) * 100) + "%" : "\u2014", "Success rate"],
    ];
    $("stats").innerHTML = stats.map(([i, c, bg, v, l]) => `<div class="stat"><span class="stat-ico" style="color:${c};background:${bg}">${ic(i)}</span><div><div class="stat-v">${v}</div><div class="stat-l">${l}</div></div></div>`).join("");
    if (!attRows.length) { $("attBody").innerHTML = '<div class="empty">No clock ins in this range yet</div>'; return; }
    const per = 10, pages = Math.ceil(attRows.length / per);
    page = Math.min(page, pages - 1);
    const rows = attRows.slice(page * per, page * per + per);
    const agCell = (r) => { const a0 = r.in || r.out; const a = agById(a0.agency_id) || { name: a0.agency_name, color: "#94a3b8", icon: "briefcase" }; return `<span class="agc"><i style="background:${esc(a.color)}">${ic(a.icon)}</i>${esc(a0.agency_name || a.name)}</span>`; };
    const tin = (r) => r.in ? fmtTime(r.in.created_at) + (r.in.status === "failed" ? " \u2716" : "") : "\u2014";
    const tout = (r) => r.out ? fmtTime(r.out.created_at) + (r.out.status === "failed" ? " \u2716" : "") : "\u2014";
    const len = (r) => r.in && r.out && r.status === "ok" ? dur(new Date(r.out.created_at) - new Date(r.in.created_at)) : "\u2014";
    const isTest = (r) => ((r.in || r.out).mode === "test" ? ' <span class="pill t">Test</span>' : "");
    const table = `<div class="wide-only"><table class="att"><thead><tr><th>Date</th><th>Agency</th><th>Clock in</th><th>Clock out</th><th>Session</th><th>Status</th><th>Recording</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${fmtDate(r.t)}</td><td>${agCell(r)}</td><td>${tin(r)}</td><td>${tout(r)}</td><td>${len(r)}</td><td>${PILL[r.status]}${isTest(r)}</td><td>${recBtns(r)}</td></tr>`).join("")}
      </tbody></table></div>`;
    const cards = `<div class="narrow-only att-cards">${rows.map((r) => `<div class="ac">
      <div class="ac-top">${agCell(r)}<span>${PILL[r.status]}${isTest(r)}</span></div>
      <div class="ac-grid"><div><b>Date</b>${fmtDayShort(r.t)}</div><div><b>In</b>${tin(r)}</div><div><b>Out</b>${tout(r)}</div></div>
      <div class="ac-foot"><span class="small muted">Session: <b style="color:var(--ink)">${len(r)}</b></span>${recBtns(r)}</div></div>`).join("")}</div>`;
    $("attBody").innerHTML = table + cards + `<div class="pager"><button class="btn small" data-pg="-1" ${page ? "" : "disabled"}>&#8249; Prev</button><span>Page ${page + 1} of ${pages} \u00b7 ${attRows.length} rows</span><button class="btn small" data-pg="1" ${page < pages - 1 ? "" : "disabled"}>Next &#8250;</button></div>`;
  }
  document.addEventListener("click", async (e) => {
    const rg = e.target.closest("[data-range]");
    if (rg) { range = +rg.dataset.range; loadAttendance(); return; }
    const pg = e.target.closest("[data-pg]");
    if (pg) { page += +pg.dataset.pg; drawAttendance(); document.getElementById("attBody").scrollIntoView({ block: "start", behavior: "smooth" }); return; }
    const pl = e.target.closest("[data-play]");
    if (pl) {
      const id = pl.dataset.play;
      if (audio && playingKey === id) { audio.pause(); return; }
      if (audio) audio.pause();
      pl.disabled = true;
      try {
        const r = await api("/recording/" + id, { raw: true });
        if (!r.ok) throw new Error("Recording not available yet");
        const url = URL.createObjectURL(await r.blob());
        audio = new Audio(url); playingKey = id; drawAttendance();
        const stop = () => { if (playingKey === id) { playingKey = null; drawAttendance(); } URL.revokeObjectURL(url); };
        audio.onended = stop; audio.onpause = stop;
        await audio.play();
      } catch (err) { toast(err.message); playingKey = null; drawAttendance(); }
    }
  });

  // ---------- settings ----------
  function drawSettings() {
    if (!S) return;
    const s = S.settings, ags = S.agencies || [];
    const notif = "Notification" in window ? Notification.permission : "unsupported";
    $("v-settings").innerHTML = `
      <div class="ph"><div class="ph-l"><div class="ph-ico">${ic("sliders")}</div><div><h1>Settings</h1><div class="ph-sub">Agencies, phone numbers and keys</div></div></div>
        <span class="badge ${S.mode === "test" ? "" : "live"}">${S.mode === "test" ? "Test mode" : "Live"}</span></div>
      <div class="set-grid">
        <div class="card">
          <div class="card-h"><h2>Agencies</h2><button class="btn small primary" id="addAg">${ic("plus")}Add</button></div>
          ${ags.map((a) => `<div class="ag-row">${agIco(a)}<div class="ag-main"><div class="ag-name">${esc(a.name)}</div><div class="ag-sub">${esc(pretty(a.clock_number))} \u00b7 in ${a.in_steps.length} steps, out ${a.out_steps.length} steps</div></div><button class="btn small ghost" data-edit="${a.id}">Edit</button></div>`).join("") || '<div class="empty">No agencies yet</div>'}
        </div>
        <div>
          <form class="card" id="setForm" novalidate>
            <h2 style="margin-bottom:12px">You</h2>
            <label class="f">Your cell<input id="workerCell" type="tel" inputmode="tel" value="${esc(pretty(s.worker_cell))}" placeholder="(555) 555-0123"><span class="muted small" style="font-weight:400">Rings you for "Listen live" and test calls</span></label>
            <div class="seq">
              <label class="tog"><span class="tog-ico">${ic("bell")}</span><span class="tog-main"><span class="tog-t" style="display:block">Remind me to clock out</span><span class="muted small">Only a reminder. It never calls.</span></span><input id="remindOut" type="checkbox" class="switch" ${s.remind_out ? "checked" : ""}></label>
              <label class="f" style="margin-top:12px">Remind me after (hours clocked in)<input id="remindHours" type="number" inputmode="decimal" min="0.5" max="24" step="0.5" value="${esc(s.remind_hours)}"></label>
              ${notif === "default" ? '<button type="button" class="btn small ghost" id="askNotif">Allow notifications</button>' : notif === "granted" ? '<span class="muted small">Notifications are on. You\u2019ll also see a banner on the Clock screen.</span>' : '<span class="muted small">You\u2019ll see a banner on the Clock screen. (On iPhone, add the app to your Home Screen to allow notifications.)</span>'}
            </div>
            <div class="seq">
              <label class="tog"><span class="tog-ico">${ic("flask")}</span><span class="tog-main"><span class="tog-t" style="display:block">Test mode</span><span class="muted small">${S.telnyxReady ? "On: calls are simulated. Off: real calls." : "On until the phone line is connected. Calls are simulated."}</span></span><input id="forceTest" type="checkbox" class="switch" ${!S.telnyxReady || s.force_test ? "checked" : ""} ${S.telnyxReady ? "" : "disabled"}></label>
            </div>
            <button class="btn primary wide" type="submit" id="saveBtn">Save</button>
            <p id="setMsg" class="msg" hidden></p>
          </form>
          <div class="card">
            <h2>Test history</h2>
            <p class="muted small">Removes every Test-mode entry from Attendance (sample data and simulated calls). Real calls are kept.</p>
            <button class="btn danger wide" id="clearTest">Clear test history</button>
          </div>
          <button class="btn ghost wide" id="logoutBtn">${ic("logout")}Log out</button>
        </div>
      </div>`;
    $("logoutBtn").onclick = logout;
    $("addAg").onclick = () => editAgency(null);
    if ($("askNotif")) $("askNotif").onclick = async () => { try { await Notification.requestPermission(); } catch (_) { /* */ } drawSettings(); };
    $("clearTest").onclick = async () => {
      if (!(await confirmSheet("Clear test history?", "Removes all Test-mode entries. Real calls are kept.", "Clear"))) return;
      try { const d = await api("/history/test", { method: "DELETE" }); toast(`Removed ${d.deleted} test entries`); await loadState(); } catch (err) { toast(err.message); }
    };
    $("setForm").onsubmit = async (e) => {
      e.preventDefault(); $("saveBtn").disabled = true;
      try {
        const d = await api("/settings", { method: "PUT", body: { worker_cell: $("workerCell").value, listen_live: !!S.settings.listen_live, force_test: S.telnyxReady ? $("forceTest").checked : false, remind_out: $("remindOut").checked, remind_hours: Number($("remindHours").value) } });
        S.settings = d.settings; S.mode = d.mode;
        if (d.settings.remind_out && "Notification" in window && Notification.permission === "default") { try { await Notification.requestPermission(); } catch (_) { /* */ } }
        drawSettings(); const m = $("setMsg"); m.textContent = "Saved \u2713"; m.className = "msg ok"; m.hidden = false;
      } catch (err) { const m = $("setMsg"); m.textContent = err.message; m.className = "msg bad"; m.hidden = false; }
      finally { if ($("saveBtn")) $("saveBtn").disabled = false; }
    };
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-edit]"); if (b) editAgency(b.dataset.edit); });

  // agency editor (sheet)
  let ed = null;
  function editAgency(id) {
    const a = id ? agById(id) : null;
    ed = a ? JSON.parse(JSON.stringify(a)) : { id: null, name: "", icon: "briefcase", color: "#2563eb", clock_number: "", in_steps: [{ t: "wait", s: 4 }, { t: "press", d: "1" }], out_steps: [{ t: "wait", s: 4 }, { t: "press", d: "2" }] };
    $("sheet").dataset.lock = "1";
    sheet(`<h2>${a ? "Edit agency" : "Add agency"}</h2>
      <label class="f">Name<input id="eName" type="text" value="${esc(ed.name)}" placeholder="Agency name" maxlength="40"></label>
      <div class="f" style="font-weight:600;color:var(--ink)">Icon</div><div class="icons" id="eIcons"></div>
      <div class="f" style="font-weight:600;color:var(--ink)">Color</div><div class="swatches" id="eColors"></div>
      <label class="f">Clock-in phone number<input id="eNum" type="tel" inputmode="tel" value="${esc(pretty(ed.clock_number))}" placeholder="(555) 555-0100"></label>
      <div class="seq"><h2>Clock-in keys</h2><div class="steps" id="eIn"></div>
        <div class="seq-add"><button type="button" class="btn ghost small" data-add="in_steps" data-t="wait">+ Wait</button><button type="button" class="btn ghost small" data-add="in_steps" data-t="press">+ Press keys</button></div></div>
      <div class="seq" style="margin-top:14px"><h2>Clock-out keys</h2><div class="steps" id="eOut"></div>
        <div class="seq-add"><button type="button" class="btn ghost small" data-add="out_steps" data-t="wait">+ Wait</button><button type="button" class="btn ghost small" data-add="out_steps" data-t="press">+ Press keys</button></div></div>
      <button class="btn primary wide" id="eSave">Save</button>
      <p id="eMsg" class="msg" hidden></p>
      ${a ? `<div class="seq" style="margin-top:16px"><h2>Test call</h2><p class="muted small">Rings your cell and plays ${esc(a.name)}'s clock-in keys to you, so you can check the timing. Nothing is sent to the clock-in line. Save changes first.</p>
        <button class="btn wide" data-test="${a.id}">${ic("phone")}Make a test call</button><p id="tMsg" class="msg" hidden></p>
        <button class="btn danger wide" id="eDel">Remove agency</button></div>` : ""}
      <button class="btn ghost wide" id="eClose">Close</button>`);
    drawEd();
    $("eClose").onclick = () => { delete $("sheet").dataset.lock; closeSheet(); };
    $("eSave").onclick = saveAgency;
    if ($("eDel")) $("eDel").onclick = async () => {
      if (!confirm(`Remove ${a.name}? Its history stays in Attendance.`)) return;
      try { await api("/agencies/" + a.id, { method: "DELETE" }); await loadState(); delete $("sheet").dataset.lock; closeSheet(); drawSettings(); toast("Removed"); } catch (err) { emsg(err.message, false); }
    };
  }
  function emsg(t, ok, el = "eMsg") { const m = $(el); if (!m) return; m.textContent = t; m.className = "msg " + (ok ? "ok" : "bad"); m.hidden = false; }
  function drawEd() {
    $("eIcons").innerHTML = AG_ICONS.map((n) => `<button type="button" class="icp${ed.icon === n ? " on" : ""}" data-icon="${n}" aria-label="${n}">${ic(n)}</button>`).join("");
    $("eColors").innerHTML = COLORS.map((c) => `<button type="button" class="sw${ed.color === c ? " on" : ""}" data-color="${c}" style="background:${c}" aria-label="color"></button>`).join("");
    for (const [k, el] of [["in_steps", "eIn"], ["out_steps", "eOut"]]) {
      $(el).innerHTML = ed[k].map((s, i) => `<div class="step" data-k="${k}" data-i="${i}"><span class="step-n">${i + 1}</span><span class="step-kind">${s.t === "wait" ? "Wait" : "Press"}</span>
        ${s.t === "wait" ? `<input type="number" inputmode="decimal" min="0.5" max="30" step="0.5" value="${esc(s.s)}" data-f="s" aria-label="Seconds"><span class="unit">sec</span>`
          : `<input type="text" inputmode="tel" value="${esc(s.d)}" data-f="d" aria-label="Keys" placeholder="e.g. 123456#">`}
        <button type="button" data-mv aria-label="Move up">&#8593;</button><button type="button" data-del aria-label="Remove">&#10005;</button></div>`).join("") || '<div class="muted small">No steps yet</div>';
    }
  }
  document.addEventListener("input", (e) => {
    if (!ed) return;
    if (e.target.id === "eName") ed.name = e.target.value;
    if (e.target.id === "eNum") ed.clock_number = e.target.value;
    const row = e.target.closest(".step"); if (!row) return;
    const s = ed[row.dataset.k][+row.dataset.i];
    if (e.target.dataset.f === "s") s.s = Number(e.target.value);
    if (e.target.dataset.f === "d") s.d = e.target.value.replace(/\s/g, "");
  });
  document.addEventListener("click", async (e) => {
    if (!ed || $("sheet").hidden) return;
    const t = e.target;
    const icn = t.closest("[data-icon]"); if (icn) { ed.icon = icn.dataset.icon; drawEd(); return; }
    const col = t.closest("[data-color]"); if (col) { ed.color = col.dataset.color; drawEd(); return; }
    const add = t.closest("[data-add]"); if (add) { ed[add.dataset.add].push(add.dataset.t === "wait" ? { t: "wait", s: 2 } : { t: "press", d: "" }); drawEd(); return; }
    const row = t.closest(".step");
    if (row) {
      const list = ed[row.dataset.k], i = +row.dataset.i;
      if (t.closest("[data-del]")) { list.splice(i, 1); drawEd(); }
      else if (t.closest("[data-mv]") && i > 0) { [list[i - 1], list[i]] = [list[i], list[i - 1]]; drawEd(); }
      return;
    }
    const tb = t.closest("[data-test]");
    if (tb && !busy) {
      const ag = agById(tb.dataset.test);
      emsg("Starting test call...", true, "tMsg");
      const a = await placeCall("test", ag.id, (a) => emsg(a.stage || "Calling...", a.status !== "failed", "tMsg"));
      emsg(a.status === "done" ? "\u2705 Test call finished. Recording is in Attendance history." : "\u274c " + (a.stage || "Test call failed"), a.status === "done", "tMsg");
    }
  });
  async function saveAgency() {
    $("eSave").disabled = true;
    try {
      const body = { name: ed.name, icon: ed.icon, color: ed.color, clock_number: ed.clock_number, in_steps: ed.in_steps, out_steps: ed.out_steps };
      const d = ed.id ? await api("/agencies/" + ed.id, { method: "PUT", body }) : await api("/agencies", { method: "POST", body });
      await loadState();
      const wasNew = !ed.id;
      ed = JSON.parse(JSON.stringify(d.agency));
      emsg("Saved \u2713", true);
      drawSettings();
      if (wasNew) { delete $("sheet").dataset.lock; closeSheet(); toast(`${d.agency.name} added`); }
    } catch (err) { emsg(err.message, false); }
    finally { if ($("eSave")) $("eSave").disabled = false; }
  }

  // ---------- boot ----------
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  (async () => {
    if (token) { try { await loadState(); } catch (_) { /* */ } }
    route();
    if (token) notifyOverdue();
  })();
})();

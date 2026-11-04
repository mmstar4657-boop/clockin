try {
  (() => {
    const API = "https://xgxswoaxalhdfjjxelyt.supabase.co/functions/v1/clockin-api";
    const $ = (id) => document.getElementById(id);
    const TOKEN_KEY = "clk_token";
    let token = localStorage.getItem(TOKEN_KEY) || "";
    let S = null;
    let busy = false, cur = null;
    let range = 7, page = 0, attRows = [], attAll = [];
    let audio = null, playingKey = null;
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
      building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>'
    };
    const AG_ICONS = ["handshake", "heart", "users", "hand", "star", "home", "briefcase", "smile", "sun", "building"];
    const COLORS = ["#2563eb", "#ef4444", "#16a34a", "#7c3aed", "#f59e0b", "#0891b2", "#db2777", "#0b1f4d"];
    const ic = (n, cls = "i") => '<svg class="'.concat(cls, '" viewBox="0 0 24 24">').concat(P[n] || P.briefcase, "</svg>");
    const playIc = (on) => '<svg viewBox="0 0 24 24">'.concat(on ? P.pause : P.play, "</svg>");
    async function api(path, opts = {}) {
      const headers = { "content-type": "application/json" };
      if (token) headers.authorization = "Bearer " + token;
      let r;
      try {
        r = await fetch(API + path, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : void 0, cache: "no-store" });
      } catch (e) {
        throw new Error("No connection. Check your internet and try again.");
      }
      if (opts.raw) {
        if (r.status === 401) logout();
        return r;
      }
      const data = await r.json().catch(() => ({}));
      if (r.status === 401 && path !== "/login") {
        logout();
        throw new Error("Please log in again");
      }
      if (!r.ok || data.ok === false) throw new Error(data.error || "Error " + r.status);
      return data;
    }
    const esc = (s) => String(s != null ? s : "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
    const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const isToday = (iso) => new Date(iso).toDateString() === (/* @__PURE__ */ new Date()).toDateString();
    const fmtDate = (iso) => new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    const fmtDayShort = (iso) => new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
    const dur = (ms) => {
      const m = Math.max(0, Math.round(ms / 6e4));
      return m < 60 ? "".concat(m, "m") : "".concat(Math.floor(m / 60), "h ").concat(String(m % 60).padStart(2, "0"), "m");
    };
    const pretty = (n) => {
      const d = String(n || "").replace(/\D/g, "");
      return d.length === 11 && d[0] === "1" ? "(".concat(d.slice(1, 4), ") ").concat(d.slice(4, 7), "-").concat(d.slice(7)) : n || "";
    };
    const verb = (a) => a === "in" ? "Clocked in" : a === "out" ? "Clocked out" : "Test call";
    const agById = (id) => ((S == null ? void 0 : S.agencies) || []).find((a) => a.id === id);
    const agIco = (a, size = "ag-ico") => '<span class="'.concat(size, '" style="background:').concat(esc((a == null ? void 0 : a.color) || "#94a3b8"), '">').concat(ic((a == null ? void 0 : a.icon) || "briefcase"), "</span>");
    function toast(t) {
      const el = $("toast");
      el.textContent = t;
      el.hidden = false;
      clearTimeout(toast.t);
      toast.t = setTimeout(() => el.hidden = true, 2600);
    }
    const VIEWS = [["clock", "Clock", "clock"], ["attendance", "Attendance", "cal"], ["settings", "Settings", "sliders"]];
    $("nav").innerHTML = VIEWS.map(([k, t, i]) => '<a href="#'.concat(k, '" data-v="').concat(k, '">').concat(ic(i)).concat(t, "</a>")).join("");
    $("tabs").innerHTML = VIEWS.map(([k, t, i]) => '<a href="#'.concat(k, '" data-v="').concat(k, '">').concat(ic(i)).concat(t, "</a>")).join("");
    $("logoutSide").innerHTML = ic("logout") + "Log out";
    function route() {
      if (!token) {
        $("login").hidden = false;
        $("shell").hidden = true;
        return;
      }
      $("login").hidden = true;
      $("shell").hidden = false;
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
    $("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      $("loginErr").hidden = true;
      try {
        const d = await api("/login", { method: "POST", body: { password: $("pw").value } });
        token = d.token;
        localStorage.setItem(TOKEN_KEY, token);
        $("pw").value = "";
        await loadState();
        location.hash = "#clock";
        route();
      } catch (err) {
        $("loginErr").textContent = err.message;
        $("loginErr").hidden = false;
      }
    });
    function logout() {
      token = "";
      localStorage.removeItem(TOKEN_KEY);
      S = null;
      route();
    }
    $("logoutSide").addEventListener("click", logout);
    async function loadState() {
      S = await api("/state");
    }
    function sheet(html) {
      $("sheetCard").innerHTML = html;
      $("sheet").hidden = false;
    }
    function closeSheet() {
      $("sheet").hidden = true;
      $("sheetCard").innerHTML = "";
    }
    $("sheet").addEventListener("click", (e) => {
      if (e.target === $("sheet") && !$("sheet").dataset.lock) closeSheet();
    });
    function confirmSheet(title, sub, yes = "Call now") {
      return new Promise((res) => {
        sheet("<h2>".concat(esc(title), '</h2><p class="muted">').concat(esc(sub), '</p>\n        <button class="btn primary wide" id="cYes">').concat(ic("phone")).concat(esc(yes), '</button>\n        <button class="btn ghost wide" id="cNo">Cancel</button>'));
        $("cYes").onclick = () => {
          closeSheet();
          res(true);
        };
        $("cNo").onclick = () => {
          closeSheet();
          res(false);
        };
      });
    }
    const openFor = (id) => ((S == null ? void 0 : S.open) || []).find((o) => o.agency_id === id);
    function resultHtml() {
      const a = cur || (S == null ? void 0 : S.last);
      if (!a) return { k: "idle", i: "&#128222;", t: "Ready", s: "Tap an agency when you start or stop work" };
      const who = a.agency_name ? " · ".concat(a.agency_name) : "";
      if (a.status === "done") return { k: "ok", i: "&#9989;", t: "".concat(verb(a.action), " ").concat(fmtTime(a.created_at)), s: (isToday(a.created_at) ? "" : fmtDayShort(a.created_at) + " · ") + (a.agency_name || "") + (a.mode === "test" ? " · Test mode, no real call" : " · All keys sent") };
      if (a.status === "failed") return { k: "bad", i: "&#10060;", t: "Failed, try again", s: (a.stage || "") + who };
      return { k: "busy", i: '<div class="spin"></div>', t: a.stage || "Calling...", s: (a.action === "in" ? "Clock in" : a.action === "out" ? "Clock out" : "Test call") + who };
    }
    function drawResult() {
      const r = resultHtml(), el = $("result");
      if (!el) return;
      el.className = "result " + r.k;
      el.innerHTML = '<div class="result-icon">'.concat(r.i, '</div><div><div class="result-title">').concat(esc(r.t), '</div><div class="result-sub">').concat(esc(r.s), "</div></div>");
    }
    function agBtn(a, kind) {
      const o = openFor(a.id);
      let sub = pretty(a.clock_number), cls = "";
      if (o) {
        sub = kind === "out" ? "In since ".concat(fmtTime(o.since), " · ").concat(dur(Date.now() - new Date(o.since))) : "Clocked in at ".concat(fmtTime(o.since));
        cls = kind === "out" ? " open" : "";
      }
      return '<button class="ag-btn'.concat(cls, '" data-clock="').concat(kind, '" data-ag="').concat(a.id, '" ').concat(busy ? "disabled" : "", ">\n      ").concat(agIco(a), '<span class="ag-main"><span class="ag-name">').concat(esc(a.name), '</span><span class="ag-sub').concat(o ? " on" : "", '" style="display:block">').concat(esc(sub), '</span></span>\n      <span class="ag-go ').concat(kind, '">').concat(ic(kind === "in" ? "login" : "logout"), "</span></button>");
    }
    function drawClock() {
      if (!S) return;
      const test = S.mode === "test";
      const ags = S.agencies || [];
      $("v-clock").innerHTML = '\n      <div class="ph"><div class="ph-l"><div class="ph-ico">'.concat(ic("clock"), '</div><div><h1>Clock</h1><div class="ph-sub">Tap when you start or stop work</div></div></div>\n        <span class="badge ').concat(test ? "" : "live", '">').concat(test ? "Test mode" : "Live", '</span></div>\n      <div id="remind"></div>\n      <div class="top-row">\n        <div class="card"><div id="result" class="result"></div></div>\n        <div class="card"><label class="tog"><span class="tog-ico">').concat(ic("headphones"), '</span><span class="tog-main"><span class="tog-t" style="display:block">Listen live</span><span class="muted small">Rings your cell first so you hear the call</span></span>\n          <input id="listen" type="checkbox" class="switch" ').concat(S.settings.listen_live ? "checked" : "", '></label></div>\n      </div>\n      <div class="clock-cards">\n        <div class="cc"><div class="cc-h in"><span class="dot">').concat(ic("login"), '</span><div><b>Clock In</b><span>Starting work</span></div></div>\n          <div class="cc-list">').concat(ags.map((a) => agBtn(a, "in")).join("") || '<div class="empty">Add an agency in Settings</div>', '</div></div>\n        <div class="cc"><div class="cc-h out"><span class="dot">').concat(ic("logout"), '</span><div><b>Clock Out</b><span>Done with work</span></div></div>\n          <div class="cc-list">').concat(ags.map((a) => agBtn(a, "out")).join("") || '<div class="empty">Add an agency in Settings</div>', "</div></div>\n      </div>");
      drawResult();
      drawReminder();
      $("listen").addEventListener("change", async (e) => {
        S.settings.listen_live = e.target.checked;
        try {
          await api("/listen", { method: "PUT", body: { listen_live: e.target.checked } });
        } catch (_) {
        }
      });
    }
    document.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-clock]");
      if (!b || busy) return;
      const kind = b.dataset.clock, ag = agById(b.dataset.ag);
      if (!ag) return;
      const listen = !!S.settings.listen_live;
      const sub = (S.mode === "test" ? "Test mode: the call is simulated. " : "") + (listen ? "Your cell rings first. Pick up and you'll hear it dial ".concat(ag.name, " and press the keys.") : "Calls ".concat(ag.name, " at ").concat(pretty(ag.clock_number), " and presses the ").concat(kind === "in" ? "clock-in" : "clock-out", " keys."));
      if (!await confirmSheet("".concat(kind === "in" ? "Clock in" : "Clock out", " · ").concat(ag.name, "?"), sub)) return;
      await placeCall(kind, ag.id, () => {
        drawResult();
      });
      try {
        await loadState();
      } catch (_) {
      }
      if (!$("v-clock").hidden) drawClock();
    });
    async function placeCall(action, agencyId, onUpdate) {
      var _a;
      busy = true;
      document.querySelectorAll("[data-clock],[data-test]").forEach((x) => x.disabled = true);
      try {
        const d = await api("/call", { method: "POST", body: { action, agency_id: agencyId, listen: !!S.settings.listen_live } });
        cur = d.attempt;
        onUpdate(cur);
        const t0 = Date.now();
        while (!["done", "failed"].includes(cur.status) && Date.now() - t0 < 2e5) {
          await new Promise((r) => setTimeout(r, 1e3));
          try {
            cur = (await api("/attempt/" + cur.id)).attempt;
            onUpdate(cur);
          } catch (_) {
          }
        }
      } catch (err) {
        cur = { status: "failed", stage: err.message, action, created_at: (/* @__PURE__ */ new Date()).toISOString(), agency_name: ((_a = agById(agencyId)) == null ? void 0 : _a.name) || "" };
        onUpdate(cur);
      } finally {
        busy = false;
        document.querySelectorAll("[data-clock],[data-test]").forEach((x) => x.disabled = false);
      }
      return cur;
    }
    function overdue() {
      var _a;
      if (!((_a = S == null ? void 0 : S.settings) == null ? void 0 : _a.remind_out)) return [];
      const lim = (S.settings.remind_hours || 8) * 36e5;
      return (S.open || []).filter((o) => Date.now() - new Date(o.since) > lim);
    }
    function drawReminder() {
      const el = $("remind");
      if (!el) return;
      const od = overdue();
      el.innerHTML = od.map((o) => {
        const a = agById(o.agency_id);
        return '<div class="remind">'.concat(ic("bell"), "<span>Still clocked in with ").concat(esc((a == null ? void 0 : a.name) || "an agency"), " since ").concat(fmtTime(o.since), " (").concat(dur(Date.now() - new Date(o.since)), "). Tap Clock Out when you're done.</span></div>");
      }).join("");
    }
    async function notifyOverdue() {
      const od = overdue();
      for (const o of od) {
        const key = "clk_reminded_" + o.agency_id + "_" + o.since;
        if (localStorage.getItem(key)) continue;
        localStorage.setItem(key, "1");
        const a = agById(o.agency_id);
        const body = "Still clocked in with ".concat((a == null ? void 0 : a.name) || "an agency", " since ").concat(fmtTime(o.since), ". Open the app to clock out.");
        try {
          if ("Notification" in window && Notification.permission === "granted") {
            const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
            if (reg) reg.showNotification("Clock out reminder", { body, tag: key, icon: "icons/icon-192.png?v=3" });
            else new Notification("Clock out reminder", { body, tag: key, icon: "icons/icon-192.png?v=3" });
          }
        } catch (_) {
        }
      }
      drawReminder();
    }
    setInterval(async () => {
      if (token && !busy) {
        try {
          await loadState();
        } catch (_) {
        }
        if (!$("v-clock").hidden) drawClock();
        notifyOverdue();
      }
    }, 6e4);
    document.addEventListener("visibilitychange", async () => {
      if (!document.hidden && token && !busy) {
        try {
          await loadState();
        } catch (_) {
        }
        route();
        notifyOverdue();
      }
    });
    function pair(attempts) {
      const list = attempts.filter((a) => a.action === "in" || a.action === "out").sort((x, y) => new Date(x.created_at) - new Date(y.created_at));
      const open = /* @__PURE__ */ new Map(), rows = [];
      for (const a of list) {
        const key = a.agency_id || a.agency_name;
        if (a.action === "in" && a.status === "done") {
          if (open.has(key)) rows.push({ in: open.get(key), status: "warn" });
          open.set(key, a);
        } else if (a.action === "in" && a.status === "failed") rows.push({ in: a, status: "bad" });
        else if (a.action === "out" && a.status === "done") {
          if (open.has(key)) {
            rows.push({ in: open.get(key), out: a, status: "ok" });
            open.delete(key);
          } else rows.push({ out: a, status: "ok" });
        } else if (a.action === "out" && a.status === "failed") rows.push({ out: a, status: "bad" });
        else rows.push({ [a.action]: a, status: "open" });
      }
      for (const a of open.values()) rows.push({ in: a, status: "open" });
      for (const r of rows) r.t = new Date((r.in || r.out).created_at);
      return rows.sort((x, y) => y.t - x.t);
    }
    async function loadAttendance() {
      drawAttendanceShell();
      try {
        const { attempts } = await api("/history?days=" + range);
        attAll = attempts;
        attRows = pair(attempts);
        page = 0;
        drawAttendance();
      } catch (err) {
        $("attBody").innerHTML = '<div class="empty">'.concat(esc(err.message), "</div>");
      }
    }
    function drawAttendanceShell() {
      $("v-attendance").innerHTML = '\n      <div class="ph"><div class="ph-l"><div class="ph-ico">'.concat(ic("cal"), '</div><div><h1>Attendance</h1><div class="ph-sub">Every clock in and out, with recordings</div></div></div>\n        <div class="seg" id="rangeSeg">').concat([[7, "Last 7 days"], [30, "Last 30 days"], [0, "All"]].map(([d, t]) => '<button data-range="'.concat(d, '" class="').concat(d === range ? "on" : "", '">').concat(t, "</button>")).join(""), '</div></div>\n      <div class="stats" id="stats"></div>\n      <div class="card" id="attBody"><div class="empty">Loading...</div></div>');
    }
    const PILL = { ok: '<span class="pill ok">Successful</span>', bad: '<span class="pill bad">Failed</span>', open: '<span class="pill open">Clocked in</span>', warn: '<span class="pill warn">No clock out</span>' };
    function recBtns(r) {
      var _a, _b;
      let h = "";
      if ((_a = r.in) == null ? void 0 : _a.has_recording) h += '<button class="play" data-play="'.concat(r.in.id, '">').concat(playIc(playingKey === r.in.id), "In</button>");
      if ((_b = r.out) == null ? void 0 : _b.has_recording) h += '<button class="play" data-play="'.concat(r.out.id, '">').concat(playIc(playingKey === r.out.id), "Out</button>");
      return h ? '<div class="recs">'.concat(h, "</div>") : '<span class="muted">—</span>';
    }
    function drawAttendance() {
      const sessions = attRows.filter((r) => r.in && r.out && r.status === "ok");
      const totalMs = sessions.reduce((s, r) => s + (new Date(r.out.created_at) - new Date(r.in.created_at)), 0);
      const calls = attAll.filter((a) => (a.action === "in" || a.action === "out") && ["done", "failed"].includes(a.status));
      const okCalls = calls.filter((a) => a.status === "done").length;
      const stats = [
        ["list", "#2563eb", "#e8f0fe", sessions.length, "Total sessions"],
        ["clock", "#7c3aed", "#f3e8ff", (totalMs / 36e5).toFixed(1) + "h", "Total hours"],
        ["timer", "#0891b2", "#cffafe", sessions.length ? dur(totalMs / sessions.length) : "—", "Avg session"],
        ["pct", "#16a34a", "#dcfce7", calls.length ? Math.round(okCalls / calls.length * 100) + "%" : "—", "Success rate"]
      ];
      $("stats").innerHTML = stats.map(([i, c, bg, v, l]) => '<div class="stat"><span class="stat-ico" style="color:'.concat(c, ";background:").concat(bg, '">').concat(ic(i), '</span><div><div class="stat-v">').concat(v, '</div><div class="stat-l">').concat(l, "</div></div></div>")).join("");
      if (!attRows.length) {
        $("attBody").innerHTML = '<div class="empty">No clock ins in this range yet</div>';
        return;
      }
      const per = 10, pages = Math.ceil(attRows.length / per);
      page = Math.min(page, pages - 1);
      const rows = attRows.slice(page * per, page * per + per);
      const agCell = (r) => {
        const a0 = r.in || r.out;
        const a = agById(a0.agency_id) || { name: a0.agency_name, color: "#94a3b8", icon: "briefcase" };
        return '<span class="agc"><i style="background:'.concat(esc(a.color), '">').concat(ic(a.icon), "</i>").concat(esc(a0.agency_name || a.name), "</span>");
      };
      const tin = (r) => r.in ? fmtTime(r.in.created_at) + (r.in.status === "failed" ? " ✖" : "") : "—";
      const tout = (r) => r.out ? fmtTime(r.out.created_at) + (r.out.status === "failed" ? " ✖" : "") : "—";
      const len = (r) => r.in && r.out && r.status === "ok" ? dur(new Date(r.out.created_at) - new Date(r.in.created_at)) : "—";
      const isTest = (r) => (r.in || r.out).mode === "test" ? ' <span class="pill t">Test</span>' : "";
      const table = '<div class="wide-only"><table class="att"><thead><tr><th>Date</th><th>Agency</th><th>Clock in</th><th>Clock out</th><th>Session</th><th>Status</th><th>Recording</th></tr></thead><tbody>\n      '.concat(rows.map((r) => "<tr><td>".concat(fmtDate(r.t), "</td><td>").concat(agCell(r), "</td><td>").concat(tin(r), "</td><td>").concat(tout(r), "</td><td>").concat(len(r), "</td><td>").concat(PILL[r.status]).concat(isTest(r), "</td><td>").concat(recBtns(r), "</td></tr>")).join(""), "\n      </tbody></table></div>");
      const cards = '<div class="narrow-only att-cards">'.concat(rows.map((r) => '<div class="ac">\n      <div class="ac-top">'.concat(agCell(r), "<span>").concat(PILL[r.status]).concat(isTest(r), '</span></div>\n      <div class="ac-grid"><div><b>Date</b>').concat(fmtDayShort(r.t), "</div><div><b>In</b>").concat(tin(r), "</div><div><b>Out</b>").concat(tout(r), '</div></div>\n      <div class="ac-foot"><span class="small muted">Session: <b style="color:var(--ink)">').concat(len(r), "</b></span>").concat(recBtns(r), "</div></div>")).join(""), "</div>");
      $("attBody").innerHTML = table + cards + '<div class="pager"><button class="btn small" data-pg="-1" '.concat(page ? "" : "disabled", ">&#8249; Prev</button><span>Page ").concat(page + 1, " of ").concat(pages, " · ").concat(attRows.length, ' rows</span><button class="btn small" data-pg="1" ').concat(page < pages - 1 ? "" : "disabled", ">Next &#8250;</button></div>");
    }
    document.addEventListener("click", async (e) => {
      const rg = e.target.closest("[data-range]");
      if (rg) {
        range = +rg.dataset.range;
        loadAttendance();
        return;
      }
      const pg = e.target.closest("[data-pg]");
      if (pg) {
        page += +pg.dataset.pg;
        drawAttendance();
        document.getElementById("attBody").scrollIntoView({ block: "start", behavior: "smooth" });
        return;
      }
      const pl = e.target.closest("[data-play]");
      if (pl) {
        const id = pl.dataset.play;
        if (audio && playingKey === id) {
          audio.pause();
          return;
        }
        if (audio) audio.pause();
        pl.disabled = true;
        try {
          const r = await api("/recording/" + id, { raw: true });
          if (!r.ok) throw new Error("Recording not available yet");
          const url = URL.createObjectURL(await r.blob());
          audio = new Audio(url);
          playingKey = id;
          drawAttendance();
          const stop = () => {
            if (playingKey === id) {
              playingKey = null;
              drawAttendance();
            }
            URL.revokeObjectURL(url);
          };
          audio.onended = stop;
          audio.onpause = stop;
          await audio.play();
        } catch (err) {
          toast(err.message);
          playingKey = null;
          drawAttendance();
        }
      }
    });
    function drawSettings() {
      if (!S) return;
      const s = S.settings, ags = S.agencies || [];
      const notif = "Notification" in window ? Notification.permission : "unsupported";
      $("v-settings").innerHTML = '\n      <div class="ph"><div class="ph-l"><div class="ph-ico">'.concat(ic("sliders"), '</div><div><h1>Settings</h1><div class="ph-sub">Agencies, phone numbers and keys</div></div></div>\n        <span class="badge ').concat(S.mode === "test" ? "" : "live", '">').concat(S.mode === "test" ? "Test mode" : "Live", '</span></div>\n      <div class="set-grid">\n        <div class="card">\n          <div class="card-h"><h2>Agencies</h2><button class="btn small primary" id="addAg">').concat(ic("plus"), "Add</button></div>\n          ").concat(ags.map((a) => '<div class="ag-row">'.concat(agIco(a), '<div class="ag-main"><div class="ag-name">').concat(esc(a.name), '</div><div class="ag-sub">').concat(esc(pretty(a.clock_number)), " · in ").concat(a.in_steps.length, " steps, out ").concat(a.out_steps.length, ' steps</div></div><button class="btn small ghost" data-edit="').concat(a.id, '">Edit</button></div>')).join("") || '<div class="empty">No agencies yet</div>', '\n        </div>\n        <div>\n          <form class="card" id="setForm" novalidate>\n            <h2 style="margin-bottom:12px">You</h2>\n            <label class="f">Your cell<input id="workerCell" type="tel" inputmode="tel" value="').concat(esc(pretty(s.worker_cell)), '" placeholder="(555) 555-0123"><span class="muted small" style="font-weight:400">Rings you for "Listen live" and test calls</span></label>\n            <div class="seq">\n              <label class="tog"><span class="tog-ico">').concat(ic("bell"), '</span><span class="tog-main"><span class="tog-t" style="display:block">Remind me to clock out</span><span class="muted small">Only a reminder. It never calls.</span></span><input id="remindOut" type="checkbox" class="switch" ').concat(s.remind_out ? "checked" : "", '></label>\n              <label class="f" style="margin-top:12px">Remind me after (hours clocked in)<input id="remindHours" type="number" inputmode="decimal" min="0.5" max="24" step="0.5" value="').concat(esc(s.remind_hours), '"></label>\n              ').concat(notif === "default" ? '<button type="button" class="btn small ghost" id="askNotif">Allow notifications</button>' : notif === "granted" ? '<span class="muted small">Notifications are on. You’ll also see a banner on the Clock screen.</span>' : '<span class="muted small">You’ll see a banner on the Clock screen. (On iPhone, add the app to your Home Screen to allow notifications.)</span>', '\n            </div>\n            <div class="seq">\n              <label class="tog"><span class="tog-ico">').concat(ic("flask"), '</span><span class="tog-main"><span class="tog-t" style="display:block">Test mode</span><span class="muted small">').concat(S.telnyxReady ? "On: calls are simulated. Off: real calls." : "On until the phone line is connected. Calls are simulated.", '</span></span><input id="forceTest" type="checkbox" class="switch" ').concat(!S.telnyxReady || s.force_test ? "checked" : "", " ").concat(S.telnyxReady ? "" : "disabled", '></label>\n            </div>\n            <button class="btn primary wide" type="submit" id="saveBtn">Save</button>\n            <p id="setMsg" class="msg" hidden></p>\n          </form>\n          <div class="card">\n            <h2>Test history</h2>\n            <p class="muted small">Removes every Test-mode entry from Attendance (sample data and simulated calls). Real calls are kept.</p>\n            <button class="btn danger wide" id="clearTest">Clear test history</button>\n          </div>\n          <button class="btn ghost wide" id="logoutBtn">').concat(ic("logout"), "Log out</button>\n        </div>\n      </div>");
      $("logoutBtn").onclick = logout;
      $("addAg").onclick = () => editAgency(null);
      if ($("askNotif")) $("askNotif").onclick = async () => {
        try {
          await Notification.requestPermission();
        } catch (_) {
        }
        drawSettings();
      };
      $("clearTest").onclick = async () => {
        if (!await confirmSheet("Clear test history?", "Removes all Test-mode entries. Real calls are kept.", "Clear")) return;
        try {
          const d = await api("/history/test", { method: "DELETE" });
          toast("Removed ".concat(d.deleted, " test entries"));
          await loadState();
        } catch (err) {
          toast(err.message);
        }
      };
      $("setForm").onsubmit = async (e) => {
        e.preventDefault();
        $("saveBtn").disabled = true;
        try {
          const d = await api("/settings", { method: "PUT", body: { worker_cell: $("workerCell").value, listen_live: !!S.settings.listen_live, force_test: S.telnyxReady ? $("forceTest").checked : false, remind_out: $("remindOut").checked, remind_hours: Number($("remindHours").value) } });
          S.settings = d.settings;
          S.mode = d.mode;
          if (d.settings.remind_out && "Notification" in window && Notification.permission === "default") {
            try {
              await Notification.requestPermission();
            } catch (_) {
            }
          }
          drawSettings();
          const m = $("setMsg");
          m.textContent = "Saved ✓";
          m.className = "msg ok";
          m.hidden = false;
        } catch (err) {
          const m = $("setMsg");
          m.textContent = err.message;
          m.className = "msg bad";
          m.hidden = false;
        } finally {
          if ($("saveBtn")) $("saveBtn").disabled = false;
        }
      };
    }
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-edit]");
      if (b) editAgency(b.dataset.edit);
    });
    let ed = null;
    function editAgency(id) {
      const a = id ? agById(id) : null;
      ed = a ? JSON.parse(JSON.stringify(a)) : { id: null, name: "", icon: "briefcase", color: "#2563eb", clock_number: "", in_steps: [{ t: "wait", s: 4 }, { t: "press", d: "1" }], out_steps: [{ t: "wait", s: 4 }, { t: "press", d: "2" }] };
      $("sheet").dataset.lock = "1";
      sheet("<h2>".concat(a ? "Edit agency" : "Add agency", '</h2>\n      <label class="f">Name<input id="eName" type="text" value="').concat(esc(ed.name), '" placeholder="Agency name" maxlength="40"></label>\n      <div class="f" style="font-weight:600;color:var(--ink)">Icon</div><div class="icons" id="eIcons"></div>\n      <div class="f" style="font-weight:600;color:var(--ink)">Color</div><div class="swatches" id="eColors"></div>\n      <label class="f">Clock-in phone number<input id="eNum" type="tel" inputmode="tel" value="').concat(esc(pretty(ed.clock_number)), '" placeholder="(555) 555-0100"></label>\n      <div class="seq"><h2>Clock-in keys</h2><div class="steps" id="eIn"></div>\n        <div class="seq-add"><button type="button" class="btn ghost small" data-add="in_steps" data-t="wait">+ Wait</button><button type="button" class="btn ghost small" data-add="in_steps" data-t="press">+ Press keys</button></div></div>\n      <div class="seq" style="margin-top:14px"><h2>Clock-out keys</h2><div class="steps" id="eOut"></div>\n        <div class="seq-add"><button type="button" class="btn ghost small" data-add="out_steps" data-t="wait">+ Wait</button><button type="button" class="btn ghost small" data-add="out_steps" data-t="press">+ Press keys</button></div></div>\n      <button class="btn primary wide" id="eSave">Save</button>\n      <p id="eMsg" class="msg" hidden></p>\n      ').concat(a ? '<div class="seq" style="margin-top:16px"><h2>Test call</h2><p class="muted small">Rings your cell and plays '.concat(esc(a.name), '\'s clock-in keys to you, so you can check the timing. Nothing is sent to the clock-in line. Save changes first.</p>\n        <button class="btn wide" data-test="').concat(a.id, '">').concat(ic("phone"), 'Make a test call</button><p id="tMsg" class="msg" hidden></p>\n        <button class="btn danger wide" id="eDel">Remove agency</button></div>') : "", '\n      <button class="btn ghost wide" id="eClose">Close</button>'));
      drawEd();
      $("eClose").onclick = () => {
        delete $("sheet").dataset.lock;
        closeSheet();
      };
      $("eSave").onclick = saveAgency;
      if ($("eDel")) $("eDel").onclick = async () => {
        if (!confirm("Remove ".concat(a.name, "? Its history stays in Attendance."))) return;
        try {
          await api("/agencies/" + a.id, { method: "DELETE" });
          await loadState();
          delete $("sheet").dataset.lock;
          closeSheet();
          drawSettings();
          toast("Removed");
        } catch (err) {
          emsg(err.message, false);
        }
      };
    }
    function emsg(t, ok, el = "eMsg") {
      const m = $(el);
      if (!m) return;
      m.textContent = t;
      m.className = "msg " + (ok ? "ok" : "bad");
      m.hidden = false;
    }
    function drawEd() {
      $("eIcons").innerHTML = AG_ICONS.map((n) => '<button type="button" class="icp'.concat(ed.icon === n ? " on" : "", '" data-icon="').concat(n, '" aria-label="').concat(n, '">').concat(ic(n), "</button>")).join("");
      $("eColors").innerHTML = COLORS.map((c) => '<button type="button" class="sw'.concat(ed.color === c ? " on" : "", '" data-color="').concat(c, '" style="background:').concat(c, '" aria-label="color"></button>')).join("");
      for (const [k, el] of [["in_steps", "eIn"], ["out_steps", "eOut"]]) {
        $(el).innerHTML = ed[k].map((s, i) => '<div class="step" data-k="'.concat(k, '" data-i="').concat(i, '"><span class="step-n">').concat(i + 1, '</span><span class="step-kind">').concat(s.t === "wait" ? "Wait" : "Press", "</span>\n        ").concat(s.t === "wait" ? '<input type="number" inputmode="decimal" min="0.5" max="30" step="0.5" value="'.concat(esc(s.s), '" data-f="s" aria-label="Seconds"><span class="unit">sec</span>') : '<input type="text" inputmode="tel" value="'.concat(esc(s.d), '" data-f="d" aria-label="Keys" placeholder="e.g. 123456#">'), '\n        <button type="button" data-mv aria-label="Move up">&#8593;</button><button type="button" data-del aria-label="Remove">&#10005;</button></div>')).join("") || '<div class="muted small">No steps yet</div>';
      }
    }
    document.addEventListener("input", (e) => {
      if (!ed) return;
      if (e.target.id === "eName") ed.name = e.target.value;
      if (e.target.id === "eNum") ed.clock_number = e.target.value;
      const row = e.target.closest(".step");
      if (!row) return;
      const s = ed[row.dataset.k][+row.dataset.i];
      if (e.target.dataset.f === "s") s.s = Number(e.target.value);
      if (e.target.dataset.f === "d") s.d = e.target.value.replace(/\s/g, "");
    });
    document.addEventListener("click", async (e) => {
      if (!ed || $("sheet").hidden) return;
      const t = e.target;
      const icn = t.closest("[data-icon]");
      if (icn) {
        ed.icon = icn.dataset.icon;
        drawEd();
        return;
      }
      const col = t.closest("[data-color]");
      if (col) {
        ed.color = col.dataset.color;
        drawEd();
        return;
      }
      const add = t.closest("[data-add]");
      if (add) {
        ed[add.dataset.add].push(add.dataset.t === "wait" ? { t: "wait", s: 2 } : { t: "press", d: "" });
        drawEd();
        return;
      }
      const row = t.closest(".step");
      if (row) {
        const list = ed[row.dataset.k], i = +row.dataset.i;
        if (t.closest("[data-del]")) {
          list.splice(i, 1);
          drawEd();
        } else if (t.closest("[data-mv]") && i > 0) {
          [list[i - 1], list[i]] = [list[i], list[i - 1]];
          drawEd();
        }
        return;
      }
      const tb = t.closest("[data-test]");
      if (tb && !busy) {
        const ag = agById(tb.dataset.test);
        emsg("Starting test call...", true, "tMsg");
        const a = await placeCall("test", ag.id, (a2) => emsg(a2.stage || "Calling...", a2.status !== "failed", "tMsg"));
        emsg(a.status === "done" ? "✅ Test call finished. Recording is in Attendance history." : "❌ " + (a.stage || "Test call failed"), a.status === "done", "tMsg");
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
        emsg("Saved ✓", true);
        drawSettings();
        if (wasNew) {
          delete $("sheet").dataset.lock;
          closeSheet();
          toast("".concat(d.agency.name, " added"));
        }
      } catch (err) {
        emsg(err.message, false);
      } finally {
        if ($("eSave")) $("eSave").disabled = false;
      }
    }
    function regSW() {
      try {
        if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js?v=3").catch(() => {
        });
      } catch (_) {
      }
    }
    if (token) {
      $("login").hidden = true;
      $("bootMsg").hidden = false;
    }
    (async () => {
      if (token) {
        try {
          await loadState();
        } catch (_) {
        }
      }
      $("bootMsg").hidden = true;
      route();
      window.__clkReady();
      if (token) {
        try {
          await notifyOverdue();
        } catch (_) {
        }
      }
      setTimeout(regSW, 4e3);
    })().catch((e) => window.__clkFail(e));
  })();
} catch (e) {
  window.__clkFail(e);
}

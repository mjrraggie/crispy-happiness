(function () {
  "use strict";

  const SCOPES = ["Calendars.ReadWrite", "User.Read"];
  const GRAPH = "https://graph.microsoft.com/v1.0";
  const DRAFT_KEY = "quickEvent.draft";
  const CAL_KEY = "quickEvent.calendar";
  const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const $ = (id) => document.getElementById(id);
  const els = {
    who: $("who"), status: $("status"), setup: $("setup"), signin: $("signin"), signinBtn: $("signinBtn"),
    form: $("form"), quick: $("quick"), summary: $("summary"), title: $("title"), allDay: $("allDay"),
    start: $("start"), end: $("end"), location: $("location"), reminder: $("reminder"), showAs: $("showAs"),
    calendar: $("calendar"), notes: $("notes"), createBtn: $("createBtn"), resetBtn: $("resetBtn"),
  };

  const cfg = window.APP_CONFIG || {};
  let pca, account;

  // ---------- helpers ----------
  const pad = (n) => String(n).padStart(2, "0");
  const toLocalInput = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const toDateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromInput = (v) => (v ? new Date(v.length === 10 ? v + "T00:00" : v) : null);

  function showStatus(kind, html) {
    els.status.className = "status " + kind;
    els.status.innerHTML = html;
    if (kind) els.status.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  const clearStatus = () => { els.status.className = "status"; els.status.textContent = ""; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function nextHalfHour() {
    const d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() < 30 ? 30 : 60);
    return d;
  }

  // ---------- form state ----------
  function setAllDay(on) {
    const s = fromInput(els.start.value) || nextHalfHour();
    const e = fromInput(els.end.value) || new Date(s.getTime() + 3600000);
    els.allDay.checked = on;
    els.start.type = els.end.type = on ? "date" : "datetime-local";
    if (on) {
      els.start.value = toDateInput(s);
      // Show the inclusive last day; Graph wants the exclusive next midnight (handled on save).
      const last = new Date(e);
      if (last.getHours() === 0 && last.getMinutes() === 0 && last > s) last.setDate(last.getDate() - 1);
      els.end.value = toDateInput(last < s ? s : last);
    } else {
      els.start.value = toLocalInput(s);
      els.end.value = toLocalInput(e > s ? e : new Date(s.getTime() + 3600000));
    }
  }

  function applyParsed(p) {
    if (p.title) els.title.value = p.title;
    if (p.location) els.location.value = p.location;
    if (p.start) {
      els.allDay.checked = p.allDay;
      els.start.type = els.end.type = p.allDay ? "date" : "datetime-local";
      if (p.allDay) {
        els.start.value = toDateInput(p.start);
        const last = new Date(p.end);
        last.setDate(last.getDate() - 1);
        els.end.value = toDateInput(last);
      } else {
        els.start.value = toLocalInput(p.start);
        els.end.value = toLocalInput(p.end);
      }
    }
    renderSummary();
  }

  function renderSummary() {
    const s = fromInput(els.start.value), e = fromInput(els.end.value);
    if (!els.title.value || !s) { els.summary.textContent = ""; return; }
    const day = s.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    let when;
    if (els.allDay.checked) {
      const sameDay = !e || toDateInput(e) === toDateInput(s);
      when = sameDay ? `${day}, all day`
        : `${day} – ${e.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}, all day`;
    } else {
      const t = (d) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
      when = `${day}, ${t(s)}${e ? "–" + t(e) : ""}`;
    }
    const where = els.location.value ? ` · ${esc(els.location.value)}` : "";
    els.summary.innerHTML = `<strong>${esc(els.title.value)}</strong> — ${esc(when)}${where}`;
  }

  function onQuickInput() {
    if (!window.chrono || !window.parseQuickAdd) return;
    const text = els.quick.value.trim();
    if (!text) return;
    applyParsed(window.parseQuickAdd(text, window.chrono, new Date()));
  }

  function resetForm() {
    els.form.reset();
    els.quick.value = "";
    setAllDay(false);
    const s = nextHalfHour();
    els.start.value = toLocalInput(s);
    els.end.value = toLocalInput(new Date(s.getTime() + 3600000));
    const savedCal = safeGet(localStorage, CAL_KEY);
    if (savedCal !== null) els.calendar.value = savedCal;
    renderSummary();
    els.quick.focus();
  }

  function snapshot() {
    return {
      quick: els.quick.value, title: els.title.value, allDay: els.allDay.checked,
      start: els.start.value, end: els.end.value, location: els.location.value,
      reminder: els.reminder.value, showAs: els.showAs.value, calendar: els.calendar.value, notes: els.notes.value,
    };
  }

  function restore(d) {
    els.quick.value = d.quick || "";
    els.title.value = d.title || "";
    els.allDay.checked = !!d.allDay;
    els.start.type = els.end.type = d.allDay ? "date" : "datetime-local";
    els.start.value = d.start || "";
    els.end.value = d.end || "";
    els.location.value = d.location || "";
    els.reminder.value = d.reminder || "15";
    els.showAs.value = d.showAs || "busy";
    els.notes.value = d.notes || "";
    if (d.calendar) els.calendar.dataset.pending = d.calendar;
    renderSummary();
  }

  function safeGet(store, key) { try { return store.getItem(key); } catch (_) { return null; } }
  function safeSet(store, key, val) { try { val === null ? store.removeItem(key) : store.setItem(key, val); } catch (_) {} }

  // ---------- auth ----------
  async function getToken() {
    try {
      const r = await pca.acquireTokenSilent({ scopes: SCOPES, account });
      return r.accessToken;
    } catch (err) {
      if (err instanceof msal.InteractionRequiredAuthError || err.errorCode === "monitor_window_timeout" ||
          err.errorCode === "no_tokens_found" || err.errorCode === "login_required") {
        // Keep whatever was typed so it survives the round trip to Microsoft's sign-in page.
        safeSet(sessionStorage, DRAFT_KEY, JSON.stringify({ ...snapshot(), pendingCreate: true }));
        await pca.acquireTokenRedirect({ scopes: SCOPES, account });
        return new Promise(() => {}); // page is navigating away
      }
      throw err;
    }
  }

  async function graph(path, opts = {}) {
    const token = await getToken();
    const res = await fetch(GRAPH + path, {
      ...opts,
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json", ...(opts.headers || {}) },
    });
    const body = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) {
      const e = new Error((body && body.error && body.error.message) || `Request failed (${res.status})`);
      e.status = res.status;
      e.code = body && body.error && body.error.code;
      throw e;
    }
    return body;
  }

  async function loadCalendars() {
    try {
      const data = await graph("/me/calendars?$select=id,name,canEdit,isDefaultCalendar&$top=50");
      const editable = (data.value || []).filter((c) => c.canEdit);
      els.calendar.innerHTML = "";
      for (const c of editable) {
        const o = document.createElement("option");
        o.value = c.isDefaultCalendar ? "" : c.id;
        o.textContent = c.name + (c.isDefaultCalendar ? " (default)" : "");
        els.calendar.appendChild(o);
      }
      if (!editable.some((c) => c.isDefaultCalendar)) {
        els.calendar.insertAdjacentHTML("afterbegin", '<option value="">Default calendar</option>');
      }
      const want = els.calendar.dataset.pending ?? safeGet(localStorage, CAL_KEY);
      if (want !== null && [...els.calendar.options].some((o) => o.value === want)) els.calendar.value = want;
      delete els.calendar.dataset.pending;
    } catch (_) {
      // Not fatal: events still go to the default calendar.
    }
  }

  // ---------- create ----------
  function buildEvent(tz) {
    const allDay = els.allDay.checked;
    let s = fromInput(els.start.value), e = fromInput(els.end.value);
    if (!s) throw new Error("Pick a start time.");
    if (allDay) {
      e = new Date(e || s);
      if (e < s) e = new Date(s);
      e.setDate(e.getDate() + 1); // exclusive end for all-day events
    } else if (!e || e <= s) {
      throw new Error("End time needs to be after the start time.");
    }

    const fmt = (d) => {
      if (tz === "UTC" && !allDay) return d.toISOString().slice(0, 19);
      return `${toDateInput(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
    };
    const reminder = parseInt(els.reminder.value, 10);
    const ev = {
      subject: els.title.value.trim(),
      isAllDay: allDay,
      start: { dateTime: fmt(s), timeZone: tz },
      end: { dateTime: fmt(e), timeZone: tz },
      showAs: els.showAs.value,
      isReminderOn: reminder >= 0,
    };
    if (reminder >= 0) ev.reminderMinutesBeforeStart = reminder;
    if (els.location.value.trim()) ev.location = { displayName: els.location.value.trim() };
    if (els.notes.value.trim()) ev.body = { contentType: "text", content: els.notes.value.trim() };
    return ev;
  }

  async function createEvent() {
    clearStatus();
    if (!els.title.value.trim()) { showStatus("err", "Give the event a title."); els.title.focus(); return; }
    els.createBtn.disabled = true;
    els.createBtn.textContent = "Adding…";
    try {
      const cal = els.calendar.value;
      const path = cal ? `/me/calendars/${encodeURIComponent(cal)}/events` : "/me/events";
      let created;
      try {
        created = await graph(path, { method: "POST", body: JSON.stringify(buildEvent(TZ)) });
      } catch (err) {
        // A few mailbox servers reject some IANA zone names; UTC always works.
        if (err.status === 400 && /time ?zone/i.test(err.message)) {
          created = await graph(path, { method: "POST", body: JSON.stringify(buildEvent("UTC")) });
        } else {
          throw err;
        }
      }
      safeSet(localStorage, CAL_KEY, cal);
      const name = esc(created.subject || els.title.value);
      const link = created.webLink ? ` <a href="${esc(created.webLink)}" target="_blank" rel="noopener">Open in Outlook</a>` : "";
      resetForm();
      showStatus("ok", `✓ Added “${name}” to your calendar.${link}`);
    } catch (err) {
      showStatus("err", "Couldn't add the event: " + esc(err.message || err));
    } finally {
      els.createBtn.disabled = false;
      els.createBtn.textContent = "Add to Outlook";
    }
  }

  // ---------- boot ----------
  function renderWho() {
    if (!account) { els.who.innerHTML = ""; return; }
    els.who.innerHTML = `${esc(account.username)}<br><button type="button" id="signoutBtn">Sign out</button>`;
    $("signoutBtn").onclick = () => pca.logoutRedirect({ account, postLogoutRedirectUri: location.origin + location.pathname });
  }

  async function boot() {
    if (!cfg.clientId) { els.setup.hidden = false; return; }

    const redirectUri = location.origin + location.pathname;
    pca = new msal.PublicClientApplication({
      auth: {
        clientId: cfg.clientId,
        authority: "https://login.microsoftonline.com/" + (cfg.tenant || "organizations"),
        redirectUri,
        postLogoutRedirectUri: redirectUri,
        navigateToLoginRequestUrl: true,
      },
      cache: { cacheLocation: "localStorage" },
    });
    await pca.initialize();

    let redirectResult = null;
    try {
      redirectResult = await pca.handleRedirectPromise();
    } catch (err) {
      showStatus("err", "Sign-in didn't finish: " + esc(err.message || err));
    }
    account = (redirectResult && redirectResult.account) || pca.getAllAccounts()[0] || null;
    if (account) pca.setActiveAccount(account);

    // ?q=... lets a Siri Shortcut or bookmark pre-fill the quick-add box; &go=1 adds it right away.
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    const go = params.get("go") === "1";
    if (q !== null || go) history.replaceState(null, "", location.pathname);

    if (!account) {
      if (q) safeSet(sessionStorage, DRAFT_KEY, JSON.stringify({ quick: q, pendingCreate: go, fromQuery: true }));
      els.signin.hidden = false;
      els.signinBtn.onclick = () => pca.loginRedirect({ scopes: SCOPES });
      return;
    }

    renderWho();
    els.form.hidden = false;
    resetForm();

    const draftRaw = safeGet(sessionStorage, DRAFT_KEY);
    safeSet(sessionStorage, DRAFT_KEY, null);
    let draft = draftRaw ? JSON.parse(draftRaw) : null;
    if (q) draft = { quick: q, pendingCreate: go, fromQuery: true };

    if (draft) {
      if (draft.fromQuery) {
        els.quick.value = draft.quick;
        onQuickInput();
      } else {
        restore(draft);
      }
    }

    await loadCalendars();
    if (draft && draft.pendingCreate && els.title.value.trim()) createEvent();
  }

  els.quick.addEventListener("input", onQuickInput);
  els.allDay.addEventListener("change", () => { setAllDay(els.allDay.checked); renderSummary(); });
  els.start.addEventListener("change", () => {
    // Never let the end land before the start.
    const s = fromInput(els.start.value), e = fromInput(els.end.value);
    if (s && e && e <= s) {
      const ms = els.allDay.checked ? 0 : 3600000;
      const n = new Date(s.getTime() + ms);
      els.end.value = els.allDay.checked ? toDateInput(n) : toLocalInput(n);
    }
    renderSummary();
  });
  ["end", "title", "location"].forEach((k) => els[k].addEventListener("input", renderSummary));
  els.form.addEventListener("submit", (e) => { e.preventDefault(); createEvent(); });
  els.resetBtn.addEventListener("click", () => { clearStatus(); resetForm(); });

  boot().catch((err) => showStatus("err", esc(err.message || err)));
})();

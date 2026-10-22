// Turns a quick-add phrase like
//   "Coffee with Josh tomorrow 3pm for 45 min @ Starbucks"
// into { title, start, end, allDay, location }.
// Works in the browser (window.parseQuickAdd) and in Node (module.exports) for tests.
(function (root) {
  "use strict";

  const DEFAULT_MINUTES = 60;

  function parseDuration(text) {
    // "for 1h", "for 90 min", "for 1.5 hours", "for an hour", "for half an hour", "for 1h30m"
    const re = /\bfor\s+(?:(an?|half an|\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)\b(?:\s*(\d+)\s*(m|min|mins|minutes)\b)?|(\d+)\s*(m|min|mins|minute|minutes)\b)/i;
    const m = text.match(re);
    if (!m) return null;
    let minutes;
    if (m[5]) {
      minutes = parseInt(m[5], 10);
    } else {
      const qty = m[1].toLowerCase();
      const hours = qty === "half an" ? 0.5 : qty === "a" || qty === "an" ? 1 : parseFloat(qty);
      minutes = Math.round(hours * 60) + (m[3] ? parseInt(m[3], 10) : 0);
    }
    return { minutes, text: m[0] };
  }

  function parseLocation(text) {
    // "@ Starbucks" anywhere, or a trailing "at <place>" / "in <place>" that isn't a time.
    let m = text.match(/\s@\s*(.+)$/) || text.match(/^@\s*(.+)$/);
    if (m) return { location: m[1].trim(), text: m[0] };
    m = text.match(/\s(?:at|in)\s+(?!\d|noon\b|midnight\b|the morning\b|the afternoon\b|the evening\b)([^,]+)$/i);
    if (m) return { location: m[1].trim(), text: m[0] };
    return null;
  }

  function cleanTitle(s) {
    return s
      .replace(/\s{2,}/g, " ")
      .replace(/^[\s,;:-]+|[\s,;:-]+$/g, "")
      .replace(/\s+(on|at|from|for|by|this|next)$/i, "")
      .trim();
  }

  function parseQuickAdd(input, chrono, refDate) {
    refDate = refDate || new Date();
    let rest = " " + String(input || "").trim() + " ";
    const result = { title: "", start: null, end: null, allDay: false, location: "" };

    const dur = parseDuration(rest);
    if (dur) rest = rest.replace(dur.text, " ");

    const found = chrono.parse(rest, refDate, { forwardDate: true })[0];
    if (found) {
      rest = rest.slice(0, found.index) + " " + rest.slice(found.index + found.text.length);
      result.start = found.start.date();
      const hasTime = found.start.isCertain("hour") ||
        /\b(noon|midnight|morning|afternoon|evening|tonight)\b/i.test(found.text);
      if (found.end) {
        result.end = found.end.date();
      }
      if (!hasTime) {
        result.allDay = true;
        const s = new Date(result.start);
        s.setHours(0, 0, 0, 0);
        result.start = s;
        const e = new Date(result.end || s);
        e.setHours(0, 0, 0, 0);
        e.setDate(e.getDate() + 1);
        result.end = e;
      } else if (!result.end || result.end <= result.start) {
        result.end = new Date(result.start.getTime() + (dur ? dur.minutes : DEFAULT_MINUTES) * 60000);
      }
    }

    const loc = parseLocation(rest.trimEnd());
    if (loc) {
      result.location = loc.location;
      rest = rest.trimEnd().slice(0, rest.trimEnd().length - loc.text.length);
    }

    result.title = cleanTitle(rest);
    return result;
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { parseQuickAdd };
  else root.parseQuickAdd = parseQuickAdd;
})(this);

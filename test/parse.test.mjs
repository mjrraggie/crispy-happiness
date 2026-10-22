// Run with: node test/parse.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";

const window = {};
vm.runInNewContext(fs.readFileSync(new URL("../vendor/chrono.min.js", import.meta.url), "utf8"), { window });
const { parseQuickAdd } = createRequire(import.meta.url)("../parse.js");
const ref = new Date(2026, 9, 22, 9, 0); // Thu Oct 22 2026, 9:00
const p = (q) => parseQuickAdd(q, window.chrono, ref);
const hm = (d) => [d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];

let r = p("Coffee with Josh tomorrow 3pm for 45 min @ Starbucks");
assert.equal(r.title, "Coffee with Josh");
assert.equal(r.location, "Starbucks");
assert.deepEqual(hm(r.start), [10, 23, 15, 0]);
assert.deepEqual(hm(r.end), [10, 23, 15, 45]);

r = p("Staff meeting Monday 10-11:30am");
assert.equal(r.title, "Staff meeting");
assert.deepEqual(hm(r.start), [10, 26, 10, 0]);
assert.deepEqual(hm(r.end), [10, 26, 11, 30]);

r = p("Camp registration deadline Dec 1");
assert.equal(r.allDay, true);
assert.deepEqual(hm(r.start), [12, 1, 0, 0]);
assert.deepEqual(hm(r.end), [12, 2, 0, 0]);

r = p("Lunch with Sarah friday at noon at Chick-fil-A");
assert.equal(r.title, "Lunch with Sarah");
assert.equal(r.location, "Chick-fil-A");
assert.equal(r.allDay, false);
assert.deepEqual(hm(r.start), [10, 23, 12, 0]);

r = p("Leader training next Tuesday 7pm for 2 hours in the Student Center");
assert.equal(r.title, "Leader training");
assert.equal(r.location, "the Student Center");
assert.deepEqual(hm(r.end), [10, 27, 21, 0]);

r = p("Call mom at 6pm");
assert.equal(r.title, "Call mom");
assert.equal(r.location, "");
assert.deepEqual(hm(r.start), [10, 22, 18, 0]);

console.log("parse tests passed");

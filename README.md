# Quick Event: add Outlook events from your phone

A small web page you open on your phone. Type or dictate something like

> Coffee with Josh tomorrow 3pm for 45 min @ Starbucks

It fills in the title, date, time, length and location. Tap **Add to Outlook** and the event goes straight onto your Microsoft 365 calendar through Microsoft Graph. There's no server, no password stored anywhere and nothing to pay for.

It can also:

- Make all-day events ("Camp registration deadline Dec 1")
- Use a time range ("Staff meeting Monday 10-11:30am")
- Set a reminder and a show-as status
- Pick which calendar the event goes on
- Take a Siri Shortcut (see below)

Once it's live it's at **https://mjrraggie.github.io/crispy-happiness/**.

---

## One-time setup (about 10 minutes, on a computer)

### 1. Register the app with Microsoft

1. Go to <https://entra.microsoft.com> and sign in with your church account.
2. **Identity → Applications → App registrations → New registration**
   - **Name:** `Quick Event`
   - **Supported account types:** *Accounts in this organizational directory only*
   - **Redirect URI:** choose **Single-page application (SPA)** and enter
     `https://mjrraggie.github.io/crispy-happiness/` (keep the trailing slash).
   - Click **Register**.
3. On the app's **Overview** page, copy the **Application (client) ID**.
4. **API permissions → Add a permission → Microsoft Graph → Delegated** and add `Calendars.ReadWrite`. `User.Read` is already there.

> If you get "Need admin approval" when you sign in later, your IT admin has
> turned off self-consent. Ask them to open this app registration and click
> **Grant admin consent** on the API permissions page. The app can only
> touch the calendar of the person who signs in.

### 2. Put the client ID in `config.js`

```js
window.APP_CONFIG = {
  clientId: "PASTE-THE-APPLICATION-CLIENT-ID-HERE",
  tenant: "organizations",
};
```

Commit and push the change. You can edit the file right on github.com.

### 3. Turn on GitHub Pages

In the repo, go to **Settings → Pages → Build and deployment**:

- **Source:** *Deploy from a branch*
- **Branch:** the branch that has these files (for example `claude/outlook-phone-event-creation-73nskj`, or `main` once it's merged), folder `/ (root)`

The site appears at `https://mjrraggie.github.io/crispy-happiness/` after a minute or two.

### 4. On your phone

1. Open the link in Safari (iPhone) or Chrome (Android) and sign in once.
2. **iPhone:** Share → **Add to Home Screen**. **Android:** ⋮ → **Add to Home screen**.

You stay signed in. Every so often Microsoft makes you sign in again, and the page briefly bounces through the Microsoft login. Anything you've typed is kept.

---

## Hands-free with Siri (iPhone)

The page accepts `?q=` to pre-fill the text and `&go=1` to add the event right away.

In the **Shortcuts** app, tap **+**:

1. Add the action **Dictate Text**.
2. Add the action **URL** with this text, inserting the *Dictated Text* variable at the end:
   `https://mjrraggie.github.io/crispy-happiness/?go=1&q=` **Dictated Text**
3. Add the action **Open URLs**.
4. Name the shortcut **Add Outlook event**.

Now you can say *"Hey Siri, add Outlook event"*, then *"Dinner with the Smiths Friday at 6:30 at Olive Garden"*. Safari opens and the event is created. If you'd rather check it before it saves, leave out `go=1&` and you'll just tap **Add to Outlook**.

---

## Option B: no-code with Power Automate

If you can't register an app, a Power Automate flow does a simpler version using only Microsoft tools:

1. Go to <https://make.powerautomate.com> → **Create → Instant cloud flow → Manually trigger a flow**.
2. Add inputs: **Title** (text), **Start** (text, e.g. `2026-11-03 14:00`), **Minutes** (number), **Location** (text).
3. Add the action **Office 365 Outlook → Create event (V4)**:
   - Calendar id: *Calendar*
   - Subject: `Title`
   - Start time: `formatDateTime(triggerBody()['text_1'], 'yyyy-MM-ddTHH:mm:ss')`
   - End time: `formatDateTime(addMinutes(triggerBody()['text_1'], triggerBody()['number']), 'yyyy-MM-ddTHH:mm:ss')`
   - Time zone: *(UTC-05:00) Eastern Time (US & Canada)*
   - Location: `Location`

   The `text_1`/`number` names are the internal names of your inputs. Pick them from the dynamic content list if they're different.
4. Save it, install the **Power Automate** mobile app and run the flow from its **Buttons** tab, or add it as a home-screen widget.

This doesn't understand plain-English dates the way Quick Event does, but it needs no app registration.

---

## How it works

| File | What it does |
| --- | --- |
| `index.html` | The page and its styles |
| `app.js` | Signs you in (MSAL, redirect flow) and creates the event with `POST /me/events` |
| `parse.js` | Turns "tomorrow 3pm for 45 min @ Starbucks" into the event fields |
| `config.js` | Your app's client ID |
| `vendor/` | Bundled copies of `@azure/msal-browser` 3.28.1 and `chrono-node` 2.7.7 (both MIT), so nothing loads from a CDN |

- Your sign-in token stays in your phone's browser storage. The only server the page talks to is Microsoft's.
- Events are sent in your phone's time zone (for example `America/New_York`). If a mailbox rejects that time-zone name, the app retries in UTC.

Run the parser tests with `node test/parse.test.mjs`.

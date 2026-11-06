# Daily brief

Ask any session "run my daily brief" and it follows this file. A scheduled
cloud session can run it every morning and send it to the phone.

## Sweep (read only, never send anything during a brief)

1. **Outlook email**: unread and flagged since the last brief (default: last
   24 hours, last 72 on Mondays). Skip newsletters and automated mail.
2. **Calendar**: today and tomorrow from Outlook, plus Planning Center
   Calendar events and room bookings. Call out conflicts and back-to-backs.
3. **Planning Center**: this week's Services plans (open positions, declines,
   blockouts), new form submissions, People workflow cards assigned to me,
   new registrations for upcoming events.
4. **RingCentral**: team chats and direct messages with new posts that mention
   me or ask me something.
5. **Teams**: chats with unread messages addressed to me.
6. **Texts**: if the `mjrraggie/texting-inbox` repo is reachable, read its
   `inbox` branch; on the Mac, read Messages directly. Threads where someone
   is waiting on me.
7. **OneDrive/SharePoint**: files shared with me or edited by others since
   the last brief.

If a source can't be reached, say so in one line and keep going.

## Output (phone-sized)

- **Top 3** things that need me today, one line each.
- **Replies owed**: who, about what, how long they've waited, and a suggested
  reply. For texts include a tap-to-send `sms:` link; for email say "say
  'draft it' and I'll make the Outlook draft".
- **Today**: schedule in one compact list, conflicts marked.
- **This week in Planning Center**: holes in volunteer schedules, decisions due.
- **FYI**: anything else worth knowing, max 5 lines.
- **Suggestions**: 1 to 3 things I could hand off to Claude right now
  ("want me to draft the reply to …?").

Keep the whole brief under about 40 lines.

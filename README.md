# instagram-unlike

Clean your Instagram likes history using your official exported data.

A resumable Playwright automation tool that removes likes in batches directly from `liked_posts.json`.

---

## Features

- Incremental progress tracking
- Resume after interruption
- Human-like randomized delays
- Uses official Instagram exports
- No private APIs
- No access tokens
- Supports large like histories
- CLI analytics included

---

## Stack

- Node.js
- Playwright
- Chromium

---

## Installation

```bash
git clone https://github.com/aguilarivan/instagram-unlike.git

cd instagram-unlike

npm install
npx playwright install chromium
```

---

## Export your Instagram data

Go to:

https://accountscenter.instagram.com/info_and_permissions/

Then:

```txt
Your information and permissions
→ Download your information
→ Create export
```

Recommended settings:

- Export to device
- Date range → All time
- Customize information → Likes only
- Format → JSON

After downloading the ZIP, extract:

```txt
your_instagram_activity/likes/liked_posts.json
```

into the project root.

---

## Save your session

```bash
npm run session
```

Login once in the browser and press ENTER.

This creates:

```txt
session.json
```

so future runs reuse your authenticated session.

---

## Analytics

```bash
npm run stats
```

Example output:

```txt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIKES BY YEAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2019  ███ 120
2020  ███████ 382
2021  ███████████ 611
2022  ███████████████ 944
```

---

## Run the unlike automation

```bash
npm start -- 100
```

Examples:

```bash
npm start -- 500
npm start -- 2000
```

The number defines how many likes to process during the session.

---

## Progress tracking

The script automatically creates:

```txt
progress.json
```

Processed posts are skipped automatically, allowing safe resume after interruption.

---

## Disclaimer

This project automates browser interactions with Instagram.

Use responsibly and at your own risk.

Instagram may temporarily rate-limit or restrict automated activity.

---

## License

MIT
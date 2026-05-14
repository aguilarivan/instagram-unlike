const fs = require('fs');

const likes = JSON.parse(
  fs.readFileSync('liked_posts.json', 'utf8')
);

const urls = [];
const usernames = [];
const years = [];
const timestamps = [];

for (const item of likes) {

  for (const lv of item.label_values || []) {

    // URL del post
    if (lv.label === 'URL' && lv.href) {
      urls.push(lv.href);
    }

    // Username del autor
    if (Array.isArray(lv.dict)) {
      for (const d of lv.dict) {
        for (const inner of d.dict || []) {
          if (inner.label === 'Username' && inner.value) {
            usernames.push(inner.value);
          }
        }
      }
    }
  }

  // Timestamp
  if (item.timestamp) {
    timestamps.push(item.timestamp);

    const year = new Date(item.timestamp * 1000).getFullYear();
    years.push(year);
  }
}

function count(arr) {
  return arr.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
}

function topEntries(obj, limit = 10) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function bar(n, max, width = 24) {
  const size = Math.round((n / max) * width);
  return '█'.repeat(size);
}

const yearsCount = count(years);
const topYear = Math.max(...Object.values(yearsCount));

const topUsers = topEntries(count(usernames), 10);

const reels = urls.filter(u => u.includes('/reel/')).length;
const posts = urls.filter(u => u.includes('/p/')).length;
const other = urls.length - reels - posts;

const firstLike = new Date(Math.min(...timestamps) * 1000);
const lastLike = new Date(Math.max(...timestamps) * 1000);

const daysSpan = Math.max(
  1,
  (Math.max(...timestamps) - Math.min(...timestamps)) / 86400
);

const avgPerDay = (urls.length / daysSpan).toFixed(2);

console.clear();

console.log(`
╔══════════════════════════════════════════════════════╗
║                  INSTAGRAM ANALYTICS                ║
╚══════════════════════════════════════════════════════╝
`);

console.log(`Total likes        : ${urls.length}`);
console.log(`Tracked accounts   : ${new Set(usernames).size}`);
console.log(`Average likes/day  : ${avgPerDay}`);

console.log(`
First like          : ${firstLike.toISOString().split('T')[0]}
Last like           : ${lastLike.toISOString().split('T')[0]}
`);

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT TYPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

console.log(`Reels  ${bar(reels, urls.length)} ${reels}`);
console.log(`Posts  ${bar(posts, urls.length)} ${posts}`);
console.log(`Other  ${bar(other, urls.length)} ${other}`);

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LIKES BY YEAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

for (const year of Object.keys(yearsCount).sort()) {
  const c = yearsCount[year];

  console.log(
    `${year}  ${bar(c, topYear)} ${c}`
  );
}

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOP 10 MOST LIKED ACCOUNTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

const maxUser = topUsers[0]?.[1] || 1;

for (const [user, c] of topUsers) {
  console.log(
    `@${user.padEnd(20)} ${bar(c, maxUser)} ${c}`
  );
}

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

const reelPct = ((reels / urls.length) * 100).toFixed(1);
const postPct = ((posts / urls.length) * 100).toFixed(1);

console.log(`• ${reelPct}% of your likes were Reels`);
console.log(`• ${postPct}% were regular posts`);
console.log(`• You've liked content from ${new Set(usernames).size} unique accounts`);
console.log(`• Most active year: ${
  Object.entries(yearsCount).sort((a,b)=>b[1]-a[1])[0][0]
}`);

console.log(`
════════════════════════════════════════════════════════
`);
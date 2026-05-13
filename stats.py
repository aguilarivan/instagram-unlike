import json
from datetime import datetime
from collections import Counter

with open('liked_posts.json', 'r', encoding='utf-8') as f:
    likes = json.load(f)

urls = []
usernames = []
years = []

for item in likes:
    for lv in item.get('label_values', []):
        if lv.get('label') == 'URL' and lv.get('href'):
            urls.append(lv['href'])
    
    # Username del autor
    for lv in item.get('label_values', []):
        if isinstance(lv.get('dict'), list):
            for d in lv['dict']:
                for inner in d.get('dict', []):
                    if inner.get('label') == 'Username' and inner.get('value'):
                        usernames.append(inner['value'])
    
    # Año del like
    ts = item.get('timestamp')
    if ts:
        year = datetime.fromtimestamp(ts).year
        years.append(year)

print(f"\n{'='*40}")
print(f"  Total likes: {len(urls)}")
print(f"{'='*40}")

print(f"\nPor año:")
for year, count in sorted(Counter(years).items()):
    print(f"  {year}: {count}")

print(f"\nTop 10 usuarios que más likeaste:")
for user, count in Counter(usernames).most_common(10):
    print(f"  @{user}: {count}")

print(f"\nTipos de contenido:")
reels = sum(1 for u in urls if '/reel/' in u)
posts = sum(1 for u in urls if '/p/' in u)
other = len(urls) - reels - posts
print(f"  Reels: {reels}")
print(f"  Posts: {posts}")
print(f"  Otros: {other}")

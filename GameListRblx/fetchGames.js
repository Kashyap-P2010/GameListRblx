// fetchGames.js
// Scrapes Roblox popular games reliably

const fs = require('fs').promises;
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

// URLs to scrape popular games from Roblox
const ROBLOX_POPULAR_URLS = [
  "https://www.roblox.com/games?SortFilter=default&GenreFilter=1&TimeFilter=0", // popular
  "https://www.roblox.com/games?SortFilter=TopPaid&GenreFilter=1&TimeFilter=0", // top paid
  "https://www.roblox.com/games?SortFilter=TopRated&GenreFilter=1&TimeFilter=0" // top rated
];

async function fetchGamesFromPage(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await res.text();

    const dom = new JSDOM(html);
    const document = dom.window.document;

    const gameElements = Array.from(document.querySelectorAll('a[data-game-id]'));
    const games = gameElements.map(el => ({
      id: el.getAttribute('data-game-id'),
      name: el.querySelector('.game-name')?.textContent.trim() || 'Unknown'
    }));

    return games.filter(g => g.id);
  } catch (err) {
    console.error(`❌ Error fetching ${url}:`, err);
    return [];
  }
}

(async () => {
  let allGames = [];

  for (const url of ROBLOX_POPULAR_URLS) {
    const games = await fetchGamesFromPage(url);
    allGames = allGames.concat(games);
  }

  // Remove duplicates
  const uniqueGames = Array.from(new Map(allGames.map(g => [g.id, g])).values());

  console.log(`✅ Fetched ${uniqueGames.length} unique games.`);

  await fs.writeFile('games.json', JSON.stringify(uniqueGames, null, 2));
  console.log('✅ games.json updated.');
})();

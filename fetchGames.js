// fetchGames.js
// Reliable Roblox game fetcher for GitHub Actions

import fs from 'fs/promises';
import fetch from 'node-fetch';

// Categories to fetch: Popular, Top Paid, Top Rated
const categories = [
  { name: "Popular", url: "https://games.roblox.com/v1/games/list?sortOrder=Asc&genreType=1&limit=30" },
  { name: "TopPaid", url: "https://games.roblox.com/v1/games/list?sortOrder=Asc&genreType=2&limit=30" },
  { name: "TopRated", url: "https://games.roblox.com/v1/games/list?sortOrder=Asc&genreType=3&limit=30" }
];

// Helper: fetch games from one category
async function fetchCategoryGames(category) {
  try {
    const res = await fetch(category.url, {
      headers: { "User-Agent": "RobloxFetcher/1.0" } // required for some responses
    });
    const json = await res.json();
    if (!json?.data || !Array.isArray(json.data) || json.data.length === 0) {
      console.warn(`⚠️  No games returned for category: ${category.name}`);
      return [];
    }

    return json.data.map(g => ({
      id: g?.id || g?.rootPlace?.id || null,
      name: g?.name || g?.rootPlace?.name || 'Unknown'
    })).filter(g => g.id);

  } catch (err) {
    console.error(`❌ Error fetching category ${category.name}:`, err);
    return [];
  }
}

(async () => {
  let allGames = [];

  for (const cat of categories) {
    const games = await fetchCategoryGames(cat);
    allGames = allGames.concat(games);
  }

  // Remove duplicates by ID
  const uniqueGames = Array.from(new Map(allGames.map(g => [g.id, g])).values());

  if (uniqueGames.length === 0) {
    console.error('❌ No games fetched at all! Check Roblox API.');
  } else {
    console.log(`✅ Fetched ${uniqueGames.length} unique games.`);
  }

  await fs.writeFile('games.json', JSON.stringify(uniqueGames, null, 2));
  console.log('✅ games.json updated.');
})();

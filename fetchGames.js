// fetchGames.js
// Fetch top Roblox games and save as games.json

import fs from 'fs/promises';
import fetch from 'node-fetch';

const GAMES_URL = 'https://games.roblox.com/v1/games/list'; // official endpoint

// Fetch a list of popular games
async function fetchPopularGames(limit = 30) {
  try {
    const res = await fetch(GAMES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'RobloxFetcher/1.0' // sometimes helps avoid empty results
      },
      body: JSON.stringify({
        sortToken: 'TopPaid', // options: TopPaid, TopRated, Popular, etc.
        limit
      })
    });

    const data = await res.json();

    if (!data?.data || data.data.length === 0) {
      console.error('❌ No games returned from Roblox API.');
      return [];
    }

    return data.data.map(g => ({
      id: g?.id || g?.rootPlace?.id || null,
      name: g?.name || g?.rootPlace?.name || 'Unknown'
    })).filter(g => g.id);

  } catch (err) {
    console.error('❌ Error fetching games:', err);
    return [];
  }
}

(async () => {
  const games = await fetchPopularGames(30);

  if (games.length === 0) {
    console.log('⚠️  No games fetched, check API or sortToken');
  } else {
    console.log(`✅ Fetched ${games.length} games.`);
  }

  await fs.writeFile('games.json', JSON.stringify(games, null, 2));
  console.log('✅ games.json updated.');
})();

// fetchGames.js
// Fetch popular Roblox games and update games.json

import fs from 'fs/promises';
import fetch from 'node-fetch';

// Replace with a real sort token if needed, or leave null for fallback
const SORTS_URL = 'https://games.roblox.com/v1/games/sorts?model.gameSortsContext=GamesDefaultSorts';
const LIST_URL = 'https://games.roblox.com/v1/games/list';

async function getSortToken(){
  const res = await fetch(SORTS_URL, { headers: { 'Accept': 'application/json' }});
  const json = await res.json();
  // pick first token available
  const token = json?.data?.[0]?.token || Object.values(json)[0];
  if (!token) throw new Error('No sort token found. Inspect JSON: ' + JSON.stringify(json, null, 2));
  return token;
}

async function fetchGames(token, limit = 30){
  const res = await fetch(LIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ sortToken: token, limit })
  });
  const json = await res.json();
  const entries = (json?.data || []);
  return entries.map(g => ({
    name: g?.name || g?.rootPlace?.name || 'Unknown',
    id: g?.id || g?.rootPlace?.id
  })).filter(x => x.id);
}

(async ()=>{
  try {
    console.log('Fetching sort token...');
    const token = await getSortToken();
    console.log('Token:', token);
    console.log('Fetching games list...');
    const games = await fetchGames(token);
    console.log(`Fetched ${games.length} games.`);
    await fs.writeFile('games.json', JSON.stringify(games, null, 2));
    console.log('✅ Updated games.json');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();

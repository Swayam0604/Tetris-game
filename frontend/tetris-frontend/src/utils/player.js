//   utils/player.js
 
export function getPlayerData() {
  const data = JSON.parse(localStorage.getItem("playerData"));
  return data || { level: 1, xp: 0, xpNeeded: 100 };
}

export function savePlayerData(data) {
    localStorage.setItem("playerData", JSON.stringify(data));
}

export function addXp(xp) {
    let player = getPlayerData();
    player.xp += xpEarned;

    while (player.xp >= player.xpNeeded) {
        player.level += 1 ;
        player.xpNeeded = Math.floor(player.xpNeeded * 1.5)   // XP REQUIREMENTS SCALES
    }

    savePlayerData(player);
    return player;
}
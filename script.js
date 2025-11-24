// script.js
// Simple example: fetch MVP data from mvp.json and update the MVP section dynamically.

async function loadMvp() {
  try {
    const response = await fetch('mvp.json');
    if (!response.ok) {
      console.error('Erro ao carregar mvp.json', response.status);
      return;
    }

    const mvps = await response.json();
    if (!Array.isArray(mvps) || mvps.length === 0) return;

    // Assume the FIRST entry is the current MVP (latest month)
    const current = mvps[0];

    // Find elements in the HTML by id
    const mvpTitle = document.getElementById('mvp-title');
    const mvpMeta = document.getElementById('mvp-meta');
    const mvpStats = document.getElementById('mvp-stats');
    const mvpReason = document.getElementById('mvp-reason');

    if (!mvpTitle || !mvpMeta || !mvpStats || !mvpReason) {
      console.warn('Elementos do MVP não encontrados no HTML.');
      return;
    }

    // Update content using data from JSON
    mvpTitle.textContent = `MVP — ${current.label}`;
    mvpMeta.textContent = `${current.player_id.replace('-', ' ')} · ${current.club} · ${current.league}`;

    const s = current.stats;
    mvpStats.textContent =
      `${current.stats_window} — ` +
      `Jogos: ${s.matches} · Golos: ${s.goals} · Assistências: ${s.assists} · Minutos: ${s.minutes}`;

    mvpReason.textContent = current.reason;
  } catch (err) {
    console.error('Erro ao processar MVP:', err);
  }
}

// Run after page load
document.addEventListener('DOMContentLoaded', loadMvp);

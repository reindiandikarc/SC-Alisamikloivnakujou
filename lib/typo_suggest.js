// lib/typo_suggest.js — Command Typo Suggester
// Alya V19 — similarity threshold 50%

'use strict';

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Hitung similarity score 0.0 – 1.0 antara dua string
 */
function similarity(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return (maxLen - levenshtein(a, b)) / maxLen;
}

/**
 * Cari command paling mirip dari registry
 * Hanya tampilkan yang similarity >= threshold (default 0.50 = 50%)
 */
function findSuggestions(typed, registry, opts = {}) {
  const { maxResults = 3, threshold = 0.50, minLen = 2 } = opts;
  if (!typed || typed.length < minLen) return [];

  const low = typed.toLowerCase();
  return Object.keys(registry)
    .map(cmd => ({ cmd, score: similarity(low, cmd.toLowerCase()) }))
    .filter(x => x.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(x => ({ cmd: x.cmd, pct: Math.round(x.score * 100) }));
}

module.exports = { findSuggestions, similarity, levenshtein };

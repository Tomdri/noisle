/**
 * Hands out sounds so none repeats until every sound has been heard,
 * and never twice inside one game.
 */
export function shuffle<T>(arr: T[], rand = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Takes `n` ids from the front of `bag`, refilling it when it runs low.
 * `avoid` (e.g. sounds from this game) is pushed to the back of a refill.
 * Returns the drawn ids and the bag that remains.
 */
export function draw(bag: string[], all: string[], n: number, avoid: string[] = [], rand = Math.random) {
  let pool = bag.filter((id) => all.includes(id) && !avoid.includes(id));
  if (pool.length < n) {
    const rest = all.filter((id) => !pool.includes(id));
    const fresh = rest.filter((id) => !avoid.includes(id));
    const later = rest.filter((id) => avoid.includes(id));
    pool = [...pool, ...shuffle(fresh, rand), ...shuffle(later, rand)];
  }
  return { drawn: pool.slice(0, n), bag: pool.slice(n) };
}

// Table bookkeeping rules that are worth testing on their own: what happens to
// a player who runs out of chips, and who posts the blinds. Pure: reads only
// plain fields off the players, no engine state and no I/O.

// Bullets per player: the starting stack plus this many rebuys.
export const MAX_REBUYS = 3

// Chip rule applied at the start of every hand.
//   keep  — still has chips, nothing to do
//   rebuy — busted but has bullets left: refill to start, counter +1
//   out   — busted with no bullets left (or already out): sits out for good
export function rebuyDecision(player, opts) {
  const max = opts && typeof opts.max === 'number' ? opts.max : MAX_REBUYS
  const start = opts && typeof opts.start === 'number' ? opts.start : 0
  const used = player && typeof player.rebuys === 'number' ? player.rebuys : 0
  if (!player || player.out) return { action: 'out' }
  if (player.stack > 0) return { action: 'keep' }
  if (used < max) return { action: 'rebuy', rebuys: used + 1, stack: start }
  return { action: 'out' }
}

// Host seats are numbered 0..seatCount-1 and play moves to decreasing seat
// index (see cw in host.js). `active` is the list of seats still in the game;
// players who are out are skipped, so the blinds never land on an empty seat.
// Heads-up is the special case: with two players left the button posts the
// small blind and acts first preflop.
export function blindSeats(seatCount, active, dealer) {
  const seated = active.slice().sort(function (a, b) { return a - b })
  if (seated.length < 2) return null
  if (seated.length === 2) {
    const button = seated.indexOf(dealer) !== -1 ? dealer : seated[0]
    return { sb: button, bb: button === seated[0] ? seated[1] : seated[0] }
  }
  const next = function (from) {
    for (let i = 1; i <= seatCount; i++) {
      const s = (from - (i % seatCount) + seatCount) % seatCount
      if (seated.indexOf(s) !== -1) return s
    }
    return null
  }
  const sb = next(dealer)
  return { sb: sb, bb: next(sb) }
}

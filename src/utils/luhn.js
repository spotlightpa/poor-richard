function sum(s) {
  let parity = false;
  let total = 0;
  for (let n = s.length - 1; n >= 0; n--) {
    let d = Number(s[n]);
    if (parity) {
      d *= 2;
      if (d > 9) {
        d -= 9;
      }
    }
    total += d;
    parity = !parity;
  }
  return total;
}

// hasValidLuhn returns true if the input is valid according to the Luhn algorithm.
// It ignores non-digits in string inputs.
export function hasValidLuhn(code) {
  let s = String(code).replace(/\D/g, "");
  return sum(s) % 10 === 0;
}

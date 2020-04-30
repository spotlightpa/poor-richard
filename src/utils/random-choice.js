export default function pseudoRandomChoice(a) {
  if (!a.length) {
    return undefined;
  }
  let i = Math.floor(Math.random() * a.length);
  return a[i];
}

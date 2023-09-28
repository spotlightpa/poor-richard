function millisecondsFrom({ minutes, seconds, milliseconds }) {
  let time = minutes;
  time *= 60;
  time += seconds;
  time *= 1000;
  time += milliseconds;
  return time;
}

export function after({ minutes = 0, seconds = 0, milliseconds = 0 }) {
  return new Promise((resolve) => {
    window.setTimeout(
      resolve,
      millisecondsFrom({ minutes, seconds, milliseconds }),
    );
  });
}

export function debouncer({ minutes = 0, seconds = 0, milliseconds = 0 }, cb) {
  let time = millisecondsFrom({ minutes, seconds, milliseconds });
  let timeoutID = null;
  return (...args) => {
    window.clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => cb(...args), time);
  };
}

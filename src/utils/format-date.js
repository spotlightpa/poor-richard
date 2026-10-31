import { apdate, aptime } from "journalize";

function toDate(d) {
  return typeof d === "string" ? new Date(d) : d;
}

const toWeekday = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
});

export function formatDate(d) {
  if (!d) {
    return "";
  }
  const date = toDate(d);
  return toWeekday.format(date) + ", " + apdate(date);
}

const tzNameLookup = new Intl.DateTimeFormat("en-US", {
  timeZoneName: "short",
});

function getTimeZoneName(d) {
  const { value = "" } =
    tzNameLookup
      .formatToParts(d)
      .find((part) => part.type === "timeZoneName") ?? {};
  return value;
}

export function formatTime(d) {
  const date = toDate(d);
  let tzname = getTimeZoneName(date);
  if (tzname) {
    tzname = " " + tzname;
  }
  return aptime(date) + tzname;
}

const toShortWeekday = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

export function formatDateTime(d) {
  if (!d) {
    return "";
  }
  const date = toDate(d);
  const tz = getTimeZoneName(date);
  const tzSuffix = tz ? " " + tz : "";
  return (
    toShortWeekday.format(date) +
    "., " +
    apdate(date) +
    " " +
    aptime(date) +
    tzSuffix
  );
}

export function relativeDate(date) {
  const minutes = Math.floor((Date.now() - toDate(date)) / 60_000);

  if (minutes < 5) return "Just now";
  if (minutes < 120) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 12) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;

  return formatDateTime(date);
}

import fetchJSON from "./fetch-json.js";

const appID = `5M1ASV9W0A`;
const publicKey = `fd9492397caaffd9cb49be210170e63a`;
const indexName = `spotlightpa-content`;

let baseURL = `https://${appID}-dsn.algolia.net/1/indexes/${indexName}?x-algolia-agent=spotlightpa&x-algolia-application-id=${appID}&x-algolia-api-key=${publicKey}&query=`;

export default function searchAPI(query) {
  if (!query) {
    return Promise.resolve(null);
  }
  return fetchJSON(baseURL + encodeURIComponent(query));
}

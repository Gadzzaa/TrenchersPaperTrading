export const USE_LOCAL = true; // toggle manually here

const CONFIG = {
  API_BASE_URL: USE_LOCAL
    ? "http://localhost:3000"
    : "https://trencherspapertrading.xyz",
};

export default CONFIG;

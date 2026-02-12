const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:4000/api/v1";

const API_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");

export { API_BASE, API_ORIGIN };


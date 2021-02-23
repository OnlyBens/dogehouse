export const __prod__ = process.env.NODE_ENV === "production";

export const apiBaseUrl =
  process.env.REACT_APP_API_BASE_URL ||
  (__prod__ ? "https://api.dogehouse.tv" : "http://localhost:4001");

export const linkRegex = /(https?:\/\/|)[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;

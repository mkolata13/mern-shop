import dotenv from "dotenv";

dotenv.config();

export const config = {
  mongo: {
    url: process.env.MONGO_URL || "",
  },
  server: {
    port: process.env.PORT || "",
  },
  groq: {
    groq_api_key: process.env.GROQ_API_KEY || "",
    groq_url: process.env.GROQ_URL || "",
  },
  jwt: {
    access_token_key: process.env.ACCESS_TOKEN_SECRET || "",
    refresh_token_key: process.env.REFRESH_TOKEN_SECRET || "",

    access_token_expiration: process.env.ACCESS_TOKEN_EXPIRATION_TIME || "",
    refresh_token_expiration: process.env.REFRESH_TOKEN_EXPIRATION_TIME || "",
  },
  frontend: {
    url: process.env.FRONTEND_URL || "",
  },
};

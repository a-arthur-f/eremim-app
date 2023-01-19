import { AxiosRequestConfig } from "axios";
import dotenv from "dotenv";

dotenv.config();

const axiosConfig: AxiosRequestConfig = {
  headers: {
    "Content-Type": "application/json",
    "Accept-Content": "application/json",
    "Accept-Encoding": "identity",
  },

  auth: {
    username: process.env.WP_USERNAME || "",
    password: process.env.WP_PASSWORD || "",
  },
};

export default axiosConfig;

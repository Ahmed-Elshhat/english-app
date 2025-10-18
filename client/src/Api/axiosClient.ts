"use client";

import axios from "axios";
import { BASE_URL } from "./Api";
import Cookie from "cookie-universal";

export function AxiosClient() {
  const cookie = Cookie();
  const token = cookie.get("ARL");

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

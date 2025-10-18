import axios from "axios";
import { cookies } from "next/headers";
import { BASE_URL } from "./Api";

export async function AxiosServer() {
  const token = (await cookies()).get("ARL")?.value;

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

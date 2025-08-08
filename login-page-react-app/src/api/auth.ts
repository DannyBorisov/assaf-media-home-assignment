import { useState } from "react";
import apiClient from "./client";

const useLogin = () => {
  const [isLoading, setLoading] = useState(false);

  async function handleLogin(username: string, honeyPot: string = "") {
    setLoading(true);
    try {
      // should be POST by php api is not a real web server
      const data = await apiClient.get({ username, honeyPot, path: "login" });
      return data;
    } catch (error) {
      console.error("Login failed:", error);
    }
    setLoading(false);
  }

  async function handleOTPVerification(username: string, otp: string) {
    setLoading(true);
    try {
      const data = await apiClient.post(
        { username, otp },
        { path: "verify_otp" }
      );
      if (data.token) {
        return data.token;
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
    setLoading(false);
  }

  return { handleLogin, isLoading, handleOTPVerification };
};

export default useLogin;

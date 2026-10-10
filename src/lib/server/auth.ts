import { URLS } from "@/constants/urls";
import api from "../api";
import {
  UserRegister,
  UserLogin,
  UserLoginResponse,
  UserResponse,
} from "../schema/user"; 

// --- Signin (Register) ---
export const signin = async (data: UserRegister) =>
  (
    await api.post< { data: UserResponse },UserRegister>(URLS.users, data)
  ).data;

// --- Login ---
export const login = async (data: UserLogin) =>
  (await api.post<UserLoginResponse,UserLogin>(URLS.login, data)).data;

// --- Change Password ---
export type ChangePasswordParams = {
  email: string;
  oldpassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  message: string;
  success?: boolean;
};

export const changePassword = async (
  data: ChangePasswordParams,
  token: string
) => {
  const response = await api.put<ChangePasswordResponse,ChangePasswordParams>(
    URLS.updatePassword,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

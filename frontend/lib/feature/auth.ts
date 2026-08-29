import { api } from "../api";
export interface User{
    id: number ; 
    username:string ; 
    email:string ; 
    first_name: string ; 
    last_name: string ; 
}

export interface LoginPayload {
    email: string; 
    password: string; 
}


export interface RegisterPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}


export interface VerifyEmailPayload {
  uid: string;
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}
export interface LoginResponse {
    message: string; 
}

export interface RefreshResponse {
  message: string;
}

export function login(payload: LoginPayload){
    return api<LoginResponse>("/auth/login/", {
        method: "POST", 
        body: JSON.stringify(payload),
    })
}

export function getCurrentUser(){
    return api<User>("/auth/me/"); 
}

export function register(payload: RegisterPayload) {
  return api<RegisterResponse>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export function verifyEmail({
  uid,
  token,
}: VerifyEmailPayload) {
  return api<VerifyEmailResponse>(
    `/auth/verify/${uid}/${token}/`
  );
}

export function refreshToken() {
  return api<RefreshResponse>("/auth/refresh/", {
    method: "POST",
  });
}

export function logout() {
  return api<{ message: string }>("/auth/logout/", {
    method: "POST",
  });
}

import { FirebaseError } from "firebase/app"
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"

import { auth } from "@/lib/firebase/client"

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export async function signInWithEmailPassword(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  displayName: string
) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
  return credential
}

export function getFirebaseAuthErrorMessage(error: unknown, mode: "signin" | "signup" | "google" = "signin") {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return mode === "signup"
          ? "Email hoặc mật khẩu không hợp lệ."
          : "Email hoặc mật khẩu không đúng."
      case "auth/invalid-email":
        return "Email không hợp lệ."
      case "auth/email-already-in-use":
        return "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác."
      case "auth/weak-password":
        return "Mật khẩu quá yếu. Vui lòng dùng ít nhất 6 ký tự."
      case "auth/too-many-requests":
        return "Thao tác thất bại quá nhiều lần. Vui lòng thử lại sau."
      case "auth/network-request-failed":
        return "Không thể kết nối Firebase. Vui lòng kiểm tra mạng và thử lại."
      case "auth/popup-closed-by-user":
        return "Cửa sổ đăng nhập Google đã bị đóng. Vui lòng thử lại."
      case "auth/account-exists-with-different-credential":
        return "Tài khoản này đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng email và mật khẩu."
      case "auth/cancelled-popup-request":
        return "Yêu cầu đăng nhập Google đã bị hủy."
      case "auth/network-request-failed":
        return "Không thể kết nối Firebase. Vui lòng kiểm tra mạng và thử lại."
      default:
        return mode === "google"
          ? "Không thể đăng nhập bằng Google. Vui lòng thử lại."
          : mode === "signup"
          ? "Không thể đăng ký. Vui lòng thử lại."
          : "Không thể đăng nhập. Vui lòng thử lại."
    }
  }

  return mode === "google"
    ? "Không thể đăng nhập bằng Google. Vui lòng thử lại."
    : mode === "signup"
    ? "Không thể đăng ký. Vui lòng thử lại."
    : "Không thể đăng nhập. Vui lòng thử lại."
}

import type { ReactNativeFirebase } from "@react-native-firebase/app"
import type { FirebaseAuthTypes } from "@react-native-firebase/auth"

export type TGuardParams = {
  [key: string]: string[] | TGuardParams
}

/**
 * オブジェクトの型ガード関数
 */
export function objectParamsTypeGuard(obj: unknown, params: TGuardParams) {
  if (typeof obj !== "object" || obj === null) {
    return false
  }
  for (const key in params) {
    const types = params[key]
    const value = obj[key as keyof typeof obj] as unknown
    if (Array.isArray(types)) {
      if (!Object.hasOwn(obj, key)) {
        if (types.includes("null") && value === null) {
          continue
        }
        if (!types.includes(typeof value)) {
          return false
        }
      }
    } else {
      if (!Object.hasOwn(obj, key) || !objectParamsTypeGuard(value, types)) {
        return false
      }
    }
  }
  return true
}

/**
 * Firebaseのネイティブエラーかどうかを判定する
 */
export function isNativeFirebaseError(
  error: unknown
): error is ReactNativeFirebase.NativeFirebaseError {
  const parameters: TGuardParams = {
    code: ["string"],
    message: ["string"],
    nativeErrorCode: ["string", "number", "null"],
    namespace: ["string"],
    nativeErrorMessage: ["string"],
  }
  return objectParamsTypeGuard(error, parameters)
}

/**
 * Firebase Authenticationのネイティブエラーかどうかを判定する
 */
export function isNativeFirebaseAuthError(
  error: unknown
): error is FirebaseAuthTypes.NativeFirebaseAuthError {
  const parameters: TGuardParams = {
    userInfo: {
      authCredential: ["object"],
      resolver: ["object"],
    },
  }
  return (
    isNativeFirebaseError(error) && objectParamsTypeGuard(error, parameters)
  )
}

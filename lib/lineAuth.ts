import {
  type FirebaseAuthTypes,
  getAuth,
  OIDCAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth"
import Line, { LoginPermission } from "@xmartlabs/react-native-line"
import {
  CryptoDigestAlgorithm,
  CryptoEncoding,
  digestStringAsync,
  getRandomBytes,
} from "expo-crypto"

// ランダムなnonceを生成
function generateNonce(length = 32): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const randomBytes = getRandomBytes(length)
  return Array.from(randomBytes)
    .map((byte) => characters[byte % characters.length])
    .join("")
}

async function sha256sum(input: string): Promise<string> {
  return await digestStringAsync(CryptoDigestAlgorithm.SHA256, input, {
    encoding: CryptoEncoding.HEX,
  })
}

export async function lineAuth() {
  try {
    console.log("[lineAuth] Line Login")

    // カスタムnonceを生成
    const customNonce = generateNonce()

    const lineLoginResult = await Line.login({
      scopes: [
        LoginPermission.Email,
        LoginPermission.Profile,
        LoginPermission.OpenId,
      ],
      rawNonce: await sha256sum(customNonce),
    })
    if (!lineLoginResult.accessToken.idToken) {
      throw new Error("[lineAuth] Line login failed: no idToken")
    }

    const credential = (
      OIDCAuthProvider as FirebaseAuthTypes.OIDCProvider
    ).credential(
      "line",
      lineLoginResult.accessToken.idToken,
      lineLoginResult.accessToken.accessToken,
      customNonce
    )

    const result = await signInWithCredential(getAuth(), credential)
    return result
  } catch (error) {
    console.error(error)
  }
}

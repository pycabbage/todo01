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
} from "expo-crypto"

// biome-ignore lint/correctness/noUnusedVariables: will be used later
async function sha256sum(input: string): Promise<string> {
  return await digestStringAsync(CryptoDigestAlgorithm.SHA256, input, {
    encoding: CryptoEncoding.HEX,
  })
}

export async function lineAuth() {
  try {
    console.log("[lineAuth] Line Login")
    const lineLoginResult = await Line.login({
      scopes: [
        LoginPermission.Email,
        LoginPermission.Profile,
        LoginPermission.OpenId,
      ],
    })
    if (!lineLoginResult.accessToken?.idToken) {
      throw new Error("[lineAuth] Line login failed: no idToken")
    }

    const credential = (
      OIDCAuthProvider as FirebaseAuthTypes.OIDCProvider
    ).credential(
      "line",
      lineLoginResult.accessToken.idToken,
      lineLoginResult.accessToken.accessToken,
      lineLoginResult.idTokenNonce
    )

    console.log("[lineAuth] signInWithCredential ...")
    const result = await signInWithCredential(getAuth(), credential)
    console.log("[lineAuth] signInWithCredential result:", result.user.uid)
  } catch (error) {
    console.error(error)
  }
}

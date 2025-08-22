# LINE認証 nonce エラー調査報告書

## 問題の概要

Firebase AuthでLINE OIDC認証を実装する際、以下のエラーが発生：

```
[auth/missing-or-invalid-nonce] The request does not contain a valid nonce. 
This can occur if the SHA-256 hash of the provided raw nonce does not match 
the hashed nonce in the ID token payload.
```

## 調査結果

### 1. エラーの根本原因

#### 期待される動作（OIDC標準仕様）
1. クライアントが生のnonce（例：`"abc123"`）を生成
2. ID TokenにはSHA256ハッシュ化されたnonce（例：`"6ca13d52..."`）が含まれる
3. 検証時、生のnonceをハッシュ化してID Token内のハッシュと比較

#### LINE SDKの実際の動作
1. LINE SDKが生のnonce（例：`"MM7Q4vBXuGAQ7oIk"`）を生成
2. ID Tokenには**生のnonce**（`"MM7Q4vBXuGAQ7oIk"`）がそのまま含まれる
3. Firebase Authは生のnonceをハッシュ化して比較するため**不一致**

### 2. 実装の詳細調査

#### LINE SDK Android実装（@xmartlabs/react-native-line）
```kotlin
// LineLoginModule.kt (line 262)
"idTokenNonce" to loginResult.lineIdToken?.nonce
```
- `LineIdToken`オブジェクトから`nonce`プロパティを直接取得
- 生のnonce値をそのまま返す

#### LINE SDK iOS実装
```swift
// LineLoginModule.swift (line 167)
"idTokenNonce": loginResult.IDTokenNonce
```
- `LoginResult`から`IDTokenNonce`を直接取得
- 生のnonce値をそのまま返す

#### ID Tokenの実際の内容（デコード結果）
```json
{
  "iss": "https://access.line.me",
  "sub": "U000b09cc8fd1faf06b6de0749b1428f1",
  "aud": "2007977071",
  "exp": 1755898796,
  "iat": 1755895196,
  "nonce": "MM7Q4vBXuGAQ7oIk",  // 生のnonceがそのまま格納されている
  "amr": ["lineautologin"],
  "name": "樋口",
  "picture": "https://profile.line-scdn.net/...",
  "email": "dbycvil8yiyf7xnlxvh7@yahoo.co.jp"
}
```

### 3. OpenID Connect仕様の確認

#### OIDC Core 1.0仕様
- nonceの値は認証リクエストからID Tokenへ**変更なしで**渡される
- Authorization Serverはnonce値に対して**他の処理を行うべきではない**

#### LINEの実装
- LINE PlatformはOpenID Connect仕様に準拠
- nonceは生の値のままID Tokenに含まれる（**これは仕様通り**）
- LINEの検証エンドポイント（`https://api.line.me/oauth2/v2.1/verify`）は正しく動作

### 4. Firebase Authの実装

#### 標準的なOIDCプロバイダー向けの実装
```java
// Android
OAuthProvider.newCredentialBuilder(provider)
    .setIdTokenWithRawNonce(authToken, rawNonce)
    .build();
```
- `setIdTokenWithRawNonce`はrawNonceをSHA256でハッシュ化してID Token内の値と比較
- これは多くのOIDCプロバイダーがハッシュ化されたnonceを使用することを前提とした実装

#### 問題のある修正案（セキュリティ上不適切）
```java
// LINEの場合、nonceをnullにする → ❌ セキュリティリスク
if (provider.equals("oidc.line")) {
    return OAuthProvider.newCredentialBuilder(provider)
        .setIdToken(authToken)  // nonceなし
        .build();
}
```

## 解決策の検討

### 1. カスタム認証の実装（推奨）

#### 実装手順
1. サーバーサイドでLINEのID Tokenを検証
2. Firebase Admin SDKでカスタムトークンを生成
3. クライアントでカスタムトークンを使用してFirebaseにサインイン

#### メリット
- セキュリティを維持
- LINEのnonce仕様に完全対応
- Firebase側の変更不要

#### デメリット
- サーバーサイドの実装が必要
- インフラコストの増加

### 2. Firebase SDKへの深いパッチ（難易度高）

#### 実装案
Firebase SDKの内部でLINEプロバイダー専用のnonce検証ロジックを実装：
- LINEの場合：ID Token内の生のnonceと提供されたrawNonceを直接比較
- その他のプロバイダー：標準的なSHA256ハッシュ比較

#### 課題
- Firebase SDKの内部実装への深い理解が必要
- メンテナンスコストが高い
- SDKアップデート時に再パッチが必要

### 3. 一時的な回避策（非推奨）

nonceを使用しない実装は**リプレイ攻撃のリスク**があるため推奨しません。

## 推奨される解決方法

### サーバーサイドでのカスタム認証実装

```javascript
// サーバーサイド（Cloud Functions）
const admin = require('firebase-admin');
const axios = require('axios');

async function verifyLINEToken(idToken, nonce) {
  // LINEの検証エンドポイントを使用
  const response = await axios.post('https://api.line.me/oauth2/v2.1/verify', {
    id_token: idToken,
    client_id: process.env.LINE_CHANNEL_ID,
    nonce: nonce  // 生のnonceを送信
  });
  
  if (response.data.nonce !== nonce) {
    throw new Error('Nonce mismatch');
  }
  
  // カスタムトークンを生成
  const customToken = await admin.auth().createCustomToken(response.data.sub, {
    provider: 'line',
    email: response.data.email,
    name: response.data.name
  });
  
  return customToken;
}
```

```javascript
// クライアントサイド
const lineLoginResult = await Line.login({
  scopes: [LoginPermission.OpenId, LoginPermission.Profile, LoginPermission.Email]
});

// サーバーにID Tokenとnonceを送信
const customToken = await callServerAPI('/auth/line', {
  idToken: lineLoginResult.accessToken.idToken,
  nonce: lineLoginResult.idTokenNonce
});

// カスタムトークンでFirebaseにサインイン
await signInWithCustomToken(getAuth(), customToken);
```

## 結論

1. **問題の原因**：LINEはOIDC仕様通りに生のnonceをID Tokenに含めるが、Firebase AuthのOIDCプロバイダー実装はハッシュ化されたnonceを期待している

2. **LINEの実装は正しい**：OpenID Connect Core仕様に準拠

3. **Firebase Authの制限**：全てのOIDCプロバイダーがハッシュ化されたnonceを使用することを前提としている

4. **推奨解決策**：セキュリティを維持するため、サーバーサイドでのカスタム認証実装を推奨

## 参考資料

- [OpenID Connect Core 1.0 Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [LINE Login v2.1 API Reference](https://developers.line.biz/en/reference/line-login/)
- [Firebase Auth Custom Authentication](https://firebase.google.com/docs/auth/admin/create-custom-tokens)
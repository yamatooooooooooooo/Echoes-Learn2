# GitHub Actions自動デプロイの設定方法

このリポジトリではGitHub Actionsを使用して、Firebaseへの自動デプロイを設定しています。

## 設定されているワークフロー

1. **本番環境デプロイ** (`.github/workflows/firebase-deploy.yml`)
   - `main`ブランチにプッシュされた際に実行
   - アプリケーションをビルドしてFirebase Hostingにデプロイ
   - Firestoreルールもデプロイ

2. **Firebase Functions専用デプロイ** (`.github/workflows/firebase-functions-deploy.yml`)
   - `main`ブランチに関数のコードが変更された際に実行
   - 各関数ディレクトリのコードをデプロイ

3. **ステージング環境デプロイ** (`.github/workflows/firebase-staging-deploy.yml`)
   - `staging`ブランチにプッシュされた際に実行
   - ステージング環境用のFirebaseプロジェクトにデプロイ

## 必要なシークレット設定

GitHub リポジトリの Settings > Secrets and variables > Actions で以下のシークレットを設定する必要があります：

### 本番環境用シークレット

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT` - Firebase Admin SDKのシークレットキー（JSON形式）
- `FIREBASE_TOKEN` - Firebase CLIのトークン

### ステージング環境用シークレット

- `STAGING_FIREBASE_API_KEY`
- `STAGING_FIREBASE_AUTH_DOMAIN`
- `STAGING_FIREBASE_PROJECT_ID`
- `STAGING_FIREBASE_STORAGE_BUCKET`
- `STAGING_FIREBASE_MESSAGING_SENDER_ID`
- `STAGING_FIREBASE_APP_ID`
- `STAGING_FIREBASE_SERVICE_ACCOUNT` - ステージング環境用のFirebase Admin SDKのシークレットキー

## Firebase CLIトークンの取得方法

1. ローカルで以下のコマンドを実行：
   ```bash
   firebase login:ci
   ```

2. ブラウザでログインすると、トークンが表示されます。
3. 表示されたトークンをGitHubシークレットの`FIREBASE_TOKEN`として設定してください。

## Firebase Admin SDKシークレットキーの取得方法

1. Firebaseコンソールの「プロジェクト設定」>「サービスアカウント」タブを開く
2. 「新しい秘密鍵の生成」ボタンをクリックしてJSONファイルをダウンロード
3. ダウンロードしたJSONファイルの内容をGitHubシークレットの`FIREBASE_SERVICE_ACCOUNT`または`STAGING_FIREBASE_SERVICE_ACCOUNT`として設定してください。 
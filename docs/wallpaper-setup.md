# Androidで24節気アニメーション壁紙を設定する方法

このガイドでは、24節気のアニメーションをAndroidスマホの壁紙として設定する方法を説明します。

## 🎯 どの方法を選ぶべき？

| 方法 | アプリ | 難易度 | 推奨度 | 特徴 |
|------|--------|--------|--------|------|
| **方法2-A** | Video Live Wallpaper | ⭐ 超簡単 | ⭐⭐⭐ 最推奨 | 3分で完了、日本語対応 |
| **方法2-B** | Web Live Wallpaper | ⭐ 簡単 | ⭐⭐⭐ 推奨 | 軽量、シンプル |
| **方法1** | KLWP | ⭐⭐ やや複雑 | ⭐⭐ カスタマイズしたい人向け | 高機能、細かい調整可能 |
| **方法3** | ローカルファイル | ⭐⭐⭐ 上級者向け | ⭐ オフライン必須なら | ネット不要、ファイル管理必要 |

**🌟 初めての方は「Video Live Wallpaper」（方法2-A）を強くおすすめします！**

### どのアプリを選ぶか迷ったら

1. **一番簡単に使いたい** → Video Live Wallpaper（緑のアイコン）
2. **軽量なアプリが良い** → Web Live Wallpaper（地球のアイコン）
3. **細かくカスタマイズしたい** → KLWP（青いKのアイコン）

---

## 📱 設定方法

### 方法1: KLWP（Kustom Live Wallpaper）を使用 ⭐推奨

**KLWP**は最も人気のあるライブ壁紙アプリで、ウェブページを壁紙として表示できます。

#### 手順：

1. **KLWPをインストール**
   - Google Play Storeから「KLWP Live Wallpaper Maker」をダウンロード
   - [Google Playリンク](https://play.google.com/store/apps/details?id=org.kustom.wallpaper)

2. **壁紙ファイルにアクセス**
   - ブラウザで以下のURLを開く：
     ```
     https://yusuke0018.github.io/ADHD-task/wallpaper.html
     ```
   - または、GitHub Pagesで公開されているページにアクセス

3. **KLWPでウェブページを設定（詳細手順）**

   **ステップ1: KLWPを起動**
   - KLWPアプリを開く
   - 初回起動時は権限の許可を求められるので「許可」をタップ

   **ステップ2: 新規壁紙を作成**
   - 画面上部の「New blank preset」（新規作成）をタップ
   - または、画面右上の「+」アイコンをタップ

   **ステップ3: レイヤーを追加**
   - 画面上部の「Items」タブをタップ（アイコンは四角が重なったマーク）
   - 画面右上の「+」ボタンをタップ
   - メニューから「Web」→「WebView」を選択

   **ステップ4: URLを設定**
   - WebViewが追加されたら、それをタップして選択
   - 右側のパネルで「URL」の項目を探す
   - URLに以下を入力：
     ```
     https://yusuke0018.github.io/ADHD-task/wallpaper.html
     ```
   - またはローカルファイルの場合：
     ```
     file:///storage/emulated/0/Documents/wallpaper/wallpaper.html
     ```

   **ステップ5: 全画面表示に設定**
   - 同じパネルで「Position」（位置）のセクションを見つける
   - 「X Position」を `0`
   - 「Y Position」を `0`
   - 「Width」（幅）を `$si(width)$` または `100%`
   - 「Height」（高さ）を `$si(height)$` または `100%`
   - これで画面全体に表示されます

   **ステップ6: その他の設定（推奨）**
   - 「Scroll」をOFF（スクロール無効）
   - 「Zoom」を100%
   - 「Hardware Acceleration」をON（滑らかなアニメーション）

4. **壁紙を適用**
   - 画面右上の「💾」（保存アイコン）をタップ
   - 壁紙名を入力（例：「二十四節気」）
   - 保存したら、画面左上の「←」で戻る
   - Android設定から「壁紙」→「ライブ壁紙」→「KLWP」を選択
   - または、KLWPアプリ内の「Set as wallpaper」をタップ

---

### 方法2: 専用アプリを使用 ⭐最も簡単

**最も簡単な方法！** 初心者に強くおすすめです。

以下のいずれかのアプリを使用してください：

#### 📱 推奨アプリ（どれか1つを選択）

**A. Video Live Wallpaper** 🌟一番おすすめ
- 開発者：Naing Group
- 特徴：シンプルで使いやすい、日本語対応、無料
- アイコン：緑色
- **ダウンロード**: [Google Playで開く](https://play.google.com/store/apps/details?id=com.naing.vlivewallpaper)
- または検索：「Video Live Wallpaper」

**B. KLWP Live Wallpaper Maker**
- 開発者：Kustom Industries
- 特徴：高機能、カスタマイズ性が高い
- アイコン：青いK
- **ダウンロード**: [Google Playで開く](https://play.google.com/store/apps/details?id=org.kustom.wallpaper)
- または検索：「KLWP」
- ※こちらは設定が複雑（方法1参照）

**C. Web Live Wallpaper**
- 開発者：Karol Lassak
- 特徴：軽量、シンプル
- アイコン：地球のマーク
- **ダウンロード**: Google Playで「Web Live Wallpaper Karol Lassak」を検索
- または検索：「Web Live Wallpaper」

---

#### 手順（Video Live Wallpaper を使う場合・5分で完了）：

1. **アプリをインストール**
   - Google Play Storeを開く
   - 「Video Live Wallpaper」で検索
   - **Naing Group** 制作のアプリをインストール（緑色のアイコン）

2. **アプリを開く**
   - Video Live Wallpaperアプリを開く
   - 「URL」タブまたは「Webpage」タブを選択

3. **URLを入力**
   - 「Enter URL」または「Website URL」の欄をタップ
   - 以下のURLをコピー&ペーストで入力：
     ```
     https://yusuke0018.github.io/ADHD-task/wallpaper.html
     ```
   - 「OK」または「Load」をタップ

4. **プレビューを確認**
   - 画面にアニメーションが表示されればOK
   - 節気名が表示されているか確認

5. **壁紙を適用**
   - 下部の「Set as Wallpaper」または「Apply」ボタンをタップ
   - 「Home screen」または「Home screen and lock screen」を選択
   - 完了！

**この方法が一番簡単です！** 3分で設定完了します。

---

#### 手順（Web Live Wallpaper を使う場合）：

1. **アプリをインストール**
   - Google Play Storeで「Web Live Wallpaper」を検索
   - **Karol Lassak** 制作のアプリをインストール（地球のアイコン）

2. **URLを設定**
   - アプリを開く
   - 「URL」欄に以下を入力：
     ```
     https://yusuke0018.github.io/ADHD-task/wallpaper.html
     ```

3. **設定を調整**
   - 「Enable JavaScript」→ ON（必須！）
   - 「Refresh」→ OFF
   - 「Touch Events」→ OFF

4. **壁紙を適用**
   - 「Set Wallpaper」をタップ
   - 完了！

---

### 方法3: ローカルファイルを使用（オフライン対応）

インターネット接続なしで使いたい場合：

#### 手順：

1. **ファイルをダウンロード**
   - GitHubリポジトリから `wallpaper.html` とその関連ファイルをダウンロード
   - 必要なファイル：
     - `wallpaper.html`
     - `js/` フォルダ全体
     - `styles/` フォルダ全体

2. **スマホに転送**
   - USBケーブルまたはクラウドストレージ経由でスマホに転送
   - 推奨場所：`内部ストレージ/Documents/wallpaper/`

3. **ライブ壁紙アプリで読み込み**
   - 上記のKLWPまたはWebView Live Wallpaperを使用
   - URLの代わりに、ローカルファイルのパスを指定：
     ```
     file:///storage/emulated/0/Documents/wallpaper/wallpaper.html
     ```

---

## ⚙️ 設定のコツ

### バッテリー消費を抑える

- **フレームレートを下げる**（KLWPの場合）
  - 設定 → Global Settings → FPS を 30 以下に設定

- **スリープ時は停止**
  - 「Pause when screen off」を有効にする

- **アニメーションを簡素化**
  - 端末のバッテリー設定で「省電力モード」を有効にすると、アニメーションが自動的に削減されます

### 表示を最適化

- **全画面表示**
  - ステータスバーやナビゲーションバーを隠す設定を有効にする

- **スケール調整**
  - 節気名のサイズは画面サイズに応じて自動調整されますが、KLWPの場合は拡大率を調整可能

---

## 🎨 壁紙の特徴

- **24節気名**: 現在の節気名が大きく中央に表示
- **開始日**: 節気の開始日が表示
- **季節のアニメーション**: 春夏秋冬それぞれの美しいCanvasアニメーション
- **自動更新**: 日付が変わると自動的に節気が更新

---

## 🔧 トラブルシューティング

### どのアプリを使えばいいかわからない・アプリがたくさんある

**おすすめの選び方**：

**直接ダウンロード**（推奨）：
- 🌟 [Video Live Wallpaper をダウンロード](https://play.google.com/store/apps/details?id=com.naing.vlivewallpaper)（一番おすすめ）
- または [KLWP をダウンロード](https://play.google.com/store/apps/details?id=org.kustom.wallpaper)

**自分で検索する場合**：
1. **Google Play Storeで検索**：
   - 検索ワード：「Video Live Wallpaper」
   - 開発者名：「Naing Group」を確認
   - アイコン：緑色のアイコン
   - ダウンロード数：100万以上

2. **見分け方のポイント**：
   - アプリ名が正確に一致しているか
   - 開発者名を必ず確認
   - レビュー数が多いものを選ぶ
   - アイコンの色で判断

3. **代替案**：
   - 「Web Live Wallpaper」（Karol Lassak、地球のアイコン）
   - 「KLWP」（Kustom Industries、青いKのアイコン）

**迷ったら**：上の直接ダウンロードリンクをタップすれば間違いありません！

### 壁紙が表示されない

- **まずブラウザで確認**：スマホのChromeで `wallpaper.html` のURLを開いて、正しく表示されるか確認
- **権限を確認**：設定→アプリ→該当アプリ→権限→「ストレージ」が許可されているか確認
- **URLを再確認**：URLにスペースや余分な文字が入っていないか確認
- **GitHub Pagesが有効か**：リポジトリの設定でGitHub Pagesが有効になっているか確認

### KLWP で WebView が見つからない

- **Items タブを確認**：画面上部の「Items」タブ（四角が重なったアイコン）をタップ
- **正しいメニュー**：「+」→「Web」→「WebView」の順に選択
- **Proバージョン**：無料版では一部機能が制限される場合があります

### KLWPで「+」ボタンが見つからない

- **画面右上を確認**：編集画面の右上隅に小さな「+」アイコンがあります
- **Items タブ内**：「Items」タブを開いた状態で右上の「+」を押す
- **別の方法**：画面を長押しして「Add Item」を選択

### アニメーションが動かない

- **JavaScriptを有効に**：
  - WebView Live Wallpaper：「Enable JavaScript」を ON
  - KLWP：「Hardware Acceleration」を ON
- **端末の省電力モードを確認**：省電力モードだとアニメーションが制限される
- **端末を再起動**：設定が反映されない場合は再起動

### 画面が白紙または真っ黒

- **URLを確認**：`https://` が付いているか、スペルミスがないか確認
- **インターネット接続**：Wi-Fiまたはモバイルデータがオンになっているか
- **ローカルファイルの場合**：ファイルパスが正しいか、全てのファイル（js/、styles/）が揃っているか確認

### バッテリー消費が激しい

- **FPSを下げる**（KLWPの場合）：設定→Global Settings→FPS を 30 以下に設定
- **画面オフ時は停止**：該当アプリの設定で「Pause when screen off」を有効
- **より軽量なアプリに変更**：KLWPからWebView Live Wallpaperに変更してみる

---

## 📝 注意事項

- ライブ壁紙は通常の静止画壁紙よりもバッテリーを消費します
- 古い端末では動作が重くなる可能性があります
- GitHubアカウントの設定によっては、GitHub Pagesが有効になっていない場合があります（その場合はローカルファイルを使用してください）

---

## 🔗 参考リンク

- [KLWP公式サイト](https://www.kustom.rocks/)
- [GitHub リポジトリ](https://github.com/Yusuke0018/ADHD-task)

---

## ❓ よくある質問

**Q: どのアプリを選べばいいですか？たくさんあって分かりません**
A: **Video Live Wallpaper（Naing Group、緑のアイコン）**が一番簡単でおすすめです。
直接ダウンロード：[こちらをタップ](https://play.google.com/store/apps/details?id=com.naing.vlivewallpaper)

**Q: Video Live Wallpaperが見つかりません**
A: 以下の代替案を試してください：
- [KLWP](https://play.google.com/store/apps/details?id=org.kustom.wallpaper)（Kustom Industries、青いKのアイコン）
- 「Web Live Wallpaper」（Karol Lassak、地球のアイコン）をGoogle Playで検索
設定方法は本ガイドに記載されています。

**Q: 無料で使えますか？**
A: はい、紹介しているアプリはすべて無料で使えます（KLWPは無料版で十分です）。

**Q: GitHub Pagesで公開されていない場合は？**
A: ローカルファイル方式（方法3）を使用してください。ファイルをスマホに保存してローカルパスを指定します。

**Q: 他の壁紙アプリでも使えますか？**
A: はい、WebViewをサポートしているライブ壁紙アプリであれば使用可能です。

**Q: iPhoneでも使えますか？**
A: 残念ながら、iOSではライブ壁紙の制限が厳しく、この方法は使えません。Safariでウェブアプリとして開く形になります。

---

楽しい壁紙ライフを！🎋

# 二十四節気ビューア

二十四節気（日本の季節）を感じる、シンプルで美しいPWA。季節ごとの流麗な背景アニメーションと、現在の節気情報・年間一覧・日の出/日の入りを表示します。

## 特徴

- 背景アニメ: Canvasベース（パララックス・風のゆらぎ・発光表現）
- 現在の節気と開始日、次の節気までの日数表示
- 年間の二十四節気一覧（クリックで詳細表示）
- 日の出/日の入り（Open-Meteo API）
- 大阪市天王寺区の当日天気（Open-Meteo API）
- PWA対応（オフライン可）
- シンプルで見やすいデザイン
（壁紙機能は廃止しました）

## 技術スタック

- Pure JavaScript（フレームワークなし）
- Tailwind CSS（CDN）
- Canvasアニメーション（`requestAnimationFrame`）
- Service Worker キャッシュ

## 使い方

### ウェブアプリとして使う（ローカル）

1. 起動
   - `cd ADHD-task`
   - `python3 -m http.server 8000`
2. ブラウザでアクセス
   - `http://localhost:8000`
3. 反映されない場合（PWAキャッシュ）
   - Shift+再読み込み または Service Worker の更新/登録解除

### Android壁紙としての利用（廃止）
壁紙用の `wallpaper.html` および関連ドキュメントは削除しました。

## 構成

```
ADHD-task/
├── index.html                         # メインアプリ
├── js/
│   ├── app-simple.js                  # アプリ本体
│   ├── sunTimeAPI.js                  # 日の出/入り取得
│   ├── animations/seasonal-animations.js  # 背景アニメ（Canvas）
│   └── data/sekki-data.js            # 二十四節気データ
├── styles/
│   ├── base.css
│   ├── sekki-backgrounds.css
│   ├── animations.css
│   └── components.css
├── docs/
├── manifest.json
└── service-worker.js
```

## 備考

- 二十四節気の表示に特化したシンプルな構成です。
- 季節の移ろいを感じながら日々を過ごすことができます。

## ライセンス

このプロジェクトはプライベートプロジェクトです。

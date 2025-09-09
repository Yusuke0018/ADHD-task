# 二十四節気ビューア（シンプル版）

二十四節気（日本の季節）を感じる、軽量シンプルなPWA。季節ごとの流麗な背景アニメーションと、現在の節気情報・年間一覧・日の出/日の入りを表示します。

## 特徴

- 背景アニメ: Canvasベース（パララックス・風のゆらぎ・発光表現）
- 現在の節気と開始日、次の節気までの日数表示
- 年間の二十四節気一覧（クリックで詳細表示）
- 日の出/日の入り（Open-Meteo API）
- PWA対応（オフライン可）

## 技術スタック

- Pure JavaScript（フレームワークなし）
- Tailwind CSS（CDN）
- Canvasアニメーション（`requestAnimationFrame`）
- Service Worker キャッシュ

## フィットネス拡張（実装済）

- `fitness.html` からアクセスできます。ラン/ウォーク/サイクルの距離・分を手入力し、XPとレベル、称号（総合/種目別距離/総時間/累計日数）を解放します。総合は「加重総距離（2.5×ラン + 1.25×ウォーク + 1.0×サイクル）」で判定します。詳細仕様は `docs/fitness-spec.md` を参照ください。

## 使い方（ローカル）

1. 起動
   - `cd ADHD-task`
   - `python3 -m http.server 8000`
2. ブラウザでアクセス
   - `http://localhost:8000`
3. 反映されない場合（PWAキャッシュ）
   - Shift+再読み込み または Service Worker の更新/登録解除

## 構成

```
ADHD-task/
├── index.html
├── js/
│   ├── app-simple.js                  # シンプル表示のアプリ本体
│   ├── sunTimeAPI.js                  # 日の出/入り取得
│   ├── animations/seasonal-animations.js  # 背景アニメ（Canvas）
│   └── data/sekki-data.js            # 二十四節気データ
├── styles/
│   ├── base.css
│   ├── sekki-backgrounds.css
│   ├── animations.css
│   └── components.css
├── manifest.json
└── service-worker.js
```

## 備考

- 以前のタスク管理やカレンダーなどの機能は削除し、表示に特化した最小構成へ整理しました。
- 変更に伴い Service Worker のキャッシュ名は `sekki-task-v4` に更新済みです。

## ライセンス

このプロジェクトはプライベートプロジェクトです。

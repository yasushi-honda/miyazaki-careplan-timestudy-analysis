# 宮崎ケアプランタイムスタディ分析

ケアプランデータ連携システム導入前後のタイムスタディ分析結果を可視化するウェブアプリケーションです。

## 概要

このプロジェクトは、ケアプランデータ連携システムを導入することによる業務効率化の効果を分析・可視化することを目的としています。個人別と事業所別のタイムスタディデータを基に、導入前後の変化を明確に示します。

## 特徴

- 個人別・事業所別の分析
- 導入前後の比較
- インタラクティブなデータ可視化
- レスポンシブデザイン

## 技術スタック

- HTML/CSS/JavaScript
- Bootstrap 5
- Chart.js
- PapaParse (CSV解析)

## データセット

- `data/business_before.csv`: 事業所別・導入前データ
- `data/business_after.csv`: 事業所別・導入後データ
- `data/individual_before.csv`: 個人別・導入前データ
- `data/individual_after.csv`: 個人別・導入後データ

## デプロイ

このプロジェクトはNetlifyにデプロイされています。
URL: https://jocular-sable-27577c.netlify.app

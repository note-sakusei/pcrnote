## このツールについて

「pcrnote」というプリンセスコネクト！Re:Dive(プリコネR)用のツールです。

アリーナやクランバトルの編成を記録することができます。

データファイルにデータベースではなくJSON(CSV)ファイルを使用しています。

## 使い方

### ローカルモード

HTML、JavaScript、jQueryのみで作ってあるため、HTMLファイルをブラウザで開くだけで使用可能です。

データファイルはローカルファイルを選択することで読み込み、更新したデータをダウンロードすることで保存できます。

### クライアントサーバーモード

Node.jsでサーバープログラム(pcrsvr.js)を実行し、ブラウザからサイトにアクセスすることで使用可能です。

データファイルはサーバー側に置かれるため、アップロード、ダウンロードする必要はありません。

サーバー側の環境設定にpcrsvr.settingsを使用していますので環境に応じて変更して下さい。

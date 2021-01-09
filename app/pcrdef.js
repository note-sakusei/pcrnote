// 定数

'use strict';

var exports = exports || undefined;

var pcrdef = exports || pcrdef || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 定数(変更可)
// ユーザー名の最小長、最大長
pcrdef.USER_NAME_LENGTH = {MIN: 0, MAX: 32};
// データベース名の最小長、最大長
pcrdef.DB_NAME_LENGTH = {MIN: 2, MAX: 32};
// ハッシュタグの最小長、最大長
pcrdef.HASHTAG_LENGTH = {MIN: 2, MAX: 16};
// 評価の最小値、最大値
pcrdef.RATING_VALUE = {MIN: 0, MAX: 99};
// 日時の書式(内部データ、ファイルデータ用)
pcrdef.DATE_FORMAT_FOR_DATA = 'yyyy-MM-dd hh:mm:ss';
// 日時の書式(表示データ用)
pcrdef.DATE_FORMAT_FOR_DISPLAY = pcrdef.DATE_FORMAT_FOR_DATA;
// 日時の書式(ロギング用)
pcrdef.DATE_FORMAT_FOR_LOGGING = pcrdef.DATE_FORMAT_FOR_DATA;
// 日時の書式(日時比較用)
pcrdef.DATE_FORMAT_FOR_DIFF = 'yyyyMMddhhmmssSSS';
// 日時の書式(常駐領域の現在時刻、計測開始時刻、経過時間用)
pcrdef.DATE_FORMAT_FOR_RESIDENT_CURRENT_TIME = 'EEE, dd MMM yyyy hh:mm:ss';
pcrdef.DATE_FORMAT_FOR_RESIDENT_PICKED_TIME = pcrdef.DATE_FORMAT_FOR_DATA;
pcrdef.DATE_FORMAT_FOR_RESIDENT_ELAPSED_TIME = 'hh:mm:ss';
// 日時の書式(ファイル名用)
// 区切り文字はハイフン、なし以外に変更不可
pcrdef.DATE_FORMAT_FOR_FILE_NAME = 'yyyy-MM-dd-hh-mm-ss';
// 現在時刻の更新頻度(ミリ秒)
pcrdef.REFRESH_CURRENT_TIME_FREQUENCY = 100;
// クッキーの定義
pcrdef.COOKIE_OPTIONS = {
  expires: 10, // 10日間
  secure: false, // falseにしておかないとSSL/TLS未使用時にクッキーに格納出来ない
  sameSite: 'Strict' // secureがfalseの場合、Lax or Strictにする必要有
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 定数(変更不可)
// 攻撃側、防衛側編成のユニット数の上限
pcrdef.PARTY_UNITS_MAX = 5;
// BOM(バイトオーダーマーク)
pcrdef.BOM = new Uint8Array([0xef, 0xbb, 0xbf]);
// データ型
pcrdef.DataType = {
  OBJECT: '[object]',
  ARRAY: '[array]',
  STRING: '[string]',
  NUMBER: '[number]',
  INTEGER: '[integer]',
  BOOLEAN: '[boolean]',
  NULL: '[null]'
};
// ファイル形式
pcrdef.FileType = {
  JSON: '[json]',
  CSV: '[csv]',
  TEMP: '[temp]'
};
// データベースへの処理種別
pcrdef.QueryType = {
  INSERT: 'I',
  UPDATE: 'U',
  DELETE: 'D'
};
// ソート順序
pcrdef.OrderBy = {
  ASC: '[asc]',
  DESC: '[desc]'
};
// 表示制御
pcrdef.ViewController = {
  UNDEFINED: 0,
  PAGE_CONFIG: 10, // ユーザー設定画面
  PAGE_CONTENT: 11, // コンテンツ画面
  NEW_TAB_OFFENSE_ON: 20, // 新規登録部:表示 攻撃側の設定中
  NEW_TAB_DEFENSE_ON: 21, // 新規登録部:表示 防衛側の設定中
  NEW_TAB_OFFENSE_OFF: 22, // 新規登録部:非表示 攻撃側の設定中
  NEW_TAB_DEFENSE_OFF: 23, // 新規登録部:非表示 防衛側の設定中
  SEARCH_TAB_OFFENSE_ON: 30, // ユニット検索部:表示 攻撃側の設定中
  SEARCH_TAB_DEFENSE_ON: 31, // ユニット検索部:表示 防衛側の設定中
  SEARCH_TAB_OFFENSE_OFF: 32, // ユニット検索部:非表示 攻撃側の設定中
  SEARCH_TAB_DEFENSE_OFF: 33, // ユニット検索部:非表示 防衛側の設定中
  USED_FOR_ARENA: 40, // 用途:アリーナ
  USED_FOR_CLANBATTLE: 41, // 用途:クランバトル
  VIEW_STYLE_MINIMUM: 50, // 表示方法:最小表示
  VIEW_STYLE_SIMPLE: 51, // 表示方法:簡易表示
  VIEW_STYLE_NORMAL: 52 // 表示方法:通常表示
};
// 対戦情報テーブルのデータの取得状態
pcrdef.VsSetTableImportState = {
  SYNC: 10, // 未取得、取得済
  ASYNC: 11, // 取得後変更
  WHILE_SYNC: 12 // 取得中
};
// コンテンツ画面更新部位
pcrdef.ContentViewRefreshFlags = {
  REFRESH_NONE: 0, // 何も更新しない
  REFRESH_MENU: 1, // メニュー部の画面更新
  REFRESH_INPUT: 2, // 入力部の画面更新
  REFRESH_RESULT: 4 // 検索結果部の画面更新
};
// サーバーURL(読み込み用)
pcrdef.SERVER_URL_READ_CGI = '/cgi-bin/pcrsvr/read.js';
// サーバーURL(書き込み用)
pcrdef.SERVER_URL_WRITE_CGI = '/cgi-bin/pcrsvr/write.js';

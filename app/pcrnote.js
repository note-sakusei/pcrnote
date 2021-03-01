// クライアント側ユーザー設定部、コンテンツ部共用
// メイン処理

'use strict';

var pcrnote = pcrnote || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// グローバル変数

// 表示制御
pcrnote.gViewController = new pcrctrl.ViewController();
// コンテンツ画面更新監視
pcrnote.gContentViewRefreshObserver = new pcrctrl.ContentViewRefreshObserver();
// ユーザー設定データ
pcrnote.gConfigData = new pcrconfig.ConfigData();
// ユニット情報テーブル
pcrnote.gUnitInfoTable = new pcrdb.UnitInfoTable();
// 対戦情報テーブル
pcrnote.gVsSetTable = new pcrdb.VsSetTable(pcrnote.gUnitInfoTable);
// 新規対戦情報
pcrnote.gNewVsSet = undefined;
// ユニット検索情報
pcrnote.gSearchVsSet = undefined;

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 初期化(HTML読み込み時の1度きりの処理)
pcrnote.init = function() {
  pcrutil.init();
  pcrconfig.init();
  pcract.init();
  pcrview.init();
  pcrevent.init();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

if (window.File && window.FileReader && window.FileList && window.Blob) {
  // 処理開始
  document.addEventListener("DOMContentLoaded", function(){
    pcrnote.init();
    pcrconfig.refreshConfigView();
  });
} else {
  alert(pcrmsg.getN('pcrnote.global', 0));
};

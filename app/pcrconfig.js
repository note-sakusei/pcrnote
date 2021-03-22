// クライアント側ユーザー設定部
// 全般処理

'use strict';

var pcrconfig = pcrconfig || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// ユーザー設定データクラス
pcrconfig.ConfigData = function(opt_rhs) {
  // コンストラクタ
  if (opt_rhs === undefined) {
    this.items = {
      // ユーザー名
      userName: '',
      // ユーザー名を保持するか
      keepUserName: false,
      // ユーザー名を非表示にするか
      hideUserName: false,
      // データベース名
      dbName: '',
      // データベース名を保持するか
      keepDBName: false,
      // データベース名を非表示にするか
      hideDBName: false,
      // 検索開始ユニット数
      searchStartUnitsMin: 1,
      // 検索用編成スロット数
      numOfSearchPartySlots: 6,
      // 検索結果上限数
      searchResultLimit: 50,
      // 現在時刻を表示
      displayCurrentTime: false,
      // ユニット一覧を分類
      tieredUnitCatalog: false,
      // サーバーモード
      clientServerMode: false,
      // クッキーに保存
      saveCookie: false
    }
  // コピーコンストラクタ
  } else if (opt_rhs instanceof pcrconfig.ConfigData) {
    this.items = pcrutil.deepCopy(opt_rhs.items);
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt_rhs');
  }
  Object.seal(this);
  Object.seal(this.items);
};
pcrconfig.ConfigData.prototype = {
  get userName() { return this.items.userName; },
  get keepUserName() { return this.items.keepUserName; },
  get hideUserName() { return this.items.hideUserName; },
  get dbName() { return this.items.dbName; },
  get keepDBName() { return this.items.keepDBName; },
  get hideDBName() { return this.items.hideDBName; },
  get searchStartUnitsMin() { return this.items.searchStartUnitsMin; },
  get numOfSearchPartySlots() { return this.items.numOfSearchPartySlots; },
  get searchResultLimit() { return this.items.searchResultLimit; },
  get displayCurrentTime() { return this.items.displayCurrentTime; },
  get tierUnitCatalog() { return this.items.tierUnitCatalog; },
  get clientServerMode() { return this.items.clientServerMode; },
  get saveCookie() { return this.items.saveCookie; }
};
Object.seal(pcrconfig.ConfigData.prototype);

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 初期化
pcrconfig.init = function() {
  pcrnote.gConfigData = pcrconfig.restoreConfigDataFromCookie();
  pcrconfig.configDataToConfigView(pcrnote.gConfigData);
  pcrconfig.switchDisplayOfUserNameInputField();
  pcrconfig.switchDisplayOfDBNameInputField();
  pcrconfig.addEventListener();
};

// ユーザー設定を画面表示から内部データへ
pcrconfig.configViewToConfigData = function(configData) {
  configData.items = {
    userName: $_('#userName').value.trim(),
    keepUserName: $_('#keepUserName').checked,
    hideUserName: $_('#hideUserName').checked,
    dbName: $_('#dbName').value.trim(),
    keepDBName: $_('#keepDBName').checked,
    hideDBName: $_('#hideDBName').checked,
    searchStartUnitsMin: pcrutil.getSelectBoxState($_('#searchStartUnitsMin')).value,
    numOfSearchPartySlots: pcrutil.getSelectBoxState($_('#numOfSearchPartySlots')).value,
    searchResultLimit: pcrutil.getSelectBoxState($_('#searchResultLimit')).value,
    displayCurrentTime: $_('#displayCurrentTime').checked,
    tierUnitCatalog: $_('#tierUnitCatalog').checked,
    clientServerMode: $_('#clientServerMode').checked,
    saveCookie: $_('#saveCookie').checked
  };
}
// ユーザー設定を内部データから画面表示へ
pcrconfig.configDataToConfigView = function(configData) {
  $_('#userName').value = configData.userName;
  $_('#keepUserName').checked = configData.keepUserName;
  $_('#hideUserName').checked = configData.hideUserName;
  $_('#dbName').value = configData.dbName;
  $_('#keepDBName').checked = configData.keepDBName;
  $_('#hideDBName').checked = configData.hideDBName;
  $_('#searchStartUnitsMin').value = configData.searchStartUnitsMin;
  $_('#numOfSearchPartySlots').value = configData.numOfSearchPartySlots;
  $_('#searchResultLimit').value = configData.searchResultLimit;
  $_('#displayCurrentTime').checked = configData.displayCurrentTime;
  $_('#tierUnitCatalog').checked = configData.tierUnitCatalog;
  $_('#clientServerMode').checked = configData.clientServerMode;
  $_('#saveCookie').checked = configData.saveCookie;
};

// ユーザー設定のうち保持しない項目を消去
pcrconfig.eraseVolatileConfigItems = function(orgConfigData) {
  const configData = new pcrconfig.ConfigData(orgConfigData);
  if (!configData.keepUserName) {
    configData.items.userName = '';
  }
  if (!configData.keepDBName) {
    configData.items.dbName = '';
  }
  return configData;
};

// クッキーにユーザー設定データを保存
pcrconfig.saveConfigDataToCookie = function(orgConfigData) {
  if (orgConfigData.saveCookie) {
    const configData = pcrconfig.eraseVolatileConfigItems(orgConfigData);
    pcrutil.setCookie(
      'config', JSON.stringify(configData.items), pcrdef.COOKIE_OPTIONS
    );
  } else {
    pcrconfig.removeConfigDataFromCookie();
  }
};
// クッキーからユーザー設定データを復元
pcrconfig.restoreConfigDataFromCookie = function() {
  const configData = new pcrconfig.ConfigData();
  try {
    const cookieData = pcrutil.getCookie('config');
    if (cookieData !== undefined) {
      configData.items = JSON.parse(cookieData);
    }
  } catch (e) {
    pcrconfig.removeConfigDataFromCookie();
  }
  return configData;
};
// クッキーからユーザー設定データを削除
pcrconfig.removeConfigDataFromCookie = function() {
  pcrutil.removeCookie('config', pcrdef.COOKIE_OPTIONS);
};

// ユーザー設定画面のユーザー名入力フィールド内容の表示非表示を切り替え
pcrconfig.switchDisplayOfUserNameInputField = function() {
  const $userName = $_('#userName');
  const $hideUserName = $_('#hideUserName');
  if (!$hideUserName.checked) {
    $userName.setAttribute('type', 'text');
  } else {
    $userName.setAttribute('type', 'password');
  }
};
// ユーザー設定画面のデータベース名入力フィールド内容の表示非表示を切り替え
pcrconfig.switchDisplayOfDBNameInputField = function() {
  const $dbName = $_('#dbName');
  const $hideDBName = $_('#hideDBName');
  if (!$hideDBName.checked) {
    $dbName.setAttribute('type', 'text');
  } else {
    $dbName.setAttribute('type', 'password');
  }
};

// ユーザー設定画面の更新
pcrconfig.refreshConfigView = function() {
  // ユーザー設定画面の表示
  if (pcrnote.gViewController.isPageConfig()) {
    pcrview.showPage();
  } else {
    throw pcrutil.makeError(pcrmsg.get('fatalError'));
  }
  // ユーザー設定を画面表示へ反映
  pcrconfig.configDataToConfigView(pcrnote.gConfigData);
  // キーボードで扱いやすいようフォーカスを設定
  $_('#dummyConfigItem1').focus();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

pcrconfig.goToContent = {};
pcrconfig.hideUserName = {};
pcrconfig.hideDBName = {};
pcrconfig.displayCurrentTime = {};

// コンテンツページへ遷移
pcrconfig.goToContent.onClick = function() {
  pcrnote.gViewController.switchPageContent();
  // ユーザー設定画面での入力値を取得
  pcrconfig.configViewToConfigData(pcrnote.gConfigData);
  // 入力値を元にした初期化、調整
  pcrnote.gVsSetTable.transaction.bindAuthority(
    pcrnote.gConfigData.userName, pcrnote.gConfigData.dbName
  );
  pcract.adjustSearchVsSet(pcrnote.gConfigData.numOfSearchPartySlots);
  // 入力値をクッキーに保存、もしくは削除
  if (pcrnote.gConfigData.saveCookie) {
    pcrconfig.saveConfigDataToCookie(pcrnote.gConfigData);
  } else {
    pcrconfig.removeConfigDataFromCookie();
    // クッキーに保存しない場合、現在の入力状態もクッキーから削除
    pcract.deleteInputStateFromCookie();
  }
  pcract.filterVsSetTable();
  pcrview.refreshContentView();
};
// ユーザー設定ページでエンターが押された場合、コンテンツページへ遷移
pcrconfig.goToContent.onKeydown = function(event) {
  if (!pcrnote.gViewController.isPageConfig()) return;
  const ASCII_CODE_CR = 13;
  if (event.keyCode !== ASCII_CODE_CR) return;
  pcrconfig.goToContent.onClick();
};

// ユーザー名を表示するか切り替え
pcrconfig.hideUserName.onClick = function() {
  pcrconfig.switchDisplayOfUserNameInputField();
};
// データベース名を表示するか切り替え
pcrconfig.hideDBName.onClick = function() {
  pcrconfig.switchDisplayOfDBNameInputField();
};

// 現在時刻を表示するか切り替え
pcrconfig.displayCurrentTime.onClick = function() {
  pcrview.showResident();
};

// イベントリスナー登録
pcrconfig.addEventListener = function() {
  $on($_('#goToContent'), 'click', pcrconfig.goToContent.onClick);
  $on(window, 'keydown', pcrconfig.goToContent.onKeydown);
  $on($_('#hideUserName'), 'click', pcrconfig.hideUserName.onClick);
  $on($_('#hideDBName'), 'click', pcrconfig.hideDBName.onClick);
  $on($_('#displayCurrentTime'), 'click', pcrconfig.displayCurrentTime.onClick);
};

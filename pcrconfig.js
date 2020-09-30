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
      // クライアントサーバーモード
      clientServerMode: false,
      // クッキーに保存
      saveCookie: false
    }
  // コピーコンストラクタ
  } else if (opt_rhs instanceof pcrconfig.ConfigData) {
    this.items = pcrutil.deepCopy(opt_rhs.items);
  } else {
    throw pcrutil.makeError(pcrmsg.build('illegalArgument', 'opt_rhs'));
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
    userName: $('#userName').val().trim(),
    keepUserName: $('#keepUserName').prop('checked'),
    hideUserName: $('#hideUserName').prop('checked'),
    dbName: $('#dbName').val().trim(),
    keepDBName: $('#keepDBName').prop('checked'),
    hideDBName: $('#hideDBName').prop('checked'),
    searchStartUnitsMin: $('#searchStartUnitsMin').find(':selected').val(),
    numOfSearchPartySlots: $('#numOfSearchPartySlots').find(':selected').val(),
    searchResultLimit: $('#searchResultLimit').find(':selected').val(),
    clientServerMode: $('#clientServerMode').prop('checked'),
    saveCookie: $('#saveCookie').prop('checked')
  };
}
// ユーザー設定を内部データから画面表示へ
pcrconfig.configDataToConfigView = function(configData) {
  $('#userName').val(configData.userName);
  $('#keepUserName').prop('checked', configData.keepUserName);
  $('#hideUserName').prop('checked', configData.hideUserName);
  $('#dbName').val(configData.dbName);
  $('#keepDBName').prop('checked', configData.keepDBName);
  $('#hideDBName').prop('checked', configData.hideDBName);
  $('#searchStartUnitsMin').val(configData.searchStartUnitsMin);
  $('#numOfSearchPartySlots').val(configData.numOfSearchPartySlots);
  $('#searchResultLimit').val(configData.searchResultLimit);
  $('#clientServerMode').prop('checked', configData.clientServerMode);
  $('#saveCookie').prop('checked', configData.saveCookie);
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
    $.cookie('config', JSON.stringify(configData.items), pcrdef.COOKIE_OPTIONS);
  } else {
    pcrconfig.removeConfigDataFromCookie();
  }
};
// クッキーからユーザー設定データを復元
pcrconfig.restoreConfigDataFromCookie = function() {
  const configData = new pcrconfig.ConfigData();
  try {
    const cookieData = $.cookie('config');
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
  $.removeCookie('config', pcrdef.COOKIE_OPTIONS);
};

// ユーザー設定画面のユーザー名入力フィールド内容の表示非表示を切り替え
pcrconfig.switchDisplayOfUserNameInputField = function() {
  const $userName = $('#userName');
  const $hideUserName = $('#hideUserName');
  if (!$hideUserName.prop('checked')) {
    $userName.attr('type', 'text');
  } else {
    $userName.attr('type', 'password');
  }
};
// ユーザー設定画面のデータベース名入力フィールド内容の表示非表示を切り替え
pcrconfig.switchDisplayOfDBNameInputField = function() {
  const $dbName = $('#dbName');
  const $hideDBName = $('#hideDBName');
  if (!$hideDBName.prop('checked')) {
    $dbName.attr('type', 'text');
  } else {
    $dbName.attr('type', 'password');
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
  $('#dummyConfigItem1').focus();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

pcrconfig.goToContent = {};
pcrconfig.hideUserName = {};
pcrconfig.hideDBName = {};

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
pcrconfig.goToContent.onKeydown = function(e) {
  if (!pcrnote.gViewController.isPageConfig()) return;
  if (e.keyCode !== 13) return;
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

// イベントリスナー登録
pcrconfig.addEventListener = function() {
  $('#goToContent').on('click', pcrconfig.goToContent.onClick);
  $(window).on('keydown', pcrconfig.goToContent.onKeydown);
  $('#hideUserName').on('click', pcrconfig.hideUserName.onClick);
  $('#hideDBName').on('click', pcrconfig.hideDBName.onClick);
};

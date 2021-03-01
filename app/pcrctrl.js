// クライアント側ユーザー設定部、コンテンツ部共用
// 制御処理

'use strict';

var pcrctrl = pcrctrl || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 表示制御クラス
pcrctrl.ViewController = function(opt_rhs) {
  // 引数なしコンストラクタ
  if (opt_rhs === undefined) {
    this.states = {
      page: pcrdef.ViewController.PAGE_CONFIG,
      newTab: pcrdef.ViewController.NEW_TAB_DEFENSE_OFF,
      searchTab: pcrdef.ViewController.SEARCH_TAB_DEFENSE_OFF,
      usedFor: pcrdef.ViewController.USED_FOR_ARENA,
      viewStyle: pcrdef.ViewController.VIEW_STYLE_SIMPLE,
      compareFunc: 'compareVsSetByPlatoonOrder',
      orderBy: pcrdef.OrderBy.ASC
    };
  // コピーコンストラクタ
  } else if (opt_rhs instanceof pcrctrl.ViewController) {
    this.states = pcrutil.deepCopy(opt_rhs.states);
  // 引数ありコンストラクタ
  } else if (pcrutil.isObject(opt_rhs)) {
    this.states = opt_rhs;
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt_rhs');
  }
  Object.seal(this);
  Object.seal(this.states);
};
pcrctrl.ViewController.prototype = {
  // ページの表示状態を取得
  get page() { return this.states.page; },
  isPageConfig: undefined,
  isPageContent: undefined,
  // ページの表示状態を内部的に切り替え
  switchPageConfig: undefined,
  switchPageContent: undefined,
  // 新規登録部の表示状態を取得
  get newTab() { return this.states.newTab; },
  isNewTabOffenseOn: undefined,
  isNewTabDefenseOn: undefined,
  isNewTabOn: undefined,
  isNewTabOffenseSide: undefined,
  // 新規登録部の表示状態を内部的に切り替え
  switchNewTabOffenseOn: undefined,
  switchNewTabDefenseOn: undefined,
  switchNewTabOn: undefined,
  switchNewTabOff: undefined,
  // ユニット検索部の表示状態を取得
  get searchTab() { return this.states.searchTab; },
  isSearchTabOffenseOn: undefined,
  isSearchTabDefenseOn: undefined,
  isSearchTabOn: undefined,
  isSearchTabOffenseSide: undefined,
  // ユニット検索部の表示状態を内部的に切り替え
  switchSearchTabOffenseOn: undefined,
  switchSearchTabDefenseOn: undefined,
  switchSearchTabOn: undefined,
  switchSearchTabOff: undefined,
  // 用途を取得
  get usedFor() { return this.states.usedFor; },
  isUsedForArena: undefined,
  isUsedForClanbattle: undefined,
  // 用途を内部的に切り替え
  switchUsedFor: undefined,
  // 検索結果一覧の表示方法を取得
  get viewStyle() { return this.states.viewStyle; },
  // 検索結果一覧の表示方法を内部的に切り替え
  switchViewStyle: undefined,
  // ソート用比較関数
  get compareFunc() { return this.states.compareFunc; },
  // ソート順
  get orderBy() { return this.states.orderBy; }
};
Object.seal(pcrctrl.ViewController.prototype);

// ページの表示状態を取得
pcrctrl.ViewController.prototype.isPageConfig = function() {
  return this.states.page === pcrdef.ViewController.PAGE_CONFIG;
};
pcrctrl.ViewController.prototype.isPageContent = function() {
  return this.states.page === pcrdef.ViewController.PAGE_CONTENT;
};
// ページの表示状態を内部的に切り替え
pcrctrl.ViewController.prototype.switchPageConfig = function() {
  this.states.page = pcrdef.ViewController.PAGE_CONFIG;
};
pcrctrl.ViewController.prototype.switchPageContent = function() {
  this.states.page = pcrdef.ViewController.PAGE_CONTENT;
};

// 新規登録部の表示状態を取得
pcrctrl.ViewController.prototype.isNewTabOffenseOn = function() {
  return this.states.newTab === pcrdef.ViewController.NEW_TAB_OFFENSE_ON;
};
pcrctrl.ViewController.prototype.isNewTabDefenseOn = function() {
  return this.states.newTab === pcrdef.ViewController.NEW_TAB_DEFENSE_ON;
};
pcrctrl.ViewController.prototype.isNewTabOn = function() {
  return this.isNewTabOffenseOn() || this.isNewTabDefenseOn();
};
pcrctrl.ViewController.prototype.isNewTabOffenseSide = function() {
  if (
    this.states.newTab === pcrdef.ViewController.NEW_TAB_OFFENSE_ON ||
    this.states.newTab === pcrdef.ViewController.NEW_TAB_OFFENSE_OFF
  ) {
    return true;
  } else {
    return false;
  }
};
// 新規登録部の表示状態を内部的に切り替え
pcrctrl.ViewController.prototype.switchNewTabOffenseOn = function() {
  this.states.newTab = pcrdef.ViewController.NEW_TAB_OFFENSE_ON;
  this.switchSearchTabOff();
};
pcrctrl.ViewController.prototype.switchNewTabDefenseOn = function() {
  this.states.newTab = pcrdef.ViewController.NEW_TAB_DEFENSE_ON;
  this.switchSearchTabOff();
};
pcrctrl.ViewController.prototype.switchNewTabOn = function(opt_index) {
  // 前回選択されていた編成を再選択
  if (opt_index === undefined) {
    if (this.isNewTabOffenseSide()) {
      this.switchNewTabOffenseOn();
    } else {
      this.switchNewTabDefenseOn();
    }
  // 攻撃側編成を選択
  } else if (opt_index === 0) {
    this.switchNewTabOffenseOn();
  // 防衛側編成を選択
  } else if (opt_index === 1) {
    this.switchNewTabDefenseOn();
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt_index');
  }
};
pcrctrl.ViewController.prototype.switchNewTabOff = function() {
  if (this.isNewTabOffenseOn()) {
    this.states.newTab = pcrdef.ViewController.NEW_TAB_OFFENSE_OFF;
  } else if (this.isNewTabDefenseOn()) {
    this.states.newTab = pcrdef.ViewController.NEW_TAB_DEFENSE_OFF;
  }
};

// ユニット検索部の表示状態を取得
pcrctrl.ViewController.prototype.isSearchTabOffenseOn = function() {
  return this.states.searchTab === pcrdef.ViewController.SEARCH_TAB_OFFENSE_ON;
};
pcrctrl.ViewController.prototype.isSearchTabDefenseOn = function() {
  return this.states.searchTab === pcrdef.ViewController.SEARCH_TAB_DEFENSE_ON;
};
pcrctrl.ViewController.prototype.isSearchTabOn = function() {
  return this.isSearchTabOffenseOn() || this.isSearchTabDefenseOn();
};
pcrctrl.ViewController.prototype.isSearchTabOffenseSide = function() {
  if (
    this.states.searchTab === pcrdef.ViewController.SEARCH_TAB_OFFENSE_ON ||
    this.states.searchTab === pcrdef.ViewController.SEARCH_TAB_OFFENSE_OFF
  ) {
    return true;
  } else {
    return false;
  }
};
// ユニット検索部の表示状態を内部的に切り替え
pcrctrl.ViewController.prototype.switchSearchTabOffenseOn = function() {
  this.states.searchTab = pcrdef.ViewController.SEARCH_TAB_OFFENSE_ON;
  this.switchNewTabOff();
};
pcrctrl.ViewController.prototype.switchSearchTabDefenseOn = function() {
  this.states.searchTab = pcrdef.ViewController.SEARCH_TAB_DEFENSE_ON;
  this.switchNewTabOff();
};
pcrctrl.ViewController.prototype.switchSearchTabOn = function(opt_index) {
  // 前回選択されていた編成を再選択
  if (opt_index === undefined) {
    if (this.isSearchTabOffenseSide()) {
      this.switchSearchTabOffenseOn();
    } else {
      this.switchSearchTabDefenseOn();
    }
  // 攻撃側編成を選択
  } else if (opt_index === 0) {
    this.switchSearchTabOffenseOn();
  // 防衛側編成を選択
  } else if (opt_index === 1) {
    this.switchSearchTabDefenseOn();
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt_index');
  }
};
pcrctrl.ViewController.prototype.switchSearchTabOff = function() {
  if (this.isSearchTabOffenseOn()) {
    this.states.searchTab = pcrdef.ViewController.SEARCH_TAB_OFFENSE_OFF;
  } else if (this.isSearchTabDefenseOn()) {
    this.states.searchTab = pcrdef.ViewController.SEARCH_TAB_DEFENSE_OFF;
  }
};

// 用途を取得
pcrctrl.ViewController.prototype.isUsedForArena = function() {
  return this.states.usedFor === pcrdef.ViewController.USED_FOR_ARENA;
};
pcrctrl.ViewController.prototype.isUsedForClanbattle = function() {
  return this.states.usedFor === pcrdef.ViewController.USED_FOR_CLANBATTLE;
};
// 用途を内部的に切り替え
pcrctrl.ViewController.prototype.switchUsedFor = function() {
  switch (this.states.usedFor) {
  case pcrdef.ViewController.USED_FOR_ARENA:
    this.states.usedFor = pcrdef.ViewController.USED_FOR_CLANBATTLE;
    break;
  case pcrdef.ViewController.USED_FOR_CLANBATTLE:
    this.states.usedFor = pcrdef.ViewController.USED_FOR_ARENA;
    break;
  }
};

// 検索結果一覧の表示方法を内部的に切り替え
pcrctrl.ViewController.prototype.switchViewStyle = function() {
  switch (this.states.viewStyle) {
  case pcrdef.ViewController.VIEW_STYLE_MINIMUM:
    this.states.viewStyle = pcrdef.ViewController.VIEW_STYLE_SIMPLE;
    break;
  case pcrdef.ViewController.VIEW_STYLE_SIMPLE:
    this.states.viewStyle = pcrdef.ViewController.VIEW_STYLE_NORMAL;
    break;
  case pcrdef.ViewController.VIEW_STYLE_NORMAL:
    this.states.viewStyle = pcrdef.ViewController.VIEW_STYLE_MINIMUM;
    break;
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 画面更新監視クラス
pcrctrl.ContentViewRefreshObserver = function() {
  this.states = {
    // 表示制御
    viewCtrl: {},
    // ユーザー設定データ
    configData: {},
    // 対戦情報テーブルのデータの取得状態
    importState: pcrdef.VsSetTableImportState.SYNC,
    // エラーメッセージ
    errorMessage: '',
    // 検索結果一覧の最終変更日時
    lastModified: '',
    // 新規対戦情報
    newVsSet: {},
    // ユニット検索情報
    searchVsSet: {},
    // ハッシュタグ
    hashtag1: '',
    hashtag2: ''
  };
  Object.seal(this);
  Object.seal(this.states);
};
pcrctrl.ContentViewRefreshObserver.prototype = {
  // 現在の画面更新監視データを収集
  collectCurrStates: undefined,
  // 画面更新監視データを最新に更新
  updateStates: undefined,
  // 画面更新部位を取得
  getRefreshFlags: undefined
};
Object.seal(pcrctrl.ContentViewRefreshObserver.prototype);

// 現在の画面更新監視データを収集
pcrctrl.ContentViewRefreshObserver.prototype.collectCurrStates = function() {
  return {
    viewCtrl: new pcrctrl.ViewController(pcrnote.gViewController),
    configData: new pcrconfig.ConfigData(pcrnote.gConfigData),
    importState: pcrnote.gVsSetTable.getImportState(),
    errorMessage: pcrnote.gVsSetTable.getErrorMessage(),
    lastModified: pcrnote.gVsSetTable.getResult().lastModified,
    newVsSet: pcrutil.deepCopy(pcrnote.gNewVsSet),
    searchVsSet: pcrutil.deepCopy(pcrnote.gSearchVsSet),
    hashtag1: pcrutil.getSelectBoxState($_('#hashtag1')).value,
    hashtag2: pcrutil.getSelectBoxState($_('#hashtag2')).value
  };
};

// 画面更新監視データを最新に更新
pcrctrl.ContentViewRefreshObserver.prototype.updateStates = function() {
  this.states = this.collectCurrStates();
};

// 画面更新部位を取得
pcrctrl.ContentViewRefreshObserver.prototype.getRefreshFlags = function() {
  const prev = this.states;
  const curr = this.collectCurrStates();

  let refreshFlags = pcrdef.ContentViewRefreshFlags.REFRESH_NONE;
  // メニュー部の画面更新
  if (
    prev.viewCtrl.page !== curr.viewCtrl.page ||
    prev.viewCtrl.newTab !== curr.viewCtrl.newTab ||
    prev.viewCtrl.searchTab !== curr.viewCtrl.searchTab ||
    prev.viewCtrl.usedFor !== curr.viewCtrl.usedFor ||
    JSON.stringify(prev.configData) !== JSON.stringify(curr.configData) ||
    prev.importState !== curr.importState ||
    prev.hashtag1 !== curr.hashtag1 ||
    prev.hashtag2 !== curr.hashtag2
  ) {
    refreshFlags |= pcrdef.ContentViewRefreshFlags.REFRESH_MENU;
  }
  // 入力部の画面更新
  if (
    prev.viewCtrl.page !== curr.viewCtrl.page ||
    prev.viewCtrl.newTab !== curr.viewCtrl.newTab ||
    prev.viewCtrl.searchTab !== curr.viewCtrl.searchTab ||
    prev.viewCtrl.usedFor !== curr.viewCtrl.usedFor ||
    JSON.stringify(prev.configData) !== JSON.stringify(curr.configData) ||
    JSON.stringify(prev.newVsSet) !== JSON.stringify(curr.newVsSet) ||
    JSON.stringify(prev.searchVsSet) !== JSON.stringify(curr.searchVsSet)
  ) {
    refreshFlags |= pcrdef.ContentViewRefreshFlags.REFRESH_INPUT;
  }
  // 検索結果部の画面更新
  if (
    prev.viewCtrl.page !== curr.viewCtrl.page ||
    prev.viewCtrl.usedFor !== curr.viewCtrl.usedFor ||
    JSON.stringify(prev.configData) !== JSON.stringify(curr.configData) ||
    prev.errorMessage !== curr.errorMessage ||
    prev.lastModified !== curr.lastModified ||
    prev.viewCtrl.viewStyle !== curr.viewCtrl.viewStyle
  ) {
    refreshFlags |= pcrdef.ContentViewRefreshFlags.REFRESH_RESULT;
  }
  return refreshFlags;
};

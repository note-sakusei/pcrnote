// データベース

'use strict';

var exports = exports || undefined;
var require = require || function() {};

var pcrdef = pcrdef || require('./pcrdef');
var pcrmsg = pcrmsg || require('./pcrmsg');
var pcrunit = pcrunit || require('./pcrunit');
var pcrutil = pcrutil || require('./pcrutil');

var pcrdb = exports || pcrdb || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// トランザクションクラス
pcrdb.Transaction = function(opt_telegram) {
  // 引数なしコンストラクタ
  if (opt_telegram === undefined) {
    this.telegram = {
      userName: '',
      dbName: '',
      queryList: []
    };
  // 引数ありコンストラクタ
  } else if (pcrutil.isObject(opt_telegram)) {
    this.telegram = opt_telegram;
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt_telegram');
  }
  Object.seal(this);
  Object.seal(this.telegram);
};
pcrdb.Transaction.prototype = {
  // ユーザー名とデータベース名を設定
  bindAuthority: undefined,
  // トランザクションをリセット
  reset: undefined,
  // クエリの作成
  makeQuery: undefined,
  // トランザクションにクエリを追加
  addQuery: undefined,
  // テーブルにデータを追加
  insert: undefined,
  // テーブルのデータを更新
  update: undefined,
  // テーブルからデータを削除
  delete: undefined,
  // クエリを実行
  executeQuery: undefined,
  // コミット
  commit: undefined,
  // ユーザー名
  get userName() { return this.telegram.userName; },
  // データベース名
  get dbName() { return this.telegram.dbName; },
  // クエリ一覧
  get queryList() { return this.telegram.queryList; }
};
Object.seal(pcrdb.Transaction.prototype);

// ユーザー名とデータベース名を設定
pcrdb.Transaction.prototype.bindAuthority = function(
  userName, dbName
) {
  this.telegram.userName = userName;
  this.telegram.dbName = dbName;
  // ユーザー名が変更されたら、変更前に作成したクエリのユーザー名も変更
  for (const query of this.telegram.queryList) {
    query.touchUser = userName;
  }
};

// トランザクションをリセット
pcrdb.Transaction.prototype.reset = function() {
  this.telegram.queryList = [];
};

// クエリの作成
// ローカル側に対する更新時はクエリを直接渡す
// サーバー側に対する更新時はクエリを格納したトランザクションをサーバーに渡して処理を委譲
pcrdb.Transaction.prototype.makeQuery = function(queryType, vsSet) {
  const formatter = new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_DATA);
  return {
    type: queryType,
    value: pcrutil.deepCopy(vsSet),
    touchUser: this.telegram.userName,
    touchDate: formatter.format(new Date())
  };
};

// トランザクションにクエリを追加
pcrdb.Transaction.prototype.addQuery = function(query, pkey) {
  const queryList = this.telegram.queryList;

  // 同一データに対する更新クエリが存在する場合、古い方を削除
  const oldIndex = queryList.findIndex(
    (elem) =>
      elem.type === pcrdef.QueryType.UPDATE &&
      query.type === pcrdef.QueryType.UPDATE &&
      pkey.isSame(elem.value, query.value)
  );
  if (oldIndex !== -1) {
    // 更新時のチェックに引っかからないよう、古い方の更新日時に差し替え
    query.value.updateDate = queryList[oldIndex].value.updateDate;
    queryList.splice(oldIndex, 1);
  }

  queryList.push(query);
};

// テーブルにデータを追加
pcrdb.Transaction.prototype.insert = function(tableData, query, pkey) {
  const FUNC_NAME = 'pcrdb.Transaction.insert';

  // 重複チェック
  const insIndex = tableData.findIndex((elem) => pkey.isSame(elem, query.value));
  if (insIndex !== -1) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
  }

  const dupVsSet = pcrutil.deepCopy(query.value);
  dupVsSet.createUser = query.touchUser;
  dupVsSet.createDate = query.touchDate;

  tableData.push(dupVsSet);
};

// テーブルのデータを更新
pcrdb.Transaction.prototype.update = function(tableData, query, pkey) {
  const FUNC_NAME = 'pcrdb.Transaction.update';

  // 存在チェック
  const updIndex = tableData.findIndex((elem) => pkey.isSame(elem, query.value));
  if (updIndex === -1) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
  }
  // 上書きデータと更新日時が等しいかチェック
  const oldValue = tableData[updIndex];
  if (query.value.updateDate !== oldValue.updateDate) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1));
  }

  const dupVsSet = pcrutil.deepCopy(query.value);
  dupVsSet.updateUser = query.touchUser;
  dupVsSet.updateDate = query.touchDate;

  tableData[updIndex] = dupVsSet;
};

// テーブルからデータを削除
pcrdb.Transaction.prototype.delete = function(tableData, query, pkey) {
  const FUNC_NAME = 'pcrdb.Transaction.delete';

  // 存在チェック
  const delIndex = tableData.findIndex((elem) => pkey.isSame(elem, query.value));
  if (delIndex === -1) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
  }

  tableData.splice(delIndex, 1);
};

// クエリを実行
pcrdb.Transaction.prototype.executeQuery = function(tableData, query, pkey) {
  switch (query.type) {
  case pcrdef.QueryType.INSERT:
    this.insert(tableData, query, pkey);
    break;
  case pcrdef.QueryType.UPDATE:
    this.update(tableData, query, pkey);
    break;
  case pcrdef.QueryType.DELETE:
    this.delete(tableData, query, pkey);
    break;
  default:
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'query.type');
  }
};

// コミット
pcrdb.Transaction.prototype.commit = function(
  tableData, pkey,
  opt_processOnSuccess = () => {},
  opt_processOnFailure = () => {}
) {
  // クエリ実行
  for (const query of this.telegram.queryList) {
    try {
      this.executeQuery(tableData, query, pkey);
      opt_processOnSuccess(query);
    } catch (e) {
      opt_processOnFailure(query);
      throw e;
    }
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// プライマリキークラス
// オブジェクト表層のプロパティのみプライマリキーに設定可
pcrdb.PrimaryKey = function(...pkeyList) {
  for (const pkey of pkeyList) {
    if (!pcrutil.isString(pkey) || pkey === '') {
      throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'pkeyList');
    }
  }
  this.items = {
    pkeyList: pkeyList
  }
  Object.seal(this);
  Object.seal(this.items);
};
pcrdb.PrimaryKey.prototype = {
  // 同一データとみなせるか判断
  isSame: undefined
};
Object.seal(pcrdb.PrimaryKey.prototype);

// 同一データとみなせるか判断
pcrdb.PrimaryKey.prototype.isSame = function(lhs, rhs) {
  // プライマリキーを設定してあれば、指定のプロパティが全て合致するか比較
  if (this.items.pkeyList !== undefined) {
    const matchs = this.items.pkeyList.filter(
      (pkey) => JSON.stringify(lhs[pkey]) === JSON.stringify(rhs[pkey])
    );
    return matchs.length === this.items.pkeyList.length;
  // プライマリキーを設定してなければ丸ごと比較
  } else {
    return JSON.stringify(lhs) === JSON.stringify(rhs);
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// ユニット情報テーブルクラス
pcrdb.UnitInfoTable = function() {
  this.items = {
    // データ
    data: [],
    // ユニットIDによる索引
    indexByUnitID: {},
    // ユニット名による索引
    indexByUnitName: {}
  };
  this.addPCList();
  this.addNPCList();
  Object.seal(this);
  Object.seal(this.items);
};
pcrdb.UnitInfoTable.prototype = {
  // ユニット情報テーブルにユニットを追加
  addUnit: undefined,
  // ユニット情報テーブルにプレイヤーユニット一覧を追加
  addPCList: undefined,
  // ユニット情報テーブルにNPC一覧を追加
  addNPCList: undefined,
  // ユニット情報テーブルから全データを取得
  getAllData: undefined,
  // ユニット情報テーブルからユニットIDで検索し、ユニット情報を取得
  findByUnitID: undefined,
  // ユニットIDからユニット名に変換(CSVファイルへ出力時の変換用)
  convertUnitIDToUnitName: undefined,
  // ユニット名からユニットIDに変換(CSVファイルから入力時の変換用)
  convertUnitNameToUnitID: undefined,
  // ユニットの隊列位置を取得
  getUnitPosition: undefined,
  // 編成のソート用比較関数
  compareUnitPosition: undefined,
  // 編成をソート(隊列順にソート)
  sortParty: undefined
};
Object.seal(pcrdb.UnitInfoTable.prototype);

// ユニット情報テーブルにユニットを追加
pcrdb.UnitInfoTable.prototype.addUnit = function(
  unitID, unitName, imageURL, tierNum, isPC, isNPC
) {
  const FUNC_NAME = 'pcrdb.UnitInfoTable.addUnit';

  if (this.items.indexByUnitID[unitID] !== undefined) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0), unitID);
  }
  const unitInfo = {
    unitPos: this.items.data.length,
    unitID: unitID,
    unitName: unitName,
    imageURL: imageURL,
    tierNum: tierNum,
    isPC: isPC,
    isNPC: isNPC
  };
  this.items.data.push(unitInfo);
  this.items.indexByUnitID[unitID] = unitInfo;
  this.items.indexByUnitName[unitName] = unitInfo;
};

// ユニット情報テーブルにプレイヤーユニット一覧を追加
pcrdb.UnitInfoTable.prototype.addPCList = function() {
  const FUNC_NAME = 'pcrdb.UnitInfoTable.addPCList';

  const unitInfoList = pcrunit.PC_UNIT_INFO_LIST;
  for (const [tierNum, unitInfoTierList] of unitInfoList.entries()) {
    for (const unitInfo of unitInfoTierList) {
      if (
        !pcrutil.isString(unitInfo[0]) ||
        !pcrutil.isString(unitInfo[1]) ||
        !pcrutil.isString(unitInfo[2]) ||
        !pcrutil.isBoolean(unitInfo[3])
      ) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0), JSON.stringify(unitInfo));
      }

      this.addUnit(
        unitInfo[0], unitInfo[1], unitInfo[2], tierNum, unitInfo[3], false
      );
    }
  }
};

// ユニット情報テーブルにNPC一覧を追加
pcrdb.UnitInfoTable.prototype.addNPCList = function() {
  const FUNC_NAME = 'pcrdb.UnitInfoTable.addNPCList';

  const unitInfoList = pcrunit.NPC_UNIT_INFO_LIST;
  for (const [tierNum, unitInfoTierList] of unitInfoList.entries()) {
    for (const unitInfo of unitInfoTierList) {
      if (
        !pcrutil.isString(unitInfo[0]) ||
        !pcrutil.isString(unitInfo[1]) ||
        !pcrutil.isString(unitInfo[2]) ||
        !pcrutil.isBoolean(unitInfo[3])
      ) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0), JSON.stringify(unitInfo));
      }

      this.addUnit(
        unitInfo[0], unitInfo[1], unitInfo[2], tierNum, false, unitInfo[3]
      );
    }
  }
};

// ユニット情報テーブルから全データを取得
pcrdb.UnitInfoTable.prototype.getAllData = function() {
  return this.items.data;
};

// ユニット情報テーブルからユニットIDで検索し、ユニット情報を取得
pcrdb.UnitInfoTable.prototype.findByUnitID = function(unitID) {
  if (unitID === '') return undefined;
  return this.items.indexByUnitID[unitID];
};

// ユニットIDからユニット名に変換(CSVファイルへ出力時の変換用)
pcrdb.UnitInfoTable.prototype.convertUnitIDToUnitName = function(unitID) {
  const FUNC_NAME = 'pcrdb.UnitInfoTable.convertUnitIDToUnitName';

  // 空データは空データに変換
  if (unitID === '') return '';
  const unitInfo = this.items.indexByUnitID[unitID];
  if (unitInfo === undefined) {
    throw pcrutil.makeError(
      pcrmsg.getN(FUNC_NAME, 0),
      unitID !== undefined ? unitID : 'undefined'
    );
  }
  return unitInfo.unitName;
};
// ユニット名からユニットIDに変換(CSVファイルから入力時の変換用)
pcrdb.UnitInfoTable.prototype.convertUnitNameToUnitID = function(unitName) {
  const FUNC_NAME = 'pcrdb.UnitInfoTable.convertUnitNameToUnitID';

  // 空データは空データに変換
  if (unitName === '') return '';
  const unitInfo = this.items.indexByUnitName[unitName];
  if (unitInfo === undefined) {
    throw pcrutil.makeError(
      pcrmsg.getN(FUNC_NAME, 0),
      unitName !== undefined ? unitName : 'undefined'
    );
  }
  return unitInfo.unitID;
};

// ユニットの隊列位置を取得
// ユニット情報テーブルに存在しないユニット(空データ)は一番最後
pcrdb.UnitInfoTable.prototype.getUnitPosition = function(unitID) {
  const unitInfo = this.findByUnitID(unitID);
  const unitPos = (unitInfo !== undefined) ?
    unitInfo.unitPos : Number.MAX_SAFE_INTEGER;
  return unitPos;
};

// 編成のソート用比較関数
pcrdb.UnitInfoTable.prototype.compareUnitPosition = function(
  lhsUnitID, rhsUnitID
) {
  const lhsUnitPos = this.getUnitPosition(lhsUnitID);
  const rhsUnitPos = this.getUnitPosition(rhsUnitID);
  if (lhsUnitPos === rhsUnitPos) return 0;
  return lhsUnitPos < rhsUnitPos ? -1 : 1;
};

// 編成をソート(隊列順にソート)
pcrdb.UnitInfoTable.prototype.sortParty = function(party) {
  party.sort((lhsUnitID, rhsUnitID) => {
    return this.compareUnitPosition(lhsUnitID, rhsUnitID)
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 対戦情報テーブルクラス
pcrdb.VsSetTable = function(unitInfoTable, opt_transaction) {
  if (!unitInfoTable instanceof pcrdb.UnitInfoTable) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'unitInfoTable');
  }
  if (
    opt_transaction !== undefined &&
    !opt_transaction instanceof pcrdb.Transaction
  ) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt_transaction');
  }

  this.items = {
    // 読み込みファイル名
    // ファイルから読み込み時に取得し、保存ファイル名の作成時に再利用
    loadFileName: undefined,
    // データ
    data: [],
    // エラー情報
    error: undefined,
    // データの取得状態
    importState: pcrdef.VsSetTableImportState.SYNC,
  };
  // ユニット情報テーブル
  this.unitInfoTable = unitInfoTable;
  // トランザクション(サーバーモード用)
  if (opt_transaction === undefined) {
    this.transaction = new pcrdb.Transaction();
  } else {
    this.transaction = opt_transaction;
  }
  // プライマリキー
  this.pkey = new pcrdb.PrimaryKey('offenseParty', 'defenseParty');
  // 検索結果
  this.result = new pcrdb.VsSetTable.Result();

  Object.seal(this);
  Object.seal(this.items);
};
pcrdb.VsSetTable.prototype = {
  // データ、エラー情報を纏めて設定
  setDataAndError: undefined,
  // 全データを取得
  getAllData: undefined,
  // エラーメッセージを取得
  getErrorMessage: undefined,
  // データの取得状態を取得
  getImportState: undefined,
  isImportDataSync: undefined,
  isImportDataAsync: undefined,
  isImportDataWhileSync: undefined,
  // データの取得状態を内部的に切り替え
  switchImportStateSync: undefined,
  switchImportStateAsync: undefined,
  switchImportStateWhileSync: undefined,
  // 対戦情報のデータ構造をチェック
  checkVsSetStruct: undefined,
  // 対戦情報のデータ内容をチェック
  checkVsSetContent: undefined,
  // 対戦情報の重複チェック
  checkDuplicatedVsSet: undefined,
  // ファイル保存形式データを対戦情報テーブルデータに変換
  toInternalData: undefined,
  // 対戦情報テーブルデータをファイル保存形式データに変換
  toExternalData: undefined,
  // ローカルファイルからデータを読み込み
  importDataFromFile: undefined,
  // サーバーと同期
  importDataFromServer: undefined,
  // ローカルにデータをダウンロード
  exportDataToFile: undefined,
  // 更新データをサーバーに送信
  exportDataToServer: undefined,
  // データを追加(インタフェース)
  insert: undefined,
  // データを更新(インタフェース)
  update: undefined,
  // データを削除(インタフェース)
  delete: undefined,
  // コミット(サーバー側用)
  commit: undefined,
  // ソート用比較関数(隊列順)
  compareVsSetByPlatoonOrder: undefined,
  // ソート用比較関数(評価順)
  compareVsSetByRating: undefined,
  // ソート用比較関数(登録日時順)
  compareVsSetByCreationDate: undefined,
  // ソート用比較関数(更新日時順)
  compareVsSetByUpdatingDate: undefined,
  // ソート用比較関数(ハッシュタグ数値順)
  compareVsSetByHashtag: undefined,
  // ソート
  sort: undefined,
  // 検索(絞り込み)
  filter: undefined,
  // 検索結果を取得
  getResult: undefined
};
Object.seal(pcrdb.VsSetTable.prototype);

// データ、エラー情報を纏めて設定
// undefinedを渡した場合、更新しない
// エラー情報に空文字を渡した場合、未エラーに初期化
pcrdb.VsSetTable.prototype.setDataAndError = function(data, err) {
  if (data !== undefined) {
    this.items.data = data;
  }
  if (err !== undefined) {
    if (err === '') {
      this.items.error = undefined;
    } else {
      this.items.error = err;
    }
  }
}

// 全データを取得
pcrdb.VsSetTable.prototype.getAllData = function() {
  return this.items.data;
};

// エラーメッセージを取得
pcrdb.VsSetTable.prototype.getErrorMessage = function() {
  return (this.items.error !== undefined) ? this.items.error.message : '';
};

// データの取得状態を取得
pcrdb.VsSetTable.prototype.getImportState = function() {
  return this.items.importState;
};
pcrdb.VsSetTable.prototype.isImportDataSync = function() {
  return this.items.importState === pcrdef.VsSetTableImportState.SYNC;
};
pcrdb.VsSetTable.prototype.isImportDataAsync = function() {
  return this.items.importState === pcrdef.VsSetTableImportState.ASYNC;
};
pcrdb.VsSetTable.prototype.isImportDataWhileSync = function() {
  return this.items.importState === pcrdef.VsSetTableImportState.WHILE_SYNC;
};
// データの取得状態を内部的に切り替え
pcrdb.VsSetTable.prototype.switchImportStateSync = function() {
  this.items.importState = pcrdef.VsSetTableImportState.SYNC;
};
pcrdb.VsSetTable.prototype.switchImportStateAsync = function() {
  this.items.importState = pcrdef.VsSetTableImportState.ASYNC;
};
pcrdb.VsSetTable.prototype.switchImportStateWhileSync = function() {
  this.items.importState = pcrdef.VsSetTableImportState.WHILE_SYNC;
};

// 対戦情報のデータ構造をチェック
pcrdb.VsSetTable.prototype.checkVsSetStruct = function(vsSet, index) {
  const FUNC_NAME = 'pcrdb.VsSetTable.checkVsSetStruct';

  const baseErrMsg = pcrmsg.getN(FUNC_NAME, 0);
  const vsSetStr = JSON.stringify(vsSet);

  // 攻撃側編成
  if (!pcrutil.isArray(vsSet.offenseParty)) {
    throw pcrutil.makeError(baseErrMsg, index, 'offenseParty', vsSetStr);
  }
  // 防衛側編成
  if (!pcrutil.isArray(vsSet.defenseParty)) {
    throw pcrutil.makeError(baseErrMsg, index, 'defenseParty', vsSetStr);
  }
  // 評価
  if (
    vsSet.rating === undefined ||
    !pcrutil.asInteger(vsSet.rating.good) ||
    !pcrutil.asInteger(vsSet.rating.bad)
  ) {
    throw pcrutil.makeError(baseErrMsg, index, 'rating', vsSetStr);
  }
  // コメント
  if (!pcrutil.isString(vsSet.comment)) {
    throw pcrutil.makeError(baseErrMsg, index, 'comment', vsSetStr);
  }
  // 作成ユーザー
  if (!pcrutil.isString(vsSet.createUser)) {
    throw pcrutil.makeError(baseErrMsg, index, 'createUser', vsSetStr);
  }
  // 作成日時
  if (!pcrutil.isString(vsSet.createDate)) {
    throw pcrutil.makeError(baseErrMsg, index, 'createDate', vsSetStr);
  }
  // 更新ユーザー
  if (!pcrutil.isString(vsSet.updateUser)) {
    throw pcrutil.makeError(baseErrMsg, index, 'updateUser', vsSetStr);
  }
  // 更新日時
  if (!pcrutil.isString(vsSet.updateDate)) {
    throw pcrutil.makeError(baseErrMsg, index, 'updateDate', vsSetStr);
  }
};

// 対戦情報のデータ内容をチェック
pcrdb.VsSetTable.prototype.checkVsSetContent = function(
  vsSet, index, isUnitIDCheck
) {
  const FUNC_NAME = 'pcrdb.VsSetTable.checkVsSetContent';

  const baseErrMsg = pcrmsg.getN(FUNC_NAME, 0);
  const vsSetStr = JSON.stringify(vsSet);

  // 攻撃側編成
  if (vsSet.offenseParty.length !== pcrdef.PARTY_UNITS_MAX) {
    throw pcrutil.makeError(baseErrMsg, index, 'offenseParty', vsSetStr);
  }
  try {
    for (const unitIDOrName of vsSet.offenseParty) {
      isUnitIDCheck ?
        this.unitInfoTable.convertUnitIDToUnitName(unitIDOrName) :
        this.unitInfoTable.convertUnitNameToUnitID(unitIDOrName);
    }
  } catch (e) {
    throw pcrutil.makeError(baseErrMsg, index, 'offenseParty', e.message);
  }
  // 防衛側編成
  if (vsSet.defenseParty.length !== pcrdef.PARTY_UNITS_MAX) {
    throw pcrutil.makeError(baseErrMsg, index, 'defenseParty', vsSetStr);
  }
  try {
    for (const unitIDOrName of vsSet.defenseParty) {
      isUnitIDCheck ?
        this.unitInfoTable.convertUnitIDToUnitName(unitIDOrName) :
        this.unitInfoTable.convertUnitNameToUnitID(unitIDOrName);
    }
  } catch (e) {
    throw pcrutil.makeError(baseErrMsg, index, 'defenseParty', e.message);
  }
  // 評価
  if (
    vsSet.rating.good < pcrdef.RATING_VALUE.MIN ||
    pcrdef.RATING_VALUE.MAX < vsSet.rating.good ||
    vsSet.rating.bad < pcrdef.RATING_VALUE.MIN ||
    pcrdef.RATING_VALUE.MAX < vsSet.rating.bad
  ) {
    throw pcrutil.makeError(baseErrMsg, index, 'rating', vsSetStr);
  }
  // 作成ユーザー
  if (vsSet.createUser !== '') {
    if (
      pcrutil.strLength(vsSet.createUser) < pcrdef.USER_NAME_LENGTH.MIN ||
      pcrdef.USER_NAME_LENGTH.MAX < pcrutil.strLength(vsSet.createUser)
    ) {
      throw pcrutil.makeError(baseErrMsg, index, 'createUser', vsSetStr);
    }
  }
  // 作成日時
  if (vsSet.createDate !== '') {
    if (!pcrutil.asDate(vsSet.createDate, pcrdef.DATE_FORMAT_FOR_DATA)) {
      throw pcrutil.makeError(baseErrMsg, index, 'createDate', vsSetStr);
    }
  }
  // 更新ユーザー
  if (vsSet.updateUser !== '') {
    if (
      pcrutil.strLength(vsSet.updateUser) < pcrdef.USER_NAME_LENGTH.MIN ||
      pcrdef.USER_NAME_LENGTH.MAX < pcrutil.strLength(vsSet.updateUser)
    ) {
      throw pcrutil.makeError(baseErrMsg, index, 'updateUser', vsSetStr);
    }
  }
  // 更新日時
  if (vsSet.updateDate !== '') {
    if (!pcrutil.asDate(vsSet.updateDate, pcrdef.DATE_FORMAT_FOR_DATA)) {
      throw pcrutil.makeError(baseErrMsg, index, 'updateDate', vsSetStr);
    }
  }
};

// 対戦情報の重複チェック
// 重複データがあってもログを出力するのみでエラーにはしない
pcrdb.VsSetTable.prototype.checkDuplicatedVsSet = function(vsSetList) {
  const FUNC_NAME = 'pcrdb.VsSetTable.checkDuplicatedVsSet';

  // 処理高速化のため、一旦文字列に変換してからチェック
  let checkList = vsSetList.map((vsSet) => {
    return JSON.stringify([vsSet.offenseParty, vsSet.defenseParty]);
  });
  checkList = checkList.map((lhs_elem, lhs_index) => {
    return checkList.find((rhs_elem, rhs_index) => {
      return lhs_index !== rhs_index && lhs_elem === rhs_elem;
    });
  });
  if (checkList.filter((dupStr) => dupStr !== undefined).length !== 0) {
    for (const [index, dupStr] of checkList.entries()) {
      if (dupStr !== undefined) {
        const errMsg = pcrutil.buildMessage(
          pcrmsg.getN(FUNC_NAME, 0), index, JSON.stringify(vsSetList[index])
        );
        console.log(errMsg);
      }
    }
  }
};

// ファイル保存形式データを対戦情報テーブルデータに変換
pcrdb.VsSetTable.prototype.toInternalData = function(externalData, fileType) {
  const FUNC_NAME = 'pcrdb.VsSetTable.toInternalData';

  // データの部分書き換えを行うので丸ごと複製
  const internalData = pcrutil.deepCopy(externalData);

  // データ構造をチェック
  internalData.forEach((vsSet, index) => this.checkVsSetStruct(vsSet, index));

  // CSVファイルから読み込んだデータは全て文字列として扱うため、一部数値に変換
  if (fileType === pcrdef.FileType.CSV) {
    internalData.map((vsSet) => {
      vsSet.rating.good = Number(vsSet.rating.good);
      vsSet.rating.bad = Number(vsSet.rating.bad);
    });
  }

  // データ内容をチェック
  internalData.forEach(
    (vsSet, index) => this.checkVsSetContent(vsSet, index, false)
  );

  // ユニット名からユニットIDに変換
  for (const vsSet of internalData) {
    vsSet.offenseParty = vsSet.offenseParty.map(
      (unitName) => this.unitInfoTable.convertUnitNameToUnitID(unitName)
    );
    vsSet.defenseParty = vsSet.defenseParty.map(
      (unitName) => this.unitInfoTable.convertUnitNameToUnitID(unitName)
    );
  }

  // 日時を正規化
  const formatter = new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_DATA);
  for (const vsSet of internalData) {
    if (vsSet.createDate !== '') {
      const createDate = formatter.parse(vsSet.createDate);
      if (!pcrutil.isDate(createDate)) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0), vsSet.createDate);
      }
      vsSet.createDate = formatter.format(createDate);
    }
    if (vsSet.updateDate !== '') {
      const updateDate = formatter.parse(vsSet.updateDate);
      if (!pcrutil.isDate(updateDate)) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1), vsSet.updateDate);
      }
      vsSet.updateDate = formatter.format(updateDate);
    }
  }

  // 攻撃側編成、防衛側編成をソート
  for (const vsSet of internalData) {
    this.unitInfoTable.sortParty(vsSet.offenseParty);
    this.unitInfoTable.sortParty(vsSet.defenseParty);
  }

  return internalData;
};

// 対戦情報テーブルデータをファイル保存形式データに変換
pcrdb.VsSetTable.prototype.toExternalData = function(internalData) {
  // データの部分書き換えを行うので丸ごと複製
  let externalData = pcrutil.deepCopy(internalData);

  // ユニットIDをユニット名に変換
  for (const vsSet of externalData) {
    vsSet.offenseParty = vsSet.offenseParty.map(
      (unitID) => this.unitInfoTable.convertUnitIDToUnitName(unitID)
    );
    vsSet.defenseParty = vsSet.defenseParty.map(
      (unitID) => this.unitInfoTable.convertUnitIDToUnitName(unitID)
    );
  }

  return externalData;
};

// ローカルファイルからデータを読み込み
pcrdb.VsSetTable.prototype.importDataFromFile = function(
  fileInfo,
  opt_processOnSuccess = () => {},
  opt_processOnFailure = () => {}
) {
  const FUNC_NAME = 'pcrdb.VsSetTable.importDataFromFile';

  this.transaction.reset();

  // ファイル情報からMIMEタイプのチェックと念のため拡張子をチェック
  this.items.loadFileName = fileInfo.name;
  const mimeType = fileInfo.type;
  let fileType = undefined;
  if (mimeType === 'application/json') {
    if (/\.json$/.test(this.items.loadFileName)) {
      fileType = pcrdef.FileType.JSON;
    }
  } else if (
    mimeType === 'text/csv' ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/octet-stream'
  ) {
    if (/\.csv$/.test(this.items.loadFileName)) {
      fileType = pcrdef.FileType.CSV;
    }
  }
  if (fileType === undefined) {
    pcrutil.popup(pcrmsg.getN(FUNC_NAME, 0));
    return;
  }

  // ファイル読み込み
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    try {
      // ファイルデータをファイル保存形式データに変換
      const externalData = pcrutil.fileDataToObjectData(reader.result, fileType);
      // 重複チェック
      this.checkDuplicatedVsSet(externalData);
      // ファイル保存形式データを対戦情報テーブルデータに変換
      const internalData = this.toInternalData(externalData, fileType);
      this.setDataAndError(internalData, '');

      opt_processOnSuccess();
    } catch (e) {
      console.error(e);
      this.setDataAndError([], e);

      opt_processOnFailure();
    }
  });
  reader.addEventListener('error', () => {
    const err = pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1));
    this.setDataAndError([], err);

    opt_processOnFailure();
  });
  reader.readAsText(fileInfo, 'UTF-8');
}

// サーバーと同期
pcrdb.VsSetTable.prototype.importDataFromServer = function(
  opt_processOnSuccess = () => {},
  opt_processOnFailure = () => {}
) {
  const FUNC_NAME = 'pcrdb.VsSetTable.importDataFromServer';

  this.transaction.reset();

  // サーバーと通信成功時処理
  const transmitCompleted = ((event) => {
    this.switchImportStateSync();
    const req = event.target;
    const data = req.response;
    try {
      if (data === null) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
      }
      if (req.readyState !== 4 || req.status !== 200) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1), data.message);
      }

      // 重複チェック
      this.checkDuplicatedVsSet(data);
      // 受信データ(ファイル保存形式データ)を対戦情報テーブルデータに変換
      const internalData = this.toInternalData(data, pcrdef.FileType.JSON);
      this.setDataAndError(internalData, '');

      opt_processOnSuccess();
    } catch (e) {
      console.error(e);
      this.setDataAndError([], e);

      opt_processOnFailure();
    }
  });
  // サーバーと通信失敗時処理
  const transmitFailed = ((event) => {
    this.switchImportStateSync();
    const err = pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 2));
    console.error(err);
    this.setDataAndError(undefined, err);

    opt_processOnFailure();
  });

  // サーバーに問い合わせ
  const req = new XMLHttpRequest();
  req.addEventListener('load', transmitCompleted);
  req.addEventListener('error', transmitFailed);
  req.addEventListener('abort', transmitFailed);
  req.responseType = 'json';
  req.open('POST', pcrdef.SERVER_URL_READ_CGI);
  const sendData = JSON.stringify(this.transaction.telegram);
  req.send(sendData);

  this.switchImportStateWhileSync();
};

// ローカルにデータをダウンロード
pcrdb.VsSetTable.prototype.exportDataToFile = function(fileType) {
  try {
    // 対戦情報テーブルデータをファイル保存形式データに変換
    const externalData = this.toExternalData(this.items.data);
    // ファイル保存形式データをファイルデータに変換
    const fileData = pcrutil.objectDataToFileData(externalData, fileType);
    // ファイルデータをBlobデータに変換
    const blobData = pcrutil.fileDataToBlobData(fileData, fileType);

    // 保存ファイル名を作成
    let baseFileName = this.items.loadFileName;
    if (baseFileName === undefined) {
      if (this.transaction.dbName !== '') {
        baseFileName = this.transaction.dbName + '.xxx';
      } else {
        baseFileName = 'pcrnote.xxx';
      }
    }
    // 日時を付与し、拡張子を正しく付け直す
    const saveFileName = pcrutil.makeFileNameWithDate(baseFileName, fileType);

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blobData);
    a.target = '_blank';
    a.download = saveFileName;
    a.click();

    this.setDataAndError(undefined, '');
    this.transaction.reset();
  } catch (e) {
    console.error(e);
    this.setDataAndError(undefined, e);
  }
};

// 更新データをサーバーに送信
pcrdb.VsSetTable.prototype.exportDataToServer = function(
  opt_processOnSuccess = () => {},
  opt_processOnFailure = () => {}
) {
  const FUNC_NAME = 'pcrdb.VsSetTable.exportDataToServer';

  // サーバーと通信成功時処理
  const transmitCompleted = ((event) => {
    this.switchImportStateSync();
    const req = event.target;
    const data = req.response;
    try {
      if (data === null) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
      }
      if (req.readyState !== 4 || req.status !== 200) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1), data.message);
      }
      this.setDataAndError(undefined, '');
      this.transaction.reset();

      opt_processOnSuccess();
    } catch (e) {
      console.error(e);
      this.setDataAndError(undefined, e);

      opt_processOnFailure();
    }
  });
  // サーバーと通信失敗時処理
  const transmitFailed = ((event) => {
    this.switchImportStateSync();
    const err = pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 2));
    console.error(err);
    this.setDataAndError(undefined, err);

    opt_processOnFailure();
  });

  // サーバーに問い合わせ
  const req = new XMLHttpRequest();
  req.addEventListener('load', transmitCompleted);
  req.addEventListener('error', transmitFailed);
  req.addEventListener('abort', transmitFailed);
  req.responseType = 'json';
  req.open('POST', pcrdef.SERVER_URL_WRITE_CGI);
  const sendData = JSON.stringify(this.transaction.telegram);
  req.send(sendData);

  this.switchImportStateWhileSync();
};

// データを追加(インタフェース)
pcrdb.VsSetTable.prototype.insert = function(vsSet) {
  const query = this.transaction.makeQuery(pcrdef.QueryType.INSERT, vsSet);
  // ローカル側に即時追加
  this.transaction.executeQuery(this.items.data, query, this.pkey);
  // サーバー側に追加するためにトランザクションに追加
  this.transaction.addQuery(query, this.pkey);

  this.switchImportStateAsync();
};

// データを更新(インタフェース)
pcrdb.VsSetTable.prototype.update = function(vsSet) {
  const query = this.transaction.makeQuery(pcrdef.QueryType.UPDATE, vsSet);
  // ローカル側を即時更新
  this.transaction.executeQuery(this.items.data, query, this.pkey);
  // サーバー側を更新するためにトランザクションに追加
  this.transaction.addQuery(query, this.pkey);
  // 検索結果一覧を同期更新
  this.result.updateSync(query, this.pkey);

  this.switchImportStateAsync();
};

// データを削除(インタフェース)
pcrdb.VsSetTable.prototype.delete = function(vsSet) {
  const query = this.transaction.makeQuery(pcrdef.QueryType.DELETE, vsSet);
  // ローカル側の即時削除
  this.transaction.executeQuery(this.items.data, query, this.pkey);
  // サーバー側の削除をするためにトランザクションに追加
  this.transaction.addQuery(query, this.pkey);

  this.switchImportStateAsync();
};

// コミット(サーバー側用)
pcrdb.VsSetTable.prototype.commit = function(
  opt_processOnSuccess, opt_processOnFailure
) {
  // クエリのチェック
  for (const [index, query] of this.transaction.queryList.entries()) {
    this.checkVsSetStruct(query.value, index);
    this.checkVsSetContent(query.value, index, true);
  }

  // クエリの攻撃側編成、防衛側編成をソート
  for (const query of this.transaction.queryList) {
    this.unitInfoTable.sortParty(query.value.offenseParty);
    this.unitInfoTable.sortParty(query.value.defenseParty);
  }

  // コミット
  this.transaction.commit(
    this.items.data, this.pkey, opt_processOnSuccess, opt_processOnFailure
  );

  // 対戦情報テーブルをソート(隊列順、昇順)
  // サーバー側の保存データには常に同じソートを使用
  this.sort('compareVsSetByPlatoonOrder', pcrdef.OrderBy.ASC);
};

// ソート用比較関数(隊列順)
pcrdb.VsSetTable.prototype.compareVsSetByPlatoonOrder = function(
  lhsVsSet, rhsVsSet
) {
  let result = 0;

  // 先に防衛側で比較
  for (const i of pcrutil.generateRange(0, pcrdef.PARTY_UNITS_MAX - 1)) {
    const lhsPos = this.unitInfoTable.getUnitPosition(lhsVsSet.defenseParty[i]);
    const rhsPos = this.unitInfoTable.getUnitPosition(rhsVsSet.defenseParty[i]);
    if (lhsPos < rhsPos) {
      result = -1;
      break;
    }
    if (rhsPos < lhsPos) {
      result = 1;
      break;
    }
  }

  if (result !== 0) return result;

  // 次に攻撃側で比較
  for (const i of pcrutil.generateRange(0, pcrdef.PARTY_UNITS_MAX - 1)) {
    const lhsPos = this.unitInfoTable.getUnitPosition(lhsVsSet.offenseParty[i]);
    const rhsPos = this.unitInfoTable.getUnitPosition(rhsVsSet.offenseParty[i]);
    if (lhsPos < rhsPos) {
      result = -1;
      break;
    }
    if (rhsPos < lhsPos) {
      result = 1;
      break;
    }
  }

  return result;
};

// ソート用比較関数(評価順)
// 昇順ソートでは高評価から順に並ぶ
// 同一評価の場合、評価回数順に並ぶ
pcrdb.VsSetTable.prototype.compareVsSetByRating = function(
  lhsVsSet, rhsVsSet
) {
  const lhsGood = lhsVsSet.rating.good;
  const lhsBad = lhsVsSet.rating.bad;
  const rhsGood = rhsVsSet.rating.good;
  const rhsBad = rhsVsSet.rating.bad;
  // 高評価度
  const lhsRating = lhsGood - lhsBad;
  const rhsRating = rhsGood - rhsBad;
  // 評価回数
  const lhsTotalNumOfRating = lhsGood + lhsBad;
  const rhsTotalNumOfRating = rhsGood + rhsBad;

  if (rhsRating < lhsRating) return -1;
  if (lhsRating < rhsRating) return 1;
  if (rhsTotalNumOfRating < lhsTotalNumOfRating) return -1;
  if (lhsTotalNumOfRating < rhsTotalNumOfRating) return 1;
  return 0;
};

// ソート用比較関数(登録日時順)
pcrdb.VsSetTable.prototype.compareVsSetByCreationDate = function(
  lhsVsSet, rhsVsSet
) {
  const lhsTime = Date.parse(lhsVsSet.createDate);
  const rhsTime = Date.parse(rhsVsSet.createDate);
  if (lhsTime === rhsTime) return 0;
  return lhsTime < rhsTime ? -1 : 1;
};

// ソート用比較関数(更新日時順)
pcrdb.VsSetTable.prototype.compareVsSetByUpdatingDate = function(
  lhsVsSet, rhsVsSet
) {
  const lhsLastTouchDate = lhsVsSet.updateDate !== '' ?
    lhsVsSet.updateDate : lhsVsSet.createDate;
  const rhsLastTouchDate = rhsVsSet.updateDate !== '' ?
    rhsVsSet.updateDate : rhsVsSet.createDate;
  const lhsTime = Date.parse(lhsLastTouchDate);
  const rhsTime = Date.parse(rhsLastTouchDate);
  if (lhsTime === rhsTime) return 0;
  return lhsTime < rhsTime ? -1 : 1;
};

// ソート用比較関数(ハッシュタグ数値順)
pcrdb.VsSetTable.prototype.compareVsSetByHashtag = function(
  lhsVsSet, rhsVsSet
) {
  const getHashtagNum = (text) => {
    const hashtagList = pcrutil.extractHashtagList(text);
    const numericHashtag = hashtagList.find((elem) => /\d+/.test(elem));
    if (numericHashtag !== undefined) {
      return Number(numericHashtag.match(/\d+(?:\.\d+)?/)[0]);
    } else {
      return Number.MAX_SAFE_INTEGER;
    }
  };
  const lhsHashtagNum = getHashtagNum(lhsVsSet.comment);
  const rhsHashtagNum = getHashtagNum(rhsVsSet.comment);
  if (lhsHashtagNum === rhsHashtagNum) return 0;
  return lhsHashtagNum < rhsHashtagNum ? -1 : 1;
};

// ソート
pcrdb.VsSetTable.prototype.sort = function(compareFunc, orderBy) {
  const FUNC_NAME = 'pcrdb.VsSetTable.sort';

  if (orderBy !== pcrdef.OrderBy.ASC && orderBy !== pcrdef.OrderBy.DESC) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
  }
  const orderBySign = (orderBy === pcrdef.OrderBy.ASC) ? 1 : -1;
  this.items.data.sort((lhsVsSet, rhsVsSet) =>
    this[compareFunc](lhsVsSet, rhsVsSet) * orderBySign
  );
};

// 検索(絞り込み)
// 実行すると検索結果一覧を作成
// ソートが必要であれば、先にソートを行ってから検索を行うこと
// resultLimitが0以下の場合、上限なし検索
pcrdb.VsSetTable.prototype.filter = function(filterFuncList, resultLimit) {
  this.result = new pcrdb.VsSetTable.Result();

  // 絞り込みフラグ一覧
  const filterFlagList = new Array(this.items.data.length).fill(true);

  // 絞り込み
  // 複数の絞り込みがあればアンド条件で絞り込みを実行
  for (const filterFunc of filterFuncList) {
    if (!pcrutil.isFunction(filterFunc)) {
      throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'filterFuncList');
    }
    this.result.items.filtering = true;
    for (const [index, vsSet] of this.items.data.entries()) {
      if (!filterFunc(vsSet)) {
        filterFlagList[index] = false;
      }
    }
  }

  // 絞り込みを一切行わない場合、検索結果一覧の取得は行わない
  if (!this.result.items.filtering) return;

  // 検索結果件数(検索上限なし)を取得
  this.result.items.totalNum =
    filterFlagList.filter((filterFlag) => filterFlag).length;

  // 検索結果一覧(検索上限あり)を作成
  for (const [index, vsSet] of this.items.data.entries()) {
    if (filterFlagList[index]) {
      this.result.items.limitedList.push(vsSet);
      if (
        0 < resultLimit &&
        resultLimit <= this.result.items.limitedList.length
      ) {
        break;
      }
    }
  }
};

// 検索結果を取得
pcrdb.VsSetTable.prototype.getResult = function() {
  return this.result;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 対戦情報テーブルの検索結果クラス
pcrdb.VsSetTable.Result = function() {
  const formatter = new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_DIFF);
  this.items = {
    // 検索(絞り込み)が行われたか
    // 検索結果0件と検索を行っていない場合の0件を区別するため
    filtering: false,
    // 検索結果件数(検索上限で切り捨て前)
    totalNum: 0,
    // 検索結果一覧(検索上限で切り捨て後)
    limitedList: [],
    // 検索結果一覧の最終変更日時
    lastModified: formatter.format(new Date())
  };
  Object.seal(this);
  Object.seal(this.items);
};
pcrdb.VsSetTable.Result.prototype = {
  // 同期更新
  updateSync: undefined,
  // 検索結果の指定位置のデータを複製して取得
  pickDuplicating: undefined,
  get filtering() { return this.items.filtering; },
  get totalNum() { return this.items.totalNum; },
  get limitedList() { return this.items.limitedList; },
  get lastModified() { return this.items.lastModified; }
};
Object.seal(pcrdb.VsSetTable.Result.prototype);

// 同期更新
// 元データ更新後、再検索を行わない場合があるため
pcrdb.VsSetTable.Result.prototype.updateSync = function(query, pkey) {
  const FUNC_NAME = 'pcrdb.VsSetTable.Result.updateSync';

  if (this.items.limitedList.length !== 0) {
    const dupVsSet = pcrutil.deepCopy(query.value);
    dupVsSet.updateUser = query.touchUser;
    dupVsSet.updateDate = query.touchDate;

    const resultIndex = this.items.limitedList.findIndex(
      (elem) => pkey.isSame(elem, dupVsSet)
    );
    if (resultIndex === -1) {
      throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
    }

    this.items.limitedList[resultIndex] = dupVsSet;
  }
};

// 検索結果の指定位置のデータを複製して取得
pcrdb.VsSetTable.Result.prototype.pickDuplicating = function(index) {
  if (this.items.limitedList[index] === undefined) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'index');
  }
  return pcrutil.deepCopy(this.items.limitedList[index]);
};

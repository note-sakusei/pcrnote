// サーバー処理

'use strict';

const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const pcrdef = require('./pcrdef');
const pcrmsg = require('./pcrmsg');
const pcrutil = require('./pcrutil');
const pcrdb = require('./pcrdb');

var pcrsvr = pcrsvr || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 定数
// 設定ファイル名
pcrsvr.SETTING_FILE_NAME = 'pcrsvr.settings';
// CGIパスと実行関数の対応表
pcrsvr.CGI_MAP = {};
pcrsvr.CGI_MAP[pcrdef.SERVER_URL_READ_CGI] = 'readCGI';
pcrsvr.CGI_MAP[pcrdef.SERVER_URL_WRITE_CGI] = 'writeCGI';
// ステータスコード(数値のまま直接使用)
//   200: 正常
//   400: 受信データが無効
//   403: アクセス権がない
//   404: ファイルが存在しない
//   409: 内部データに矛盾が発生している
//   413: 受信データが巨大
//   500: 想定外の例外
// 拡張子とMIMEタイプの対応表
pcrsvr.MIME_TYPE_MAP = {
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};
// 利用可能リソース一覧(文字列or正規表現)
// サーバー側の実行ファイル、設定ファイル、データファイルを
// 公開ディレクトリ配下に置いた場合のアクセス防止用
pcrsvr.AVAILABLE_RESOURCE_LIST = [
  '/pcrnote.html',
  '/pcrnote.css',
  '/pcrdef.js',
  '/pcrmsg.js',
  '/pcrunit.js',
  '/pcrutil.js',
  '/pcrdb.js',
  '/pcrconfig.js',
  '/pcrctrl.js',
  '/pcract.js',
  '/pcrview.js',
  '/pcrevent.js',
  '/pcrnote.js',
  /^\/img\/.+\.(?:png|jpg)$/,
  /^\/img\/.+\/(?:arena|clanbattle)\/.(?:png|jpg)$/
];
// データベース名に使用出来る文字
pcrsvr.USABLE_CHARS_AS_DB_NAME = /^[a-z0-9\_]*[a-z0-9]$/;

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 設定ファイルクラス
pcrsvr.Setting = function() {
  const FUNC_NAME = 'pcrsvr.Setting.constructor';

  // 設定ファイルの読み込み
  this.items = pcrsvr.Setting.prototype.load();
  // 設定ファイルのチェック
  this.check();
  this.checkDetail();

  // 読み込んだ設定ファイルの内容を出力
  const settingText = pcrutil.buildMessage(
    pcrmsg.getN(FUNC_NAME, 0),
    this.tcpPortNum,
    this.useSSL,
    '' + this.sslKeyPath,
    '' + this.sslCertPath,
    this.wwwDir,
    this.dataDir,
    '' + this.backupDir,
    this.autoBackupData,
    this.receivedDataSizeMax,
    JSON.stringify(this.availableAuthorityList)
  );
  console.log(settingText);

  Object.seal(this);
};
pcrsvr.Setting.prototype = {
  // 設定ファイルの読み込み
  load: undefined,
  // 設定ファイルのチェック
  check: undefined,
  // 設定ファイルの詳細チェック
  checkDetail: undefined,
  // 接続ポート番号
  get tcpPortNum() { return this.items.tcpPortNum.value; },
  // SSLを使用するか
  get useSSL() { return pcrutil.getProperty(this, 'items.useSSL.value', false); },
  // 秘密鍵のパス
  get sslKeyPath() { return pcrutil.getProperty(this, 'items.sslKeyPath.value'); },
  // 証明書のパス
  get sslCertPath() { return pcrutil.getProperty(this, 'items.sslCertPath.value'); },
  // ドキュメントルート(公開)ディレクトリ
  get wwwDir() { return this.items.wwwDir.value; },
  // データディレクトリ
  get dataDir() { return this.items.dataDir.value; },
  // データのバックアップディレクトリ
  get backupDir() { return pcrutil.getProperty(this, 'items.backupDir.value') },
  // 更新毎にデータのバックアップを行うか
  get autoBackupData() { return pcrutil.getProperty(this, 'items.autoBackupData.value', false); },
  // 受信データ最大サイズ
  get receivedDataSizeMax() { return this.items.receivedDataSizeMax.value; },
  // 利用可能権限一覧
  get availableAuthorityList() { return this.items.availableAuthorityList.values; }
};
Object.seal(pcrsvr.Setting.prototype);

// 設定ファイルの読み込み
pcrsvr.Setting.prototype.load = function() {
  const FUNC_NAME = 'pcrsvr.Setting.load';

  // このスクリプトと同じディレクトリにある設定ファイル
  const filePath = pcrutil.makeFilePath(__dirname, pcrsvr.SETTING_FILE_NAME);
  if (!pcrutil.fileExists(filePath)) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0), filePath);
  }

  const fileData = fs.readFileSync(filePath);
  let settings = undefined;
  try {
    settings = pcrutil.fileDataToObjectData(fileData, pcrdef.FileType.JSON);
  } catch (e) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1), e.message);
  }

  return settings;
};

// 設定ファイルのチェック
pcrsvr.Setting.prototype.check = function() {
  const FUNC_NAME = 'pcrsvr.Setting.check';

  const checkItemList = [
    {keyStr: 'tcpPortNum', valueType: pcrdef.DataType.INTEGER, required: true},
    {keyStr: 'useSSL', valueType: pcrdef.DataType.BOOLEAN, required: false},
    {keyStr: 'sslKeyPath', valueType: pcrdef.DataType.STRING, required: false},
    {keyStr: 'sslCertPath', valueType: pcrdef.DataType.STRING, required: false},
    {keyStr: 'wwwDir', valueType: pcrdef.DataType.STRING, required: true},
    {keyStr: 'dataDir', valueType: pcrdef.DataType.STRING, required: true},
    {keyStr: 'backupDir', valueType: pcrdef.DataType.STRING, required: false},
    {keyStr: 'autoBackupData', valueType: pcrdef.DataType.BOOLEAN, required: false},
    {keyStr: 'receivedDataSizeMax', valueType: pcrdef.DataType.INTEGER, required: true},
    {keyStr: 'availableAuthorityList', valueType: pcrdef.DataType.ARRAY, required: true}
  ];

  for (const checkItem of checkItemList) {
    const propKeyList = [checkItem.keyStr];
    switch (checkItem.valueType) {
    case pcrdef.DataType.OBJECT:
    case pcrdef.DataType.ARRAY:
      propKeyList.push('values');
      break;
    default:
      propKeyList.push('value');
    }

    const propVal = pcrutil.getProperty(this.items, propKeyList);
    if (propVal === undefined) {
      // 必須項目であれば、未定義はエラー
      if (checkItem.required) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0), propKeyList.join('.'));
      // 必須項目でなければ、未定義であればチェックなし
      } else {
        continue;
      }
    }

    try {
      switch (checkItem.valueType) {
      case pcrdef.DataType.ARRAY:
        if (!pcrutil.isArray(propVal)) {
          throw pcrutil.makeError('');
        }
        break;
      case pcrdef.DataType.STRING:
        if (!pcrutil.isString(propVal)) {
          throw pcrutil.makeError('');
        }
        break;
      case pcrdef.DataType.INTEGER:
        if (!pcrutil.isInteger(propVal)) {
          throw pcrutil.makeError('');
        }
        break;
      case pcrdef.DataType.BOOLEAN:
        if (!pcrutil.isBoolean(propVal)) {
          throw pcrutil.makeError('');
        }
        break;
      default:
        throw pcrutil.makeError('');
      }
    } catch (e) {
      throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1), propKeyList.join('.'));
    }
  }
};

// 設定ファイルの詳細チェック
pcrsvr.Setting.prototype.checkDetail = function() {
  const FUNC_NAME = 'pcrsvr.Setting.checkDetail';

  if (this.useSSL) {
    if (!pcrutil.fileExists(this.sslKeyPath)) {
      throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0), '' + this.sslKeyPath);
    }
    if (!pcrutil.fileExists(this.sslCertPath)) {
      throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1), '' + this.sslCertPath);
    }
  }
  if (!pcrutil.directoryExists(this.wwwDir)) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 2), this.wwwDir);
  }
  if (!pcrutil.directoryExists(this.dataDir)) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 3), this.dataDir);
  }
  if (this.autoBackupData) {
    if (!pcrutil.directoryExists(this.backupDir)) {
      throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 4), '' + this.backupDir);
    }
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// リクエストヘッダクラス
pcrsvr.RequestHeader = function(req) {
  this.items = pcrsvr.RequestHeader.prototype.parse(req);
  Object.seal(this);
};
pcrsvr.RequestHeader.prototype = {
  // リクエストヘッダの解析
  parse: undefined,
  // クライアントのIPアドレス
  get clientIpAddress() { return this.items.clientIpAddress; },
  // レスポンスデータのエンコード種別
  get acceptEncodingList() { return this.items.acceptEncodingList; }
};
Object.seal(pcrsvr.RequestHeader.prototype);

// リクエストヘッダの解析
pcrsvr.RequestHeader.prototype.parse = function(req) {
  // クライアントのIPアドレス
  const parseClientIpAddress = (req) => {
    let ipAddr = req.headers['x-forwarded-for'];
    if (ipAddr === undefined && req.connection !== undefined) {
      ipAddr = req.connection.remoteAddress;
      if (ipAddr === undefined && req.connection.socket !== undefined) {
        ipAddr = req.connection.socket.remoteAddress;
      }
    }
    if (ipAddr === undefined && req.socket !== undefined) {
      ipAddr = req.socket.remoteAddress;
    }
    if (ipAddr === undefined) {
      ipAddr = '0.0.0.0';
    }
    return ipAddr.split(':').pop();
  }

  // レスポンスデータのエンコード種別
  const parseAcceptEncoding = (req) => {
    const encodeStr = req.headers['accept-encoding'];
    if (encodeStr === undefined) return undefined;
    const encodeList = encodeStr.match(/\b[a-z]+?\b/g);
    return encodeList !== null ? encodeList : undefined;
  }

  const items = {
    clientIpAddress: parseClientIpAddress(req),
    acceptEncodingList: parseAcceptEncoding(req)
  };
  return items;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 例外用HTTPレスポンスオブジェクトを作成
pcrsvr.makeHttpError = function(code, ...rest) {
  const errMsg = pcrutil.buildMessage.apply(undefined, rest);
  const httpResponse = {statusCode: code, message: errMsg};
  return new Error(JSON.stringify(httpResponse));
};

// ロギング
pcrsvr.logging = function(msg) {
  const FUNC_NAME = 'pcrsvr.logging';

  const ipAddr = pcrsvr.gRequestHeader.clientIpAddress;
  const formatter = new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_LOGGING);
  const nowStr = formatter.format(new Date());
  let msgStr = msg;
  if (pcrutil.isObject(msg) || pcrutil.isArray(msg)) {
    try { msgStr = JSON.stringify(msg); } catch (e) {}
  }

  const baseMsg = pcrmsg.getN(FUNC_NAME, 0);
  const record = pcrutil.buildMessage(baseMsg, ipAddr, nowStr, msgStr);
  console.log(record);
};

// ログイン認証
pcrsvr.authenticateAuthority = function(userName, dbName) {
  const FUNC_NAME = 'pcrsvr.authenticateAuthority';

  try {
    // ユーザー名をチェック
    if (userName !== '') {
      if (
        pcrutil.strLength(userName) < pcrdef.USER_NAME_LENGTH.MIN ||
        pcrdef.USER_NAME_LENGTH.MAX < pcrutil.strLength(userName)
      ) {
        pcrsvr.logging(pcrmsg.getN(FUNC_NAME, 0));
        throw pcrutil.makeError('');
      }
    }
    // データベース名をチェック
    if (
      pcrutil.strLength(dbName) < pcrdef.DB_NAME_LENGTH.MIN ||
      pcrdef.DB_NAME_LENGTH.MAX < pcrutil.strLength(dbName) ||
      !pcrsvr.USABLE_CHARS_AS_DB_NAME.test(dbName)
    ) {
      pcrsvr.logging(pcrmsg.getN(FUNC_NAME, 1));
      throw pcrutil.makeError('');
    }
    // 利用可能なユーザー、データベースかチェック
    const avail = pcrsvr.gSetting.availableAuthorityList.find((elem) => {
      if (elem.userName === userName && elem.dbName === dbName) {
        return true;
      } else if (elem.userName === userName && elem.dbName === '') {
        return true;
      } else if (elem.userName === '' && elem.dbName === dbName) {
        return true;
      } else if (elem.userName === '' && elem.dbName === '') {
        return true;
      } else {
        return false;
      }
    }) !== undefined;
    if (!avail) {
      throw pcrutil.makeError('');
    }
  } catch (e) {
    const baseResultMsg = pcrmsg.getN(FUNC_NAME, 2);
    pcrsvr.logging(pcrutil.buildMessage(baseResultMsg, userName, dbName));
    return false;
  }
  const baseResultMsg = pcrmsg.getN(FUNC_NAME, 3);
  pcrsvr.logging(pcrutil.buildMessage(baseResultMsg, userName, dbName));
  return true;
};

// 利用可能リソースかチェック
pcrsvr.isAvailableResource = function(urlPathName) {
  const avail = pcrsvr.AVAILABLE_RESOURCE_LIST.find((elem) => {
    if (pcrutil.isString(elem)) {
      return elem === urlPathName;
    } else {
      return elem.test(urlPathName);
    }
  }) !== undefined;
  return avail;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// JSONファイルから読み込み
pcrsvr.readCGI = function(recvObjData) {
  const FUNC_NAME = 'pcrsvr.readCGI';

  const fileName = recvObjData.dbName + '.json';
  const filePath = pcrutil.makeFilePath(pcrsvr.gSetting.dataDir, fileName);

  // ファイルの存在チェック
  if (!pcrutil.fileExists(filePath)) {
    throw pcrsvr.makeHttpError(404, pcrmsg.getN(FUNC_NAME, 0), fileName);
  }

  // 読み込み
  const fileData = fs.readFileSync(filePath);
  pcrsvr.logging(pcrmsg.getN(FUNC_NAME, 1));

  return fileData;
};

// JSONファイルに書き出し
pcrsvr.writeCGI = function(recvObjData) {
  const FUNC_NAME = 'pcrsvr.writeCGI';

  const fileName = recvObjData.dbName + '.json';
  const filePath = pcrutil.makeFilePath(pcrsvr.gSetting.dataDir, fileName);

  // 受信データからトランザクションを復元し、空の対戦情報テーブルを作成
  const vsSetTable = (() => {
    const unitInfoTable = new pcrdb.UnitInfoTable();
    const transaction = new pcrdb.Transaction(recvObjData);
    return new pcrdb.VsSetTable(unitInfoTable, transaction);
  })();

  // データファイルが既に存在すれば読み込み、対戦情報テーブルに格納
  if (pcrutil.fileExists(filePath)) {
    const fileData = pcrsvr.readCGI(recvObjData);
    // ファイルデータをファイル保存形式データに変換
    const externalData =
      pcrutil.fileDataToObjectData(fileData, pcrdef.FileType.JSON);
    // ファイル保存形式データを対戦情報テーブルデータに変換し、格納
    const internalData =
      vsSetTable.toInternalData(externalData, pcrdef.FileType.JSON);
    vsSetTable.setDataAndError(internalData, '');
  }

  // クエリが成功した際のログ出力関数
  const queryLoggingOnSuccess = (query) => {
    const baseMsg = pcrmsg.getN(FUNC_NAME, 0);
    pcrsvr.logging(pcrutil.buildMessage(baseMsg, JSON.stringify(query)));
  };
  // クエリが失敗した際のログ出力関数
  const queryLoggingOnFailure = (query) => {
    const baseMsg = pcrmsg.getN(FUNC_NAME, 1);
    pcrsvr.logging(pcrutil.buildMessage(baseMsg, JSON.stringify(query)));
  };
  // コミット
  try {
    vsSetTable.commit(queryLoggingOnSuccess, queryLoggingOnFailure);
  } catch (e) {
    throw pcrsvr.makeHttpError(409, e.message);
  }

  // 対戦情報テーブルデータをファイル保存形式データに変換
  const externalData = vsSetTable.toExternalData(vsSetTable.getAllData());
  // ファイル保存形式データをファイルデータに変換
  const fileData =
    pcrutil.objectDataToFileData(externalData, pcrdef.FileType.JSON);

  // 更新前のファイルが存在すれば、ファイル名に日時を付与してバックアップ
  if (pcrsvr.gSetting.autoBackupData && pcrutil.fileExists(filePath)) {
    const oldFileName =
      pcrutil.makeFileNameWithDate(fileName, pcrdef.FileType.JSON)
    const oldFilePath =
      pcrutil.makeFilePath(pcrsvr.gSetting.backupDir, oldFileName);
    fs.renameSync(filePath, oldFilePath);
  }

  // 書き出し
  fs.writeFileSync(filePath, fileData);
  pcrsvr.logging(pcrmsg.getN(FUNC_NAME, 2));

  // スクリプト処理成功時の戻り値
  // JSON文字列のバイトデータを返却する必要があるため、適当な値を作成し返却
  const dummyJsonStr = JSON.stringify({'result': true});
  const dummyData = new TextEncoder('utf-8').encode(dummyJsonStr);
  return dummyData;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// クライアントに成功結果を返す
pcrsvr.responseOK = function(res, mimeType, resultData) {
  // レスポンスデータのエンコード種別
  // HTML、スクリプト、JSON等のテキストデータは圧縮
  // 画像データは無圧縮
  let contentEncoding = 'identity';
  switch (mimeType) {
  case pcrsvr.MIME_TYPE_MAP['.json']:
  case pcrsvr.MIME_TYPE_MAP['.txt']:
  case pcrsvr.MIME_TYPE_MAP['.html']:
  case pcrsvr.MIME_TYPE_MAP['.css']:
  case pcrsvr.MIME_TYPE_MAP['.js']:
    if (pcrsvr.gRequestHeader.acceptEncodingList !== undefined) {
      const acceptEncodingList = pcrsvr.gRequestHeader.acceptEncodingList;
      if (acceptEncodingList.includes('gzip')) {
        contentEncoding = 'gzip';
      } else if (acceptEncodingList.includes('deflate')) {
        contentEncoding = 'deflate';
      }
    }
    break;
  }

  // キャッシュの有無
  // HTML、スクリプト、JSON等のテキストデータはキャッシュなし
  // 画像データはキャッシュあり
  let cacheControl = undefined;
  switch (mimeType) {
  case pcrsvr.MIME_TYPE_MAP['.json']:
  case pcrsvr.MIME_TYPE_MAP['.txt']:
  case pcrsvr.MIME_TYPE_MAP['.html']:
  case pcrsvr.MIME_TYPE_MAP['.css']:
  case pcrsvr.MIME_TYPE_MAP['.js']:
    cacheControl = 'no-cache';
    break;
  default:
    cacheControl = 'private,max-age=864000'; // 10日間
  }

  // データ圧縮後のデータの返信(無圧縮時も兼用)
  const doResponse = (err, result) => {
    if (err) {
      pcrsvr.responseError(res, err);
      return;
    }
    const responseHeader = {
      'content-type': mimeType,
      'content-encoding': contentEncoding,
      'content-length': Buffer.byteLength(result),
      'cache-control': cacheControl
    };
    res.writeHead(200, responseHeader);
    res.write(result);
    res.end();
  };

  // データを圧縮し返信処理を呼び出す
  if (contentEncoding === 'gzip') {
    const buf = Buffer.from(resultData, 'utf-8');
    zlib.gzip(buf, doResponse);
  } else if (contentEncoding === 'deflate') {
    const buf = Buffer.from(resultData, 'utf-8');
    zlib.deflate(buf, doResponse);
  } else {
    doResponse(undefined, resultData);
  }
};

// クライアントにエラー結果を返す
pcrsvr.responseError = function(res, err) {
  const FUNC_NAME = 'pcrsvr.responseError';

  if (err === undefined || err === null) {
    err = pcrutil.makeError(pcrmsg.get('fatalError'));
  }

  // 例外をレスポンスデータに変換
  let httpResponse = undefined;
  try {
    // 明示的に発生させた例外
    httpResponse = JSON.parse(err.message);
    // 構造チェック
    httpResponse.statusCode.toString();
    httpResponse.message.toString();
  } catch (e) {
    // 想定外の例外
    httpResponse = {statusCode: 500, message: err.toString()};
  }

  // エラー発生時のロギング
  const baseErrMsg = pcrmsg.getN(FUNC_NAME, 0);
  pcrsvr.logging(pcrutil.buildMessage(baseErrMsg, JSON.stringify(httpResponse)));
  pcrsvr.logging(err.stack);

  // エラーメッセージの返信
  const responseHeader = {
    'content-type': pcrsvr.MIME_TYPE_MAP['.json'],
    'cache-control': 'no-cache'
  };
  res.writeHead(httpResponse.statusCode, responseHeader);
  res.write(JSON.stringify(httpResponse) + '\n');
  res.end();
};

// クライアントへのレスポンス処理(スクリプト)
pcrsvr.responseScript = function(res, urlPathName, recvObjData) {
  const FUNC_NAME = 'pcrsvr.responseScript';

  try {
    pcrsvr.logging(pcrmsg.getN(FUNC_NAME, 0));

    // ログイン認証
    if (!pcrsvr.authenticateAuthority(recvObjData.userName, recvObjData.dbName)) {
      throw pcrsvr.makeHttpError(403, pcrmsg.getN(FUNC_NAME, 1));
    }

    // URLに対応したスクリプトを実行
    const cgiFuncName = pcrsvr.CGI_MAP[urlPathName];
    const resultData = pcrsvr[cgiFuncName](recvObjData);

    const mimeType = pcrsvr.MIME_TYPE_MAP['.json'];
    pcrsvr.responseOK(res, mimeType, resultData);
  } catch (e) {
    pcrsvr.responseError(res, e);
  }
};

// クライアントへのレスポンス処理(リソース)
pcrsvr.responseResource = function(res, urlPathName) {
  //if (urlPathName === '/') urlPathName = '/pcrnote.html';
  const filePath = pcrutil.makeFilePath(pcrsvr.gSetting.wwwDir, urlPathName);
  const mimeType = pcrsvr.MIME_TYPE_MAP[path.extname(filePath)];

  try {
    // ファイルの存在チェック
    if (!pcrutil.fileExists(filePath)) {
      throw pcrsvr.makeHttpError(404, urlPathName)
    }
    // 対応しているMIMEタイプかチェック
    if (mimeType === undefined) {
      throw pcrsvr.makeHttpError(404, urlPathName)
    }
    // 利用可能リソースかチェック
    if (!pcrsvr.isAvailableResource(urlPathName)) {
      throw pcrsvr.makeHttpError(404, urlPathName)
    }
  } catch (e) {
    pcrsvr.responseError(res, e);
    return;
  }

  // ファイルの読み込み
  fs.readFile(filePath, (err, resultData) => {
    try {
      if (err) throw err;
      pcrsvr.responseOK(res, mimeType, resultData);
    } catch (e) {
      pcrsvr.responseError(res, e);
    }
  });
};

// クライアントへのレスポンス処理
pcrsvr.responseMain = function(res, urlPathName, recvObjData) {
  // スクリプトを実行
  if (Object.keys(pcrsvr.CGI_MAP).indexOf(urlPathName) !== -1) {
    pcrsvr.responseScript(res, urlPathName, recvObjData);
  // リソースファイルの読み込み
  } else {
    pcrsvr.responseResource(res, urlPathName);
  }
};

// クライアントからのリクエストの解析処理(GET)
pcrsvr.requestGet = function(req, res, parsedURL) {
  const urlPathName = parsedURL.pathname;
  const recvObjData = parsedURL.query;
  // クライアントへのレスポンス処理へ
  pcrsvr.responseMain(res, urlPathName, recvObjData);
};

// クライアントからのリクエストの解析処理(POST)
pcrsvr.requestPost = function(req, res, parsedURL) {
  const FUNC_NAME = 'pcrsvr.requestPost';

  let recvData = '';

  // データの受信(約64KB単位で繰り返し)
  req.on('data', (chunk) => {
    recvData += chunk;
    if (pcrsvr.gSetting.receivedDataSizeMax < recvData.length) {
      pcrsvr.logging(pcrmsg.getN(FUNC_NAME, 0));
      recvData = '';
      const err = pcrsvr.makeHttpError(413, pcrmsg.getN(FUNC_NAME, 1));
      pcrsvr.responseError(res, err);
      req.destroy();
    }
  });

  // 受信したデータの解析と返信処理
  req.on('end', () => {
    // データの受信を停止した場合、以降の処理を停止
    if (recvData === '') return;

    let recvObjData = undefined;
    try {
      recvObjData = JSON.parse(recvData);
    } catch (e) {
      const err = pcrsvr.makeHttpError(400, pcrmsg.getN(FUNC_NAME, 2), e.message);
      pcrsvr.responseError(res, err);
      return;
    }

    // クライアントへのレスポンス処理へ
    const urlPathName = parsedURL.pathname;
    pcrsvr.responseMain(res, urlPathName, recvObjData);
  });
};

// クライアントからのリクエストの解析処理
pcrsvr.requestMain = function(req, res) {
  const FUNC_NAME = 'pcrsvr.requestMain';

  // リクエストヘッダの解析
  try {
    pcrsvr.gRequestHeader = new pcrsvr.RequestHeader(req);
  } catch (e) {
    const err = pcrsvr.makeHttpError(400, pcrmsg.getN(FUNC_NAME, 0), e.message);
    pcrsvr.responseError(res, err);
    return;
  }

  // URLの解析
  let parsedURL = undefined;
  try {
    parsedURL = url.parse(req.url, true);
  } catch (e) {
    const err = pcrsvr.makeHttpError(400, pcrmsg.getN(FUNC_NAME, 1), e.message);
    pcrsvr.responseError(res, err);
    return;
  }

  switch (req.method) {
  case 'GET':
    pcrsvr.requestGet(req, res, parsedURL);
    break;
  case 'POST':
    pcrsvr.requestPost(req, res, parsedURL);
    break;
  default:
    const err = pcrsvr.makeHttpError(400, pcrmsg.getN(FUNC_NAME, 2));
    pcrsvr.responseError(res, err);
  }
};

// サーバー起動
pcrsvr.launchServer = function() {
  // SSL非使用
  if (!pcrsvr.gSetting.useSSL) {
    const server = http.createServer();
    server.on('request', (req, res) => pcrsvr.requestMain(req, res));
    server.listen(pcrsvr.gSetting.tcpPortNum);
  // SSL使用
  } else {
    const options = {
      key: fs.readFileSync(pcrsvr.gSetting.sslKeyPath),
      cert: fs.readFileSync(pcrsvr.gSetting.sslCertPath)
    };
    const server = https.createServer(options);
    server.on('request', (req, res) => pcrsvr.requestMain(req, res));
    server.listen(pcrsvr.gSetting.tcpPortNum);
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// グローバル変数
// 設定ファイル
pcrsvr.gSetting = undefined;
// リクエストヘッダ
pcrsvr.gRequestHeader = undefined;

// 設定ファイルの読み込み、チェック
pcrsvr.gSetting = new pcrsvr.Setting();

// サーバー起動
pcrsvr.launchServer();
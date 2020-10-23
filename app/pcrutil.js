// ユーティリティ

'use strict';

var exports = exports || undefined;
var require = require || function() {};

const fs = require('fs');
const path = require('path');

var pcrdef = pcrdef || require('./pcrdef');
var pcrmsg = pcrmsg || require('./pcrmsg');

var pcrutil = exports || pcrutil || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// ユーティリティの初期化処理
pcrutil.init = function() {
  pcrutil.addEventListener();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// オブジェクトかどうか判断
pcrutil.isObject = function(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
};
// 配列かどうか判断
pcrutil.isArray = function(val) { return Array.isArray(val); };
// 文字列かどうか判断
pcrutil.isString = function(val) { return typeof val === 'string'; };
// 整数かどうか判断
pcrutil.isInteger = function(val) { return Number.isInteger(val); };
// 整数、もしくは整数に変換出来るか判断(10進数のみ)
pcrutil.asInteger = function(val) { return /^[+-]?\d+$/.test(val); };
// 数値かどうか判断
pcrutil.isNumber = function(val) {
  return typeof val === 'number' && isFinite(val);
}
// 数値、もしくは数値に変換出来るか判断(10進数のみ)
pcrutil.asNumber = function(val) {
  return /^[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(val);
};
// 真偽値かどうか判断
pcrutil.isBoolean = function(val) { return typeof val === 'boolean'; };
// 関数かどうか判断
pcrutil.isFunction = function(val) { return typeof val === 'function'; };
// 日時かどうか判断
pcrutil.isDate = function(val) {
  try {
    new pcrutil.DateFormat(pcrdef.DATE_FORMAT).format(val);
  } catch (e) {
    return false;
  }
  return val.toString() !== new Date(undefined).toString();
};
// 日時に変換出来るか判断
pcrutil.asDate = function(val, fmt) {
  const result = new pcrutil.DateFormat(fmt).parse(val);
  return result.toString() !== new Date(undefined).toString();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// オブジェクトのプロパティの値を取得
// 配列から指定位置の値を取得
// ネストされているプロパティも取得可
// 取得出来ない場合、undefinedもしくは代替値を返却
pcrutil.getProperty = function(obj, key, altVal) {
  if (!pcrutil.isArray(obj) && !pcrutil.isObject(obj)) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'obj');
  }

  let keyList = undefined;
  if (pcrutil.isString(key)) {
    keyList = key.split('.');
  } else if (pcrutil.isInteger(key)) {
    keyList = [key];
  } else if (pcrutil.isArray(key)) {
    keyList = key.slice();
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'key');
  }

  let propVal = obj;
  while (keyList.length !== 0) {
    propVal = propVal[keyList.shift()];
    if (propVal === undefined) break;
  }
  return propVal !== undefined ? propVal : altVal;
};

// 文字列の置換部分を引数に置き換えてメッセージを構築
pcrutil.buildMessage = function(baseMsg, ...rest) {
  if (!pcrutil.isString(baseMsg)) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'baseMsg');
  }
  const msg = baseMsg.replace(/\${([0-9]+?)}/g, (whole, numPart) => {
    const index = Number(numPart) - 1;
    return rest[index] !== undefined ? rest[index] : whole;
  });
  return msg;
};

// 例外用エラーオブジェクトを作成
pcrutil.makeError = function() {
  const errMsg = pcrutil.buildMessage.apply(undefined, arguments);
  return new Error(errMsg);
};

// from～toの範囲の数値を順次生成
pcrutil.generateRange = function*(from, to) {
  let n = from;
  while (n !== to) {
    yield n;
    n < to ? ++n : --n;
  }
  yield n;
}

// 文字の配列に変換(サロゲートペア対応)
pcrutil.toCharArray = function(str) {
  return str.match(/./gsu) || [];
//  return str.match(/[\ud800-\udbff][\udc00-\udfff]|[^\ud800-\udfff]/gs) || [];
}

// 文字列長を取得(サロゲートペア対応)
pcrutil.strLength = function(str) {
  return pcrutil.toCharArray(str).length;
}

// 文字列の一部分を抽出(サロゲートペア対応)
pcrutil.strSlice = function(str, start, end) {
  return pcrutil.toCharArray(str).slice(start, end).join('');
}

// 文字列内のハッシュタグを全て抽出(サロゲートペア対応)
pcrutil.extractHashtagList = function(text) {
  // 文字列を改行、スペースで分割し、単語一覧に変換
  const wordList = text.split(/\s|\r?\n/);
  // 単語一覧からハッシュタグのみ抽出(文字数は下限、上限有り)
  const hashtagList = wordList.filter((elem) => {
    return (
      elem[0] === '#' &&
      pcrdef.HASHTAG_LENGTH.MIN <= pcrutil.strLength(elem) &&
      pcrutil.strLength(elem) <= pcrdef.HASHTAG_LENGTH.MAX
    );
  });
  return hashtagList;
};

// 日時の解析、整形クラス
pcrutil.DateFormat = function(fmt) {
  this.fmt = fmt;
  Object.seal(this);
};
pcrutil.DateFormat.prototype = {
  parse: undefined,
  format: undefined
};
Object.seal(pcrutil.DateFormat.prototype);

// 日時文字列を解析
pcrutil.DateFormat.prototype.parse = function(dtStr) {
  // 各日時解析用定義
  const fmtPartDefList = [
    {fmt: 'yyyy', min: 1970, max: 9999},
    {fmt: 'mm', min: 1, max: 12},
    {fmt: 'dd', min: 1, max: 31},
    {fmt: 'hh', min: 0, max: 23},
    {fmt: 'mi', min: 0, max: 59},
    {fmt: 'ss', min: 0, max: 59},
    {fmt: 'xxx', min: 0, max: 999}
  ];

  let restOfDtStr = dtStr;
  let restOfFmt = this.fmt;
  let result = {};
  // 日時文字列または日時書式、どちらかの解析が完了したら正常終了
  while (restOfDtStr.length !== 0 && restOfFmt.length !== 0) {
    // 次に解析する日時書式がどれか調べ、解析用定義を取得
    const fmtPartDef = fmtPartDefList.find((elem) => {
      const headFmt = restOfFmt.slice(0, elem.fmt.length);
      return headFmt === elem.fmt
    });
    // 解析対象書式でない場合、1文字進める
    // 解析対象外書式の部分は不一致でも無視
    if (fmtPartDef === undefined) {
      restOfDtStr = restOfDtStr.slice(1);
      restOfFmt = restOfFmt.slice(1);
      continue;
    }
    // 日時文字列から先頭の数値部分を取得(数値でない場合エラー)
    const matchResult = restOfDtStr.match(/^\d+/);
    if (matchResult === null || isNaN(Number(matchResult[0]))) {
      result = undefined;
      break;
    }
    const partStr = matchResult[0];
    const partNum = Number(partStr);
    // 日時が範囲内の値か判断(範囲内でない場合エラー)
    if (partNum < fmtPartDef.min || fmtPartDef.max < partNum) {
      result = undefined;
      break;
    }
    // 取得した数値を該当の日時に格納
    result[fmtPartDef.fmt] = partNum;
    // 次の解析へ
    restOfDtStr = restOfDtStr.slice(partStr.length);
    restOfFmt = restOfFmt.slice(fmtPartDef.fmt.length);
  }

  // 解析途中でエラーが発生するか年月日が取得できなかった場合エラーを返却
  if (
    result === undefined ||
    result.yyyy === undefined ||
    result.mm === undefined ||
    result.dd === undefined
  ) {
    return new Date(undefined);
  }

  // 時分秒ミリ秒は取得出来なければ0を設定
  if (result.hh === undefined) result.hh = 0;
  if (result.mi === undefined) result.mi = 0;
  if (result.ss === undefined) result.ss = 0;
  if (result.xxx === undefined) result.xxx = 0;

  return new Date(
    result.yyyy, result.mm - 1, result.dd,
    result.hh, result.mi, result.ss, result.xxx
  );
};

// 日時の書式化
pcrutil.DateFormat.prototype.format = function(dt) {
  const yyyy = String(dt.getFullYear()).padStart(4, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  const hh = String(dt.getHours()).padStart(2, '0');
  const mi = String(dt.getMinutes()).padStart(2, '0');
  const ss = String(dt.getSeconds()).padStart(2, '0');
  const xxx = String(dt.getMilliseconds()).padStart(3, '0');
  return this.fmt
    .replace('yyyy', yyyy)
    .replace('mm', mm)
    .replace('dd', dd)
    .replace('hh', hh)
    .replace('mi', mi)
    .replace('ss', ss)
    .replace('xxx', xxx);
};

// 現在日時を付与したファイル名を作成
pcrutil.makeFileNameWithDate = function(baseFileName, fileType) {
  if (baseFileName === undefined || baseFileName === '') {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'baseFileName');
  }

  let fileName = baseFileName;

  // 元となるファイル名に拡張子が付いている場合、除去
  const lastDotPos = fileName.lastIndexOf('.');
  if (lastDotPos !== -1 && lastDotPos !== 0) {
    fileName = fileName.slice(0, lastDotPos);
  }

  // 現在日時
  const formatter = new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_FILE_NAME);
  const nowStr = formatter.format(new Date());
  // 元となるファイル名が〇〇＋日時形式の場合
  // 日時部分を置き換え(日時の前にアンダースコアがなければ付加)
  if (/_?[\d-]+$/.test(fileName)) {
    fileName = fileName.replace(
      /_?[\d-]+$/, '_' + nowStr
    );
  // 元となるファイル名に日時が付いていない場合
  // 日時を付加(日時の前にアンダースコアがなければ付加)
  } else {
    fileName = fileName.replace(/_*$/, '_' + nowStr);
  }

  // ファイル種別に応じて拡張子を付加
  if (fileType === pcrdef.FileType.JSON) {
    fileName += '.json';
  } else if (fileType === pcrdef.FileType.CSV) {
    fileName += '.csv'
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'fileType');
  }

  return fileName;
};

// ディープコピー
pcrutil.deepCopy = function(src, base = undefined) {
  const FUNC_NAME = 'pcrutil.deepCopy';

  if (base === undefined) {
    if (pcrutil.isArray(src)) {
      base = [];
    } else if (pcrutil.isObject(src)) {
      base = {};
    } else {
      throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
    }
  }

  for (const key of Object.keys(src)) {
    if (key === '__proto__') {
      continue;
    }

    const val = src[key];
    if (val === undefined) {
      //
    } else if (pcrutil.isArray(val)) {
      const childBase = base[key] || [];
      base[key] = pcrutil.deepCopy(val, childBase);
    } else if (pcrutil.isObject(val)) {
      const childBase = base[key] || {};
      base[key] = pcrutil.deepCopy(val, childBase);
    } else {
      base[key] = val;
    }
  }

  return base;
};

// 左辺オブジェクト全部と右辺オブジェクトの指定プロパティの複製を作成し取得
pcrutil.assignPartially = function(lhs, rhs, keyList) {
  const result = pcrutil.deepCopy(lhs);
  for (const key of keyList) {
    if (pcrutil.isObject(rhs[key]) || pcrutil.isArray(rhs[key])) {
      result[key] = pcrutil.deepCopy(rhs[key]);
    } else {
      result[key] = rhs[key];
    }
  }
  return result;
};

// ファイルシステムオブジェクトの存在チェック
pcrutil.fileSystemObjectExists = function(fsoPath, checkFunc) {
  if (!pcrutil.isString(fsoPath)) {
    return false;
  }
  try {
    const stats = fs.statSync(fsoPath);
    return stats[checkFunc]();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
};
// ファイルの存在チェック
pcrutil.fileExists = function(filePath) {
  return pcrutil.fileSystemObjectExists(filePath, 'isFile');
};
// ディレクトリの存在チェック
pcrutil.directoryExists = function(dirPath) {
  return pcrutil.fileSystemObjectExists(dirPath, 'isDirectory');
};

// ファイルパスを作成
pcrutil.makeFilePath = function(...args) {
  const filePath = args.reduce((accum, arg) => {
    accum = path.join(accum, decodeURI(arg));
    return accum;
  }, '');
  return filePath;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// ファイルデータにBOMが付いているか判断
pcrutil.hasBOM = function(fileData) {
  const fileHead = new Uint8Array(fileData.slice(0, 3));
  return JSON.stringify(fileHead) === JSON.stringify(pcrdef.BOM);
};
// ファイルデータからBOMを除去
pcrutil.stripBOM = function(fileData) {
  return fileData.slice(pcrdef.BOM.length);
};

// ファイルデータ(バイトデータ、UTF-8、UTF-8N)をオブジェクトデータに変換
pcrutil.fileDataToObjectData = function(fileData, fileType) {
  const FUNC_NAME = 'pcrutil.fileDataToObjectData';

  let objData = undefined;

  // BOMが付いていたら取り除く
  if (pcrutil.hasBOM(fileData)) {
    fileData = pcrutil.stripBOM(fileData);
  }

  // 解析
  if (fileType === pcrdef.FileType.JSON) {
    try {
      objData = JSON.parse(fileData);
    } catch (e) {
      throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0), e.message);
    }
  } else if (fileType === pcrdef.FileType.CSV) {
    try {
      const flatObjData = pcrutil.csvDataToFlatObjectData(fileData);
      objData = pcrutil.flatObjectDataToObjectData(flatObjData, '-');
    } catch (e) {
      throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1), e.message);
    }
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'fileType');
  }

  return objData;
};

// オブジェクトデータをファイルデータ(バイトデータ、UTF-8)に変換
pcrutil.objectDataToFileData = function(objData, fileType) {
  // オブジェクトデータをJSON文字列またはCSV文字列に変換
  let strData = undefined;
  if (fileType === pcrdef.FileType.JSON) {
    strData = JSON.stringify(objData);
  } else if (fileType === pcrdef.FileType.CSV) {
    const flatObjData = pcrutil.objectDataToFlatObjectData(objData, '-');
    strData = pcrutil.flatObjectDataToCsvData(flatObjData);
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'fileType');
  }

  // JSON文字列またはCSV文字列をファイルデータに変換
  const fileData = new TextEncoder('utf-8').encode(strData);

  // BOMを付加
  let fileDataWithBOM = undefined;
  {
    const bomLen = pcrdef.BOM.length;
    const dataLen = fileData.length;
    fileDataWithBOM = new Uint8Array(bomLen + dataLen);
    for (let i = 0; i < bomLen; ++i) {
      fileDataWithBOM[i] = pcrdef.BOM[i];
    }
    for (let i = 0; i < dataLen; ++i) {
      fileDataWithBOM[i + bomLen] = fileData[i];
    }
  }

  return fileDataWithBOM;
};

// ファイルデータをBlobデータに変換
pcrutil.fileDataToBlobData = function(fileData, fileType) {
  let blobData = undefined;
  if (fileType === pcrdef.FileType.JSON) {
    blobData = new Blob(
      [fileData],
      {'type': 'application/json'}
    );
  } else if (fileType === pcrdef.FileType.CSV) {
    blobData = new Blob(
      [fileData],
      {'type': 'text/csv'}
    );
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'fileType');
  }

  return blobData;
};

// 平坦なオブジェクトデータの構造
// const flatObjData = [
//   {
//     'offenseParty-0': 'unit1',
//     'offenseParty-1': 'unit2',
//     ...
//     'defenseParty-0': 'unit3',
//     'defenseParty-1': 'unit4',
//     ...
//     'rating-good': N,
//     'rating-bad': N,
//     'comment': '～',
//     'createUser': 'user1',
//     'createDate': 'yyyy-mm-dd hh:mi:ss',
//     'updateUser': '',
//     'updateDate': ''
//   },
//   {
//     ...
//   },
//   ....
// ]

// CSVデータ(ファイルデータ、バイトデータ)から平坦なオブジェクトデータに変換
// CSVデータから取得した各要素は全て文字列扱い(判別方法がないため)
pcrutil.csvDataToFlatObjectData = function(csvFileData) {
  const FUNC_NAME = 'pcrutil.csvDataToFlatObjectData';

  // CSVデータを2次元配列に変換
  // ファイルデータ→文字列データ→2次元配列と2段階分処理
  const csvMatrix = $.csv.toArrays(csvFileData);
  if (csvMatrix.length < 2) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
  }

  // CSVデータの1行目はオブジェクトの鍵部
  const objKeys = csvMatrix.shift();
  // CSVデータの2行目以降はオブジェクトの値部
  const objData = [];
  for (const csvRec of csvMatrix) {
    const objRec = csvRec.reduce((accum, elem, index) => {
      accum[objKeys[index]] = elem;
      return accum;
    }, {});
    objData.push(objRec);
  }

  return objData;
};

// 平坦なオブジェクトデータから階層化されたオブジェクトデータに変換
pcrutil.flatObjectDataToObjectData = function(flatObjData, sep) {
  const FUNC_NAME = 'pcrutil.flatObjectDataToObjectData';

  // オブジェクトを1要素ずつ変換
  const convert = (objRec, chainKeys, assignVal) => {
    // 鍵部は全部文字列型のはずだが念のため
    if (chainKeys.length !== 0 && !pcrutil.isString(chainKeys[0])) {
      throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0), chainKeys[0]);
    }

    // 鍵部の残りがない場合、値を格納
    // 文字列、数値、真偽値、null
    if (chainKeys.length === 0) {
      return assignVal;
    // 鍵部が残っている場合、現階層を構築し、更に下の階層へ
    } else {
      // 配列(鍵部が整数値に変換出来る場合)
      if (pcrutil.asInteger(chainKeys[0])) {
        objRec = objRec || [];
        const index = Number(chainKeys[0]);
        objRec[index] = convert(objRec[index], chainKeys.slice(1), assignVal);
        return objRec;
      // オブジェクト(鍵部が整数値に変換出来ない場合)
      } else {
        objRec = objRec || {};
        objRec[chainKeys[0]] = convert(
          objRec[chainKeys[0]], chainKeys.slice(1), assignVal
        );
        return objRec;
      }
    }
  }

  const objData = [];
  for (const flatObjRec of flatObjData) {
    // 鍵部を取り出し2次元配列化
    // [["offenseParty", "1"], ["offenseParty", "2"], ... ["rating", "good"], ...]
    let chainKeysList = Object.keys(flatObjRec);
    if (chainKeysList.length === 0) {
      throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1));
    }
    chainKeysList = chainKeysList.map((chainKeys) => chainKeys.split(sep));

    // オブジェクトを1要素ずつ変換
    const objRec = chainKeysList.reduce((accum, chainKeys) => {
      return convert(accum, chainKeys, flatObjRec[chainKeys.join(sep)]);
    }, {});
    objData.push(objRec);
  }

  return objData;
};

// 階層化されたオブジェクトデータから平坦なオブジェクトデータに変換
pcrutil.objectDataToFlatObjectData = function(objData, sep) {
  const FUNC_NAME = 'pcrutil.objectDataToFlatObjectData';

  // 平坦なオブジェクトの鍵部を構築し、完成した所で値を代入
  const convert = (objRec, flatObjRec = {}, chainKeys = []) => {
    // 未定義値
    if (objRec === undefined) {
      //
    // 配列、オブジェクト
    } else if (pcrutil.isArray(objRec) || pcrutil.isObject(objRec)) {
      for (const key of Object.keys(objRec)) {
        const nextChainKeys = chainKeys.slice();
        nextChainKeys.push(key);
        convert(objRec[key], flatObjRec, nextChainKeys);
      }
    // 文字列、数値、真偽値、null
    } else {
      if (chainKeys.length === 0) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
      }
      flatObjRec[chainKeys.join(sep)] = objRec;
    }
    return flatObjRec;
  }

  if (!pcrutil.isArray(objData)) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 1));
  }

  const flatObjData = objData.reduce((accum, objRec) => {
    const flatObjRec = convert(objRec);
    accum.push(flatObjRec);
    return accum;
  }, []);

  return flatObjData;
};

// 平坦なオブジェクトデータからCSVデータ(文字列データ)に変換
pcrutil.flatObjectDataToCsvData = function(objData) {
  if (objData.length < 1) return [];

  const csvMatrix = [];

  // オブジェクトの鍵部
  const objKeys = Object.keys(objData[0]);
  {
    const csvRec = objKeys.map((elem) => {
      // 「"」を「""」にエスケープ
      if (pcrutil.isString(elem)) {
        elem = elem.replace(/"/g, '""');
      }
      // 特殊文字が含まれているため、「""」で囲い
      if (/[,"\r\n]/.test(elem)) {
        elem = '"' + elem + '"';
      }
      return elem;
    });
    csvMatrix.push(csvRec);
  }

  // オブジェクトの値部
  for (const objRec of objData) {
    // 鍵部と同じ順番の配列で取得
    const objVals = objKeys.map((key) => objRec[key]);
    const csvRec = objVals.map((elem) => {
      // 「"」を「""」にエスケープ
      if (pcrutil.isString(elem)) {
        elem = elem.replace(/"/g, '""');
      }
      // 特殊文字が含まれているため、「""」で囲い
      if (/[,"\r\n]/.test(elem)) {
        elem = '"' + elem + '"';
      }
      return elem;
    });
    csvMatrix.push(csvRec);
  }

  // 2次元配列をCSVデータ(文字列データ)に変換
  const csvData = csvMatrix.map((csvRec) => csvRec.join(',')).join('\n');

  return csvData;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// ポップアップの開閉
pcrutil.popupConfirmEvent_ = undefined;
pcrutil.popup = function(msg, opt_processOnConsent, opt_processOnRejected) {
  // ポップアップ
  if (opt_processOnConsent === undefined) {
    $('#popupMessage').html(msg.replace(/\n/g, '<br>'));
    $('#popupWindow').show();
    $('#popupConfirmWindow').hide();

    pcrutil.popupConfirmEvent_ = undefined;
  // 確認付きポップアップ
  } else {
    $('#popupConfirmMessage').html(msg.replace(/\n/g, '<br>'));
    $('#popupWindow').hide();
    $('#popupConfirmWindow').show();

    // ボタン押下時イベントを設定
    pcrutil.popupConfirmEvent_ = (pressYes, pressNo) => {
      if (pressYes) {
        opt_processOnConsent();
      } else if (opt_processOnRejected !== undefined && pressNo) {
        opt_processOnRejected();
      }
    }
  }
  $('#popup').show();
};
pcrutil.popupOff = function(pressYes, pressNo) {
  $('.popup').hide();

  if (pcrutil.popupConfirmEvent_ !== undefined) {
    // 後続処理からの連続ポップアップに備え、ボタン押下時イベントを初期化
    const tempEvent = pcrutil.popupConfirmEvent_;
    pcrutil.popupConfirmEvent_ = undefined;
    tempEvent(pressYes, pressNo);
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

pcrutil.addEventListener = function() {
  // リンクを無効化
  $('a.is-disabled-link').on('click', function() {
    return false;
  });

  // ポップアップ用イベントハンドラ
  // ボタン以外を押してポップアップを閉じる
  $('#popup').on('click', function() {
    pcrutil.popupOff(false, false);
  });
  // 「はい」を押してポップアップを閉じる
  $('#popupConfirmYes').on('click', function(e) {
    e.stopPropagation();
    pcrutil.popupOff(true, false);
  });
  // 「いいえ」を押してポップアップを閉じる
  $('#popupConfirmNo').on('click', function(e) {
    e.stopPropagation();
    pcrutil.popupOff(false, true);
  });
};

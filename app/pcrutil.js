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
    new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_DATA).format(val);
  } catch (e) {
    return false;
  }
  return true;
};
// 日時、もしくは日時に変換出来るか判断
pcrutil.asDate = function(val, fmt) {
  if (pcrutil.isString(val)) {
    const result = new pcrutil.DateFormat(fmt).parse(val);
    return result !== undefined;
  } else if (pcrutil.isDate(val)) {
    return true;
  } else {
    return false;
  }
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
  if (!pcrutil.isString(fmt)) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'fmt');
  }
  this.customFormat = fmt;
  Object.seal(this);
};
pcrutil.DateFormat.prototype = {
  parse: undefined,
  formatImpl: undefined,
  format: undefined,
  formatUTC: undefined
};
Object.seal(pcrutil.DateFormat.prototype);

// 日時文字列を解析
pcrutil.DateFormat.prototype.parse = function(dtStr) {
  if (!pcrutil.isString(dtStr)) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'dtStr');
  }

  // 各日時部を整数値に変換(範囲チェックも行う)
  const convertDigits = (dtSt, dtConvDef) => {
    const num = Number(dtSt[dtConvDef.format]);
    if (!pcrutil.isInteger(num)) {
      return false;
    }
    if (dtConvDef.min !== undefined && num < dtConvDef.min) {
      return false;
    }
    if (dtConvDef.max !== undefined && dtConvDef.max < num) {
      return false;
    }
    dtSt[dtConvDef.format] = num;
    return true;
  };

  // 月をアルファベット表記から数値に変換
  const convertMonth = (dtSt) => {
    const monthList = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
    ];
    const monthNum = monthList.indexOf(dtSt.MMM.toLowerCase());
    if (monthNum !== -1) dtSt.MM = monthNum + 1;
    return monthNum !== undefined;
  };

  // 日時変換用定義
  const dtConvDefList = [
    {format: 'yyyy', pattern: /^\d{4}/, convert: convertDigits, min: 1970},
    {format: 'MMM', pattern: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i, convert: convertMonth},
    {format: 'MM', pattern: /^\d{1,2}/, convert: convertDigits, min: 1, max: 12},
    {format: 'dd', pattern: /^\d{1,2}/, convert: convertDigits, min: 1, max: 31},
    {format: 'EEE', pattern: /^(sun|mon|tue|wed|thu|fri|sat)/i},
    {format: 'hh', pattern: /^\d{1,2}/, convert: convertDigits, min: 0, max: 23},
    {format: 'mm', pattern: /^\d{1,2}/, convert: convertDigits, min: 0, max: 59},
    {format: 'ss', pattern: /^\d{1,2}/, convert: convertDigits, min: 0, max: 59},
    {format: 'SSS', pattern: /^\d{1,3}/, convert: convertDigits},
    {format: 'z', pattern: /^((GMT)?[+-]\d{2}:\d{2}|GMT)/}
  ];

  // タイムゾーンを使って日時を調整
  const applyTimeZoon = (orgDtSt) => {
    const dtSt = pcrutil.deepCopy(orgDtSt);
    if (dtSt.z === undefined) {
      return dtSt;
    } else if (dtSt.z === 'GMT') {
      dtSt.z = 'UTC';
      return dtSt;
    }
    const parsedTZ = dtSt.z.match(/^(?:GMT)?([+-])(\d{2}):(\d{2})$/);
    if (parsedTZ === null) {
      return undefined;
    }
    if (parsedTZ[1] === '-') {
      dtSt.hh += Number(parsedTZ[2]);
      dtSt.mm += Number(parsedTZ[3]);
    } else {
      dtSt.hh -= Number(parsedTZ[2]);
      dtSt.mm -= Number(parsedTZ[3]);
    }
    dtSt.z = 'UTC';
    return dtSt;
  };

  let restOfDtStr = dtStr;
  let restOfFmt = this.customFormat;
  const parsedDtSt = {};
  // 日時文字列または日時書式、どちらかの解析が完了したら正常終了
  while (restOfDtStr.length !== 0 && restOfFmt.length !== 0) {
    // 次に解析する部分の日時変換用定義を取得
    const dtConvDef = dtConvDefList.find((elem) => {
      return restOfFmt.startsWith(elem.format);
    });

    // 解析対象書式でない場合、1文字進める
    // 解析対象外書式の部分は不一致でも無視
    if (dtConvDef === undefined) {
      restOfDtStr = restOfDtStr.slice(1);
      restOfFmt = restOfFmt.slice(1);
      continue;
    }

    // 日時文字列から日時書式に合致する部分を取得
    const matchResult = restOfDtStr.match(dtConvDef.pattern);
    if (matchResult === null) {
      return undefined;
    }

    // 解析結果を格納
    parsedDtSt[dtConvDef.format] = matchResult[0];

    // 変換が必要であれば、変換して再格納
    if (dtConvDef.convert !== undefined) {
      if (!dtConvDef.convert(parsedDtSt, dtConvDef)) {
        return undefined;
      }
    }

    // 次の解析へ
    restOfDtStr = restOfDtStr.slice(matchResult[0].length);
    restOfFmt = restOfFmt.slice(dtConvDef.format.length);
  }

  // 年月日が取得できなかった場合、エラー
  if (
    parsedDtSt.yyyy === undefined ||
    parsedDtSt.MM === undefined ||
    parsedDtSt.dd === undefined
  ) {
    return undefined;
  }

  // 時分秒ミリ秒は取得出来なければ0を設定
  if (parsedDtSt.hh === undefined) parsedDtSt.hh = 0;
  if (parsedDtSt.mm === undefined) parsedDtSt.mm = 0;
  if (parsedDtSt.ss === undefined) parsedDtSt.ss = 0;
  if (parsedDtSt.SSS === undefined) parsedDtSt.SSS = 0;

  // タイムゾーンを使って日時を調整
  const adjustDtSt = applyTimeZoon(parsedDtSt);

  if (adjustDtSt.z === 'UTC') {
    return new Date(Date.UTC(
      adjustDtSt.yyyy, adjustDtSt.MM - 1, adjustDtSt.dd,
      adjustDtSt.hh, adjustDtSt.mm, adjustDtSt.ss, adjustDtSt.SSS
    ));
  } else {
    return new Date(
      adjustDtSt.yyyy, adjustDtSt.MM - 1, adjustDtSt.dd,
      adjustDtSt.hh, adjustDtSt.mm, adjustDtSt.ss, adjustDtSt.SSS
    );
  }
};

// 日時の書式化
pcrutil.DateFormat.prototype.formatImpl = function(dt, isLocale) {
  if (dt === undefined) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'dt');
  }
  if (dt.toString() === new Date(undefined).toString()) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'dt');
  }

  // 月を数値からアルファベット表記に変換
  const convertMonth = (monthNum) => {
    const monthList = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return monthList[monthNum];
  };

  // 曜日を数値からアルファベット表記に変換
  const convertDOW = (dayNum) => {
    const dayList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayList[dayNum];
  }

  // 日時変換用定義
  const UTC = isLocale ? '' : 'UTC';
  const dtConvDefList = [
    {format: 'yyyy', replace: String(dt[`get${UTC}FullYear`]()).padStart(4, '0')},
    {format: 'yy', replace: String(dt[`get${UTC}FullYear`]()).padStart(4, '0').slice(2)},
    {format: 'MMM', replace: convertMonth(dt[`get${UTC}Month`]())},
    {format: 'MM', replace: String(dt[`get${UTC}Month`]() + 1).padStart(2, '0')},
    {format: 'dd', replace: String(dt[`get${UTC}Date`]()).padStart(2, '0')},
    {format: 'EEE', replace: convertDOW(dt[`get${UTC}Day`]())},
    {format: 'hh', replace: String(dt[`get${UTC}Hours`]()).padStart(2, '0')},
    {format: 'mm', replace: String(dt[`get${UTC}Minutes`]()).padStart(2, '0')},
    {format: 'ss', replace: String(dt[`get${UTC}Seconds`]()).padStart(2, '0')},
    {format: 'SSS', replace: String(dt[`get${UTC}Milliseconds`]()).padStart(3, '0')}
  ];

  // 書式部を日時に変換
  let dtStr = '';
  let restOfFmt = this.customFormat;
  while (restOfFmt.length !== 0) {
    // 次に変換する部分の日時変換用定義を取得
    const dtConvDef = dtConvDefList.find((elem) => {
      return restOfFmt.startsWith(elem.format);
    });

    // 解析対象書式でない場合、1文字そのまま複製
    if (dtConvDef === undefined) {
      dtStr += restOfFmt.charAt(0);
      restOfFmt = restOfFmt.slice(1);
      continue;
    }

    // 解析対象書式の場合、該当の日時に変換
    dtStr += dtConvDef.replace;
    restOfFmt = restOfFmt.slice(dtConvDef.replace.length);
  }

  return dtStr;
};
pcrutil.DateFormat.prototype.format = function(dt) {
  return this.formatImpl(dt, true);
};
pcrutil.DateFormat.prototype.formatUTC = function(dt) {
  return this.formatImpl(dt, false);
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
    fileName = fileName.replace(/_?[\d-]+$/, '_' + nowStr);
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
// ファイルデータにBOMを付加
pcrutil.addBOM = function(fileData) {
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
// ファイルデータからBOMを除去
pcrutil.stripBOM = function(fileData) {
  return fileData.slice(pcrdef.BOM.length);
};

// ファイルデータ(バイトデータ、UTF-8、UTF-8N)をオブジェクトデータに変換
// 文字列データからも変換可
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
  let fileData = new TextEncoder('utf-8').encode(strData);
  // BOMを付加
  fileData = pcrutil.addBOM(fileData);

  return fileData;
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

// CSVデータ(ファイルデータ or 文字列データ)を2次元配列に変換
pcrutil.csvDataToMatrixData = function(csvFileData) {
  const FUNC_NAME = 'pcrutil.csvDataToMatrixData';

  // CSVデータ1行をセル配列に変換
  const csvRecordToCellList = function(csvRec, index) {
    const rawCellList = csvRec.split(',');

    // セル毎に分割
    const cellList = [];
    {
      let stack = [];
      for (const rawCell of rawCellList) {
        stack.push(rawCell);
        const cell = stack.join(',');
        if ((cell.match(/"/g) || []).length % 2 === 0) {
          cellList.push(cell);
          stack = [];
        }
      }
      if (stack.length !== 0) {
        cellList.push(stack.join(','));
      }
    }

    // セル内に不正な「"」が混じっていないかチェック
    for (let cell of cellList) {
      const parsedCell = cell.match(/^"([\s\S]*)"$/);
      if (parsedCell !== null) {
        cell = parsedCell[1];
        cell = cell.replace(/""/g, '@@');
      }
      if (cell.indexOf('"') !== -1) {
        throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0), index + 1, csvRec);
      }
    }

    // エスケープ用の「"」を除去
    for (let [index, cell] of cellList.entries()) {
      const parsedCell = cell.match(/^"([\s\S]*)"$/);
      // 「"」で囲っている場合、除去
      if (parsedCell !== null) {
        cell = parsedCell[1];
        // 内部に含まれる「""」を「"」に変換
        cell = cell.replace(/""/g, '"');
      }
      cellList[index] = cell;
    }

    return cellList;
  };

  // ファイルデータの場合、文字列データに変換
  let csvStrData = undefined;
  if (pcrutil.isString(csvFileData)) {
    csvStrData = csvFileData;
  } else {
    csvStrData = new TextDecoder('utf-8').decode(csvFileData);
  }

  const lineStrList = csvStrData.split('\n');

  const csvRecList = [];
  {
    let stack = [];
    for (const lineStr of lineStrList) {
      stack.push(lineStr);
      const csvRec = stack.join('\n');
      if ((csvRec.match(/"/g) || []).length % 2 === 0) {
        csvRecList.push(csvRec);
        stack = [];
      }
    }
    // 最後の「"」が閉じられていない場合、無理矢理追加(セル単位のチェック時に引っかかる)
    if (stack.length !== 0) {
      csvRecList.push(stack.join('\n'));
    }
  }

  const matrixData = [];
  for (const [index, csvRec] of csvRecList.entries()) {
    const cellList = csvRecordToCellList(csvRec, index);
    matrixData.push(cellList);
  }

  return matrixData;
};

// 2次元配列をCSVデータ(文字列データ)に変換
pcrutil.matrixDataToCsvData = function(matrixData) {
  const csvMatrix = [];
  for (const rec of matrixData) {
    const csvRec = rec.map((cell) => {
      if (pcrutil.isString(cell)) {
        // 「"」を「""」にエスケープ
        cell = cell.replace(/"/g, '""');
        // CSVの制御文字が含まれている場合、「""」で囲い
        if (/[,"\r\n]/.test(cell)) {
          cell = '"' + cell + '"';
        }
      }
      return cell;
    });
    csvMatrix.push(csvRec);
  }

  const csvStrData = csvMatrix.map((csvRec) => csvRec.join(',')).join('\n');

  return csvStrData;
}

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
//     'createDate': 'yyyy-MM-dd hh:mm:ss',
//     'updateUser': '',
//     'updateDate': ''
//   },
//   {
//     ...
//   },
//   ....
// ]

// CSVデータ(ファイルデータ or 文字列データ)から平坦なオブジェクトデータに変換
// CSVデータから取得した各要素は全て文字列扱い(判別方法がないため)
pcrutil.csvDataToFlatObjectData = function(csvFileData) {
  const FUNC_NAME = 'pcrutil.csvDataToFlatObjectData';

  // CSVデータを2次元配列に変換
  // ファイルデータ→文字列データ→2次元配列と2段階分処理
  const matrixData = pcrutil.csvDataToMatrixData(csvFileData);
  if (matrixData.length < 2) {
    throw pcrutil.makeError(pcrmsg.getN(FUNC_NAME, 0));
  }

  // CSVデータの1行目はオブジェクトの鍵部
  const objKeys = matrixData.shift();
  // CSVデータの2行目以降はオブジェクトの値部
  const objData = [];
  for (const rec of matrixData) {
    const objRec = rec.reduce((accum, cell, index) => {
      accum[objKeys[index]] = cell;
      return accum;
    }, {});
    objData.push(objRec);
  }

  return objData;
};

// 平坦なオブジェクトデータからCSVデータ(文字列データ)に変換
pcrutil.flatObjectDataToCsvData = function(objData) {
  if (objData.length < 1) return [];

  const matrixData = [];

  // オブジェクトの鍵部
  const objKeys = Object.keys(objData[0]);
  matrixData.push(objKeys);

  // オブジェクトの値部
  for (const objRec of objData) {
    // 鍵部と同じ順番の配列で取得
    const objVals = objKeys.map((key) => objRec[key]);
    matrixData.push(objVals);
  }

  // 2次元配列をCSVデータ(文字列データ)に変換
  const csvStrData = pcrutil.matrixDataToCsvData(matrixData);

  return csvStrData;
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

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// クッキーにデータを設定
pcrutil.setCookie = function(key, val, opt) {
  if (!pcrutil.isString(key) || key === '') {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'key');
  }
  const reservedKeys = [
    'domain', 'path', 'expires', 'max-age', 'secure', 'httponly', 'samesite'
  ];
  if (reservedKeys.indexOf(key.toLowerCase()) !== -1) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'key');
  }
  if (!pcrutil.isString(val)) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'val');
  }
  if (!pcrutil.isObject(opt)) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt');
  }
  if (opt.domain !== undefined && !pcrutil.isString(opt.domain)) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt.domain');
  }
  if (opt.path !== undefined && !pcrutil.isString(opt.path)) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt.path');
  }
  if (opt.expires !== undefined) {
    if (!pcrutil.isInteger(opt.expires) && !pcrutil.isDate(opt.expires)) {
      throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt.expires');
    }
  }
  if (opt['max-age'] !== undefined && !pcrutil.isInteger(opt['max-age'])) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt.max-age');
  }
  if (opt.secure !== undefined && !pcrutil.isBoolean(opt.secure)) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt.secure');
  }
  if (opt.sameSite !== undefined && !pcrutil.isString(opt.sameSite)) {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'opt.sameSite');
  }

  // クッキーの各要素を作成
  const cookieParts = {
    keyVal: '',
    domain: '',
    path: '',
    expires: '',
    secure: '',
    sameSite: ''
  };
  const encodedKey = encodeURIComponent(key);
  const encodedVal = encodeURIComponent(val);
  cookieParts.keyVal = encodedKey + '=' + encodedVal;
  if (opt.domain !== undefined) {
    cookieParts.domain = '; Domain=' + opt.domain;
  }
  if (opt.path !== undefined) {
    cookieParts.path = '; Path=' + opt.path;
  }
  if (opt.expires !== undefined) {
    let dt = undefined;
    if (pcrutil.isInteger(opt.expires)) {
      dt = new Date();
      dt.setDate(dt.getDate() + opt.expires);
    } else {
      dt = opt.expires;
    }
    cookieParts.expires = '; Expires=' + dt.toUTCString();
  }
  if (opt['max-age'] !== undefined) {
    cookieParts.expires = '; Max-Age=' + opt['max-age'];
  }
  if (opt.secure !== undefined) {
    if (opt.secure) {
      cookieParts.secure = '; Secure';
    }
  }
  if (opt.sameSite !== undefined) {
    cookieParts.sameSite = '; SameSite=' + opt.sameSite;
  }

  // クッキー文字列を構築し格納
  const cookieStr =
    cookieParts.keyVal +
    cookieParts.domain +
    cookieParts.path +
    cookieParts.expires +
    cookieParts.secure +
    cookieParts.sameSite;
  document.cookie = cookieStr;
};

// クッキーからデータを取得
pcrutil.getCookie = function(key) {
  if (!pcrutil.isString(key) || key === '') {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'key');
  }
  const encodedKey = encodeURIComponent(key);

  // クッキー文字列を解析
  const cookieParts = document.cookie.split(';').map((part) => part.trim());
  const cookieMap = cookieParts.reduce((accum, parts) => {
    const keyVal = parts.split('=');
    if (keyVal.length === 2) {
      accum[keyVal[0]] = keyVal[1];
    }
    return accum;
  }, {});

  const decodedVal = (cookieMap[encodedKey] !== undefined) ?
    decodeURIComponent(cookieMap[encodedKey]) : undefined;
  return decodedVal;
};

// クッキーからデータを削除
pcrutil.removeCookie = function(key) {
  const oldDt = new Date(Date.UTC(1970, 0, 1));
  const opt = {expires: oldDt, secure: false, sameSite: 'Strict'};
  pcrutil.setCookie(key, '', opt);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// ポップアップの開閉
pcrutil.popupConfirmEvent_ = undefined;
pcrutil.popup = function(msg, opt_processOnConsent, opt_processOnRejected) {
  // ポップアップ
  if (opt_processOnConsent === undefined) {
    $_('#popupMessage').innerText = msg;
    pcrutil.showHtmlElement($_('#popupWindow'));
    pcrutil.hideHtmlElement($_('#popupConfirmWindow'));

    pcrutil.popupConfirmEvent_ = undefined;
  // 確認付きポップアップ
  } else {
    $_('#popupConfirmMessage').innerText = msg;
    pcrutil.hideHtmlElement($_('#popupWindow'));
    pcrutil.showHtmlElement($_('#popupConfirmWindow'));

    // ボタン押下時イベントを設定
    pcrutil.popupConfirmEvent_ = (pressYes, pressNo) => {
      if (pressYes) {
        opt_processOnConsent();
      } else if (pressNo && opt_processOnRejected !== undefined) {
        opt_processOnRejected();
      }
    }
  }
  pcrutil.showHtmlElement($_('#popup'));
};
pcrutil.popupOff = function(pressYes, pressNo) {
  pcrutil.hideHtmlElement($_('#popup'));

  if (pcrutil.popupConfirmEvent_ !== undefined) {
    // 後続処理からの連続ポップアップに備え、ボタン押下時イベントを初期化
    const tempEvent = pcrutil.popupConfirmEvent_;
    pcrutil.popupConfirmEvent_ = undefined;
    tempEvent(pressYes, pressNo);
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// HTML要素に対する処理

// jQuery形式のセレクタ
// querySelectorの代替
function $_(sel) {
  if (/^#[a-zA-Z][a-zA-Z0-9_-]*$/.test(sel)) {
    return document.getElementById(sel.slice(1));
  } else {
    return document.querySelector(sel);
  }
};
// querySelectorAllの代替
function $$_(sel) {
  return document.querySelectorAll(sel);
};

// イベントリスナー
function $on(elem, type, listener) {
  if (elem !== undefined && elem !== null) {
    elem.addEventListener(type, listener);
  }
};

// HTML要素を表示、非表示に切り替え、表示状態の取得
pcrutil.showHtmlElement = function(elem, opt_flag = true) {
  // 表示
  if (opt_flag) {
    elem.classList.remove('is-hidden');
  // 非表示
  } else {
    elem.classList.add('is-hidden');
  }
};
pcrutil.hideHtmlElement = function(elem) {
  elem.classList.add('is-hidden');
};
pcrutil.isVisibleHtmlElement = function(elem) {
  return !elem.classList.contains('is-hidden');
};

// HTML要素一覧のどれに合致するか取得
pcrutil.indexOfHtmlElement = function(elemList, target) {
  return Array.from(elemList).indexOf(target);
};

// HTML要素のクリック(タップ)位置を取得
pcrutil.getClickPosOnHtmlElement = function(elem, event) {
  const elemRect = elem.getBoundingClientRect();
  const clickPos = {
    x: event.pageX - (elemRect.left + window.pageXOffset),
    y: event.pageY - (elemRect.top + window.pageYOffset)
  };
  return clickPos;
};

// セレクトボックスの状態を取得
pcrutil.getSelectBoxState = function(elem) {
  return {
    index: elem.selectedIndex,
    value: elem.options[elem.selectedIndex].value
  };
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

pcrutil.addEventListener = function() {
  // リンクを無効化
  $on($_('a.is-disabled-link'), 'click', function(event) {
    event.preventDefault();
  });

  // ポップアップ用イベントハンドラ
  // ボタン以外を押してポップアップを閉じる
  $on($_('#popup'), 'click', function() {
    pcrutil.popupOff(false, false);
  });
  // 「はい」を押してポップアップを閉じる
  $on($_('#popupConfirmYes'), 'click', function(event) {
    event.stopPropagation();
    pcrutil.popupOff(true, false);
  });
  // 「いいえ」を押してポップアップを閉じる
  $on($_('#popupConfirmNo'), 'click', function(event) {
    event.stopPropagation();
    pcrutil.popupOff(false, true);
  });
};

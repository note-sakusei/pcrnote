// メッセージ、ラベル定義

'use strict';

var exports = exports || undefined;

var pcrmsg = exports || pcrmsg || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// メッセージ定義
pcrmsg.MSG = {
  // 汎用メッセージ
  fatalError: '想定外のエラーです',
  illegalArgument: '引数(${1})が未定義、または不正です',

  // 個別メッセージ
  pcrutil: {
    deepCopy: [
      'ディープコピーの対象が配列、オブジェクト以外です'
    ],
    csvDataToMatrixData: [
      '不正なダブルクオテーションが存在します(行${1} : ${2})'
    ],
    fileDataToObjectData: [
      'JSONファイルの解析に失敗しました(${1})',
      'CSVファイルの解析に失敗しました(${1})'
    ],
    csvDataToFlatObjectData: [
      'データが存在しない、または不十分です'
    ],
    flatObjectDataToObjectData: [
      'オブジェクトデータの鍵部に使用出来るのは数値か文字列のみです(${1})',
      '大外の配列の子要素はオブジェクトでなければなりません',
    ],
    objectDataToFlatObjectData: [
      '大外の配列の子要素はオブジェクトでなければなりません',
      'オブジェクトデータの大外部は配列でなければなりません'
    ]
  },

  pcrdb: {
    Transaction: {
      insert: [
        '既に同じデータが存在します'
      ],
      update: [
        '更新対象が存在しません',
        '他から更新されている可能性があります'
      ],
      delete: [
        '削除対象が存在しません',
      ]
    },
    UnitInfoTable: {
      addUnit: [
        '既に追加済みのユニットです(${1})'
      ],
      addPCList: [
        '不正なユニット定義です(${1})'
      ],
      addNPCList: [
        '不正なユニット定義です(${1})'
      ],
      convertUnitIDToUnitName: [
        'ユニットIDからユニット名に変換出来ません(${1})'
      ],
      convertUnitNameToUnitID: [
        'ユニット名からユニットIDに変換出来ません(${1})'
      ]
    },
    VsSetTable: {
      checkVsSetStruct: [
        'データ構造に異常があります(vsSet[${1}].${2})\n${3}'
      ],
      checkVsSetContent: [
        'データ内容に異常があります(vsSet[${1}].${2})\n${3}'
      ],
      checkDuplicatedVsSet: [
        '重複データが存在します(vsSet[${1}])\n${2}'
      ],
      toInternalData: [
        '作成日時の正規化に失敗しました(${1})',
        '更新日時の正規化に失敗しました(${1})'
      ],
      importDataFromFile: [
        'プリコネノート用ファイル(*.json|*.csv)を選択して下さい',
        'ファイルの読み込みに失敗しました'
      ],
      importDataFromServer: [
        'サーバーからJSONデータの受信に失敗しました',
        'サーバーとの同期に失敗しました\n${1}',
        'サーバーに接続出来ません'
      ],
      exportDataToServer: [
        'サーバーからJSONデータの受信に失敗しました',
        'サーバーデータの更新に失敗しました\n${1}',
        'サーバーに接続出来ません'
      ],
      sort: [
        'ソートの昇順、降順(asc|desc)の指定が不正です'
      ],
      filter: [
        '絞り込み用関数の配列を渡して下さい'
      ],
      Result: {
        updateSync: [
          '検索結果一覧の同期に失敗しました'
        ]
      }
    }
  },

  pcrconfig: {},

  pcrctrl: {},

  pcract: {},

  pcrview: {
    setLabelOfSyncDataWithServer: [
      '同期',
      '更新確定',
      '同期中...'
    ],
    setUsedForLabel: [
      'アリーナ',
      'クラバト'
    ],
    setViewStyleLabel: [
      '一覧表示(最小)',
      '一覧表示(簡易)',
      '一覧表示(標準)'
    ],
    makeSwitchButtonLabelHtml: [
      '切替(－)',
      '切替(${1})'
    ],
    buildHashtagSelectBox: [
      '- 未選択 -',
      '- 再構築 -'
    ],
    buildResultMessageHtml: [
      'データの同期、または新規登録を行って下さい',
      'データの読み込み、または新規登録を行って下さい',
      '検索条件を入力すると以下に結果が表示されます',
      '検索結果 : 0件',
      '検索結果 : ${1}件 (全${2}件中)',
      '検索結果 : ${1}件'
    ]
  },

  pcrevent: {
    exportDataToFile: {
      onClick: [
        'まだ保存するデータがありません',
        '保存しますか？',
        '現在の入力状態を保存するには、クッキーに保存を有効にしてください',
        '現在の入力状態をクッキーに保存しました'
      ]
    },
    syncDataWithServer: {
      onClick: [
        '更新しました',
        '更新に失敗しました'
      ]
    },
    newVsSet: {
      registVsSet: {
        onClick: [
          '防衛側にユニットを設定していません',
          '同一の編成が存在します',
          'まだ1つもデータが登録されていません\nデータの登録を行いますか？',
          '攻撃側に全てのユニットを設定していません\nデータの登録を行いますか？',
          '登録しました！'
        ]
      }
    },
    resultVsSetList: {
      deleteVsSet: {
        onClick: [
          '削除しますか？'
        ]
      }
    }
  },

  pcrnote: {
    global: [
      'このアプリケーションは利用出来ません'
    ]
  },

  pcrsvr: {
    Setting: {
      constructor: [
        '[pcrsvr.settings]\n' +
        'tcpPortNum: ${1}\n' +
        'useSSL: ${2}\n' +
        'sslKeyPath: ${3}\n' +
        'sslCertPath: ${4}\n' +
        'wwwDir: ${5}\n' +
        'dataDir: ${6}\n' +
        'backupDir: ${7}\n' +
        'autoBackupData: ${8}\n' +
        'receivedDataSizeMax: ${9}\n' +
        'availableAuthorityList: ${10}'
      ],
      load: [
        '設定ファイルが見つかりません(${1})',
        '設定ファイルの構造に異常があります(${1})'
      ],
      check: [
        '設定ファイルの必須項目が未定義です(${1})',
        '設定ファイルの項目の型が不正です(${1})'
      ],
      checkDetail: [
        'SSL通信用の秘密鍵が存在しません(${1})',
        'SSL通信用の証明書が存在しません(${1})',
        'ドキュメントルート(公開)ディレクトリが存在しません(${1})',
        'データディレクトリが存在しません(${1})',
        'データのバックアップディレクトリが存在しません(${1})'
      ]
    },
    logging: [
      '[${1}] ${2} : ${3}'
    ],
    authenticateAuthority: [
      '不正なユーザー名です',
      '不正なデータベース名です',
      'ログイン認証 ユーザー[${1}] データベース[${2}] ERROR',
      'ログイン認証 ユーザー[${1}] データベース[${2}] OK'
    ],
    readCGI: [
      '読み込みファイルが見つかりません(${1})',
      '読み込み OK'
    ],
    writeCGI: [
      'クエリ ${1} OK',
      'クエリ ${1} ERROR',
      '書き出し OK'
    ],
    responseError: [
      'httpResponse: ${1}'
    ],
    responseScript: [
      '========================================',
      'ログイン失敗\nユーザー名とデータベース名を確認してください'
    ],
    requestPost: [
      'データの受信を停止',
      '送信データが大きすぎます',
      '不正な送信データです(${1})'
    ],
    requestMain: [
      '不正なリクエストヘッダです(${1})',
      '不正なURLです(${1})',
      'HTTPリクエストメソッド(GET|POST)が不明です'
    ]
  }
};

// メッセージIDから該当のメッセージを取得
pcrmsg.get = function(msgID) {
  const msgIDChain = msgID.split('.');
  let msg = pcrmsg.MSG;
  while (msgIDChain.length !== 0) {
    msg = msg[msgIDChain.shift()];
    if (msg === undefined) {
      throw new Error(`pcrmsg.MSG.${msgID} is undefined`);
    }
  }
  return msg;
};

// メッセージIDと連番から該当のメッセージを取得
pcrmsg.getN = function(msgID, num) {
  const msgAry = pcrmsg.get(msgID);
  if (msgAry[num] === undefined) {
    throw new Error(`pcrmsg.MSG.${msgID}[${num}] is undefined`);
  }
  return msgAry[num];
};

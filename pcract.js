// クライアント側コンテンツ部
// 内部処理

'use strict';

var pcract = pcract || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 初期化
pcract.init = function() {
  pcract.initNewVsSet();
  pcract.initSearchVsSet(pcrnote.gConfigData.numOfSearchPartySlots);
  pcract.restoreInputStateFromCookie();
};

// 空の編成を作成
pcract.makeEmptyParty = function() {
  return new Array(pcrdef.PARTY_UNITS_MAX).fill('');
};

// 新規対戦情報の初期化
pcract.initNewVsSet = function() {
  pcrnote.gNewVsSet = {
    // 攻撃側編成
    offenseParty: pcract.makeEmptyParty(),
    // 防衛側編成
    defenseParty: pcract.makeEmptyParty(),
    // 評価値
    rating: {good: 0, bad: 0},
    // コメント
    comment: '',
    // 作成ユーザー
    createUser: '',
    // 作成日時
    createDate: '',
    // 更新ユーザー
    updateUser: '',
    // 更新日時
    updateDate: ''
  };
  Object.seal(pcrnote.gNewVsSet);
};

// ユニット検索情報の初期化
pcract.initSearchVsSet = function(slotSize) {
  pcrnote.gSearchVsSet = {
    // 現在のスロット位置
    currSlotNum: 0,
    // スロット一覧
    slotList: (() => {
      const tempSlotList = [];
      for (let i = 0; i < slotSize; ++i) {
        tempSlotList.push({
          // 攻撃側編成
          offenseParty: pcract.makeEmptyParty(),
          // 防衛側編成
          defenseParty: pcract.makeEmptyParty()
        });
      }
      return tempSlotList;
    })(),
    // コメント
    comment: ''
  };
  Object.seal(pcrnote.gSearchVsSet);
};

// ユニット検索情報を調整
pcract.adjustSearchVsSet = function(slotSize) {
  // 現在のスロット位置を調整
  if (slotSize <= pcrnote.gSearchVsSet.currSlotNum) {
    pcrnote.gSearchVsSet.currSlotNum = slotSize - 1;
  }
  // 足りないスロットを追加
  while (pcrnote.gSearchVsSet.slotList.length < slotSize) {
    pcrnote.gSearchVsSet.slotList.push({
      offenseParty: pcract.makeEmptyParty(),
      defenseParty: pcract.makeEmptyParty()
    });
  }
  // 余分なスロットを除去
  while (slotSize < pcrnote.gSearchVsSet.slotList.length) {
    pcrnote.gSearchVsSet.slotList.pop();
  }
};

// 攻撃側編成を取得(新規対戦情報、ユニット検索情報兼用)
pcract.getOffenseParty = function(vsSet) {
  if ('offenseParty' in vsSet) {
    return vsSet.offenseParty;
  } else {
    return vsSet.slotList[vsSet.currSlotNum].offenseParty;
  }
};
// 防衛側編成を取得(新規対戦情報、ユニット検索情報兼用)
pcract.getDefenseParty = function(vsSet) {
  if ('offenseParty' in vsSet) {
    return vsSet.defenseParty;
  } else {
    return vsSet.slotList[vsSet.currSlotNum].defenseParty;
  }
};

// 攻撃側編成、防衛側編成のユニット選択状態の切り替え
pcract.toggleUnitSelection = function(targetParty, unitID) {
  if (unitID === '' || pcrutil.isUnitWildcard(unitID)) return;

  // ユニットIDがユニット情報テーブルに存在するか念のためチェック
  const unitInfo = pcrnote.gUnitInfoTable.findByUnitID(unitID);
  if (unitInfo === undefined) {
    throw pcrutil.makeError(pcrmsg.build('illegalArgument', 'unitID'));
  }

  // 選択済みの場合、除外
  if (targetParty.includes(unitID)) {
    const releaseIndex = targetParty.indexOf(unitID);
    targetParty[releaseIndex] = '';
  // 未選択の場合、空きがあれば追加
  } else {
    const emptyIndex = targetParty.indexOf('');
    if (emptyIndex !== -1) {
      targetParty[emptyIndex] = unitID;
    }
  }

  pcrnote.gUnitInfoTable.sortParty(targetParty);
};
// 攻撃側編成、防衛側編成にユニットを追加
pcract.addUnitSelection = function(targetParty, unitID) {
  if (unitID === '' || pcrutil.isUnitWildcard(unitID)) return;

  // ユニットIDがユニット情報テーブルに存在するか念のためチェック
  const unitInfo = pcrnote.gUnitInfoTable.findByUnitID(unitID);
  if (unitInfo === undefined) {
    throw pcrutil.makeError(pcrmsg.build('illegalArgument', 'unitID'));
  }

  // 空きがあれば追加
  const emptyIndex = targetParty.indexOf('');
  if (emptyIndex !== -1) {
    targetParty[emptyIndex] = unitID;
  }

  pcrnote.gUnitInfoTable.sortParty(targetParty);
};

// 防衛側編成に編成用ワイルドカードを設定
pcract.toggleUnitWildcard = function(targetParty, pos) {
  const unitID = targetParty[pos];
  // 空欄の場合、編成用ワイルドカードを設定
  if (unitID === '') {
    targetParty[pos] = pcrutil.makeUnitWildcard(pos);
  // 編成用ワイルドカードが設定されている場合、除去
  } else if (pcrutil.isUnitWildcard(unitID)) {
    targetParty[pos] = '';
  } else {
    return;
  }

  pcrnote.gUnitInfoTable.sortParty(targetParty);
};

// 評価の増減
// 評価部HTMLの押下位置(4つに区分)に応じてどれを増減するか変える
pcract.raiseOrLowerRating = function(vsSet, centralPos, clickPos) {
  if (clickPos[0] < centralPos[0]) {
    // 左上部押下 => good増
    if (clickPos[1] < centralPos[1]) {
      ++vsSet.rating.good;
    // 左下部押下 => good減
    } else {
      --vsSet.rating.good;
    }
  } else {
    // 右上部押下 => bad減
    if (clickPos[1] < centralPos[1]) {
      --vsSet.rating.bad;
    // 右下部押下 => bad増
    } else {
      ++vsSet.rating.bad;
    }
  }

  // 下限、上限を超えないよう調整
  if (vsSet.rating.good < pcrdef.RATING_VALUE.MIN) {
    vsSet.rating.good = pcrdef.RATING_VALUE.MIN;
  }
  if (vsSet.rating.bad < pcrdef.RATING_VALUE.MIN) {
    vsSet.rating.bad = pcrdef.RATING_VALUE.MIN;
  }
  if (pcrdef.RATING_VALUE.MAX < vsSet.rating.good) {
    vsSet.rating.good = pcrdef.RATING_VALUE.MAX;
  }
  if (pcrdef.RATING_VALUE.MAX < vsSet.rating.bad) {
    vsSet.rating.bad = pcrdef.RATING_VALUE.MAX;
  }

  return vsSet;
};

// 対戦情報テーブルの全コメントからハッシュタグを全て抽出
pcract.extractAllHashtagList = function() {
  const vsSetList = pcrnote.gVsSetTable.getAllData();

  // 抽出
  let allHashtagList = vsSetList.reduce((accum, vsSet) => {
    return accum.concat(pcrutil.extractHashtagList(vsSet.comment));
  }, []);
  // 重複除去
  allHashtagList = allHashtagList.filter(
    (elem, index, self) => self.indexOf(elem) === index
  );
  // ソート
  allHashtagList.sort((lhs, rhs) => lhs === rhs ? 0 : lhs < rhs ? -1 : 1);

  return allHashtagList;
};

// 選択されているハッシュタグを取得
pcract.getSelectedHashtag1 = function() {
  return $('#hashtag1').find(':selected').val();
};
pcract.getSelectedHashtag2 = function() {
  return $('#hashtag2').find(':selected').val();
};

// 対戦情報テーブルをソート
pcract.sortVsSetTable = function() {
  const compareFunc = $('#compareFunc').find(':selected').val();
  const orderBy = $('#orderBy').find(':selected').val();
  pcrnote.gVsSetTable.sort(compareFunc, orderBy);
};

// 対戦情報テーブルを検索条件で絞り込み、検索結果一覧を作成
pcract.filterVsSetTable = function() {
  const filterFuncList = [];

  // ユニットで絞り込み関数作成
  const searchParty = pcract.getDefenseParty(pcrnote.gSearchVsSet);
  const wildcardList = searchParty.filter((elem) => pcrutil.isUnitWildcard(elem));
  const searchList = searchParty.filter((elem) => elem !== '');
  const searchUnitList = searchParty.filter(
    (elem) => elem !== '' && !pcrutil.isUnitWildcard(elem)
  );
  // 全ての検索条件を設定するか、検索開始ユニット数以上のユニットを設定した場合、検索開始
  if (
    searchList.length === pcrdef.PARTY_UNITS_MAX ||
    pcrnote.gConfigData.searchStartUnitsMin <= searchUnitList.length
  ) {
    let unitFilterFunc = undefined;
    // アリーナ用
    // 検索条件のユニットに全て一致する必要あり
    if (pcrnote.gViewController.isUsedForArena()) {
      // 編成用ワイルドカードなし
      // 隊列位置は不問
      if (wildcardList.length === 0) {
        unitFilterFunc = (vsSet) => {
          const targetUnitList = vsSet.defenseParty.filter((elem) => elem !== '');
          const numOfMatchUnits = searchUnitList.filter(
            (elem) => targetUnitList.includes(elem)
          ).length;
          return numOfMatchUnits === searchUnitList.length;
        };
      // 編成用ワイルドカードあり
      // 隊列位置も完全一致する必要あり
      } else {
        unitFilterFunc = (vsSet) => {
          const targetParty = vsSet.defenseParty.slice();
          for (const [index, unitID] of searchParty.entries()) {
            if (unitID === '' || pcrutil.isUnitWildcard(unitID)) {
              targetParty[index] = unitID;
            }
          }
          return JSON.stringify(targetParty) === JSON.stringify(searchParty);
        };
      }
    // クラバト用
    // 検索条件のユニットのいずれかに一致すればOK
    } else {
      unitFilterFunc = (vsSet) => {
        // ユニット未設定で検索するのであれば全て取得
        if (searchUnitList.length === 0) return true;
        const targetUnitList = vsSet.defenseParty.filter((elem) => elem !== '');
        const numOfMatchUnits = searchUnitList.filter(
          (elem) => targetUnitList.includes(elem)
        ).length;
        return numOfMatchUnits !== 0;
      };
    }
    filterFuncList.push(unitFilterFunc);
  }

  // ハッシュタグで絞り込み関数作成
  for (const i of [1, 2]) {
    const hashtag = pcract['getSelectedHashtag' + i]();
    if (hashtag !== undefined && hashtag !== '') {
      const hashtagFilterFunc = (vsSet) => {
        const hashtagList = pcrutil.extractHashtagList(vsSet.comment);
        return hashtagList.find((elem) => elem === hashtag) !== undefined;
      };
      filterFuncList.push(hashtagFilterFunc);
    }
  }

  pcrnote.gVsSetTable.filter(
    filterFuncList, pcrnote.gConfigData.searchResultLimit
  );
};

// 現在の入力状態をクッキーに保存
pcract.saveInputStateToCookie = function() {
  // 表示制御
  const viewCtrlCookieData = JSON.stringify(pcrnote.gViewController.states);
  $.cookie('viewCtrl', viewCtrlCookieData, pcrdef.COOKIE_OPTIONS);
  // 新規対戦情報
  const newVsSetCookieData = JSON.stringify(pcrnote.gNewVsSet);
  $.cookie('newVsSet', newVsSetCookieData, pcrdef.COOKIE_OPTIONS);
  // ユニット検索情報
  const searchVsSetCookieData = JSON.stringify(pcrnote.gSearchVsSet);
  $.cookie('searchVsSet', searchVsSetCookieData, pcrdef.COOKIE_OPTIONS);
};
// 現在の入力状態をクッキーから復元
pcract.restoreInputStateFromCookie = function() {
  try {
    // 表示制御
    const viewCtrlCookieData = $.cookie('viewCtrl');
    if (viewCtrlCookieData !== undefined) {
      const viewCtrlState = JSON.parse(viewCtrlCookieData);
      pcrnote.gViewController = new pcrctrl.ViewController(viewCtrlState);
      pcrnote.gViewController.switchPageConfig();
    }
    // 新規対戦情報
    const newVsSetCookieData = $.cookie('newVsSet');
    if (newVsSetCookieData !== undefined) {
      pcrnote.gNewVsSet = JSON.parse(newVsSetCookieData);
    }
    // ユニット検索情報
    const searchVsSetCookieData = $.cookie('searchVsSet');
    if (searchVsSetCookieData !== undefined) {
      pcrnote.gSearchVsSet = JSON.parse(searchVsSetCookieData);
      // 現在のスロット数に合わせて調整
      pcract.adjustSearchVsSet(pcrnote.gConfigData.numOfSearchPartySlots);
    }
  } catch (e) {
    pcract.deleteInputStateFromCookie();
  }
};
// 現在の入力状態をクッキーから削除
pcract.deleteInputStateFromCookie = function() {
  $.removeCookie('viewCtrl', pcrdef.COOKIE_OPTIONS);
  $.removeCookie('newVsSet', pcrdef.COOKIE_OPTIONS);
  $.removeCookie('searchVsSet', pcrdef.COOKIE_OPTIONS);
};

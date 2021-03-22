// クライアント側コンテンツ部
// 表示処理

'use strict';

var pcrview = pcrview || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 初期化
pcrview.init = function() {
  pcrview.setLabelOfSyncDataWithServer();
  pcrview.setUsedForLabel();
  pcrview.setViewStyleLabel();
  pcrview.buildHashtagSelectBox();
  pcrview.buildUnitCatalogHtml();
  pcrview.showResident();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 数値を表示用数値にマッピング(10以降はアルファベットにマッピング)
pcrview.convertToNumForDisplay = function(num) {
  const WIDE_NUM_MAP = [
    '０', '１', '２', '３', '４', '５', '６', '７', '８', '９',
    'Ａ', 'Ｂ', 'Ｃ', 'Ｄ', 'Ｅ', 'Ｆ', 'Ｇ', 'Ｈ', 'Ｉ', 'Ｊ',
    'Ｋ', 'Ｌ', 'Ｍ', 'Ｎ', 'Ｏ', 'Ｐ', 'Ｑ', 'Ｒ', 'Ｓ', 'Ｔ',
    'Ｕ', 'Ｖ', 'Ｗ', 'Ｘ', 'Ｙ', 'Ｚ'
  ];
  return (num < WIDE_NUM_MAP.length) ? WIDE_NUM_MAP[num] : '　';
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// サーバーと同期ボタンのラベルを設定
pcrview.setLabelOfSyncDataWithServer = function() {
  const FUNC_NAME = 'pcrview.setLabelOfSyncDataWithServer';

  const $syncDataWithServer = $_('#syncDataWithServer');
  switch (pcrnote.gVsSetTable.getImportState()) {
  case pcrdef.VsSetTableImportState.SYNC:
    $syncDataWithServer.textContent = pcrmsg.getN(FUNC_NAME, 0);
    break;
  case pcrdef.VsSetTableImportState.ASYNC:
    $syncDataWithServer.textContent = pcrmsg.getN(FUNC_NAME, 1);
    break;
  case pcrdef.VsSetTableImportState.WHILE_SYNC:
    $syncDataWithServer.textContent = pcrmsg.getN(FUNC_NAME, 2);
    break;
  }
};

// 用途ボタンのラベルを設定
pcrview.setUsedForLabel = function() {
  const FUNC_NAME = 'pcrview.setUsedForLabel';

  const $usedFor = $_('#switchUsedFor');
  switch (pcrnote.gViewController.usedFor) {
  case pcrdef.ViewController.USED_FOR_ARENA:
    $usedFor.textContent = pcrmsg.getN(FUNC_NAME, 0);
    break;
  case pcrdef.ViewController.USED_FOR_CLANBATTLE:
    $usedFor.textContent = pcrmsg.getN(FUNC_NAME, 1);
    break;
  }
};

// 検索結果一覧の表示方法ボタンのラベルを設定
pcrview.setViewStyleLabel = function() {
  const FUNC_NAME = 'pcrview.setViewStyleLabel';

  const $viewStyle = $_('#switchViewStyle');
  switch (pcrnote.gViewController.viewStyle) {
  case pcrdef.ViewController.VIEW_STYLE_MINIMUM:
    $viewStyle.textContent = pcrmsg.getN(FUNC_NAME, 0);
    break;
  case pcrdef.ViewController.VIEW_STYLE_SIMPLE:
    $viewStyle.textContent = pcrmsg.getN(FUNC_NAME, 1);
    break;
  case pcrdef.ViewController.VIEW_STYLE_NORMAL:
    $viewStyle.textContent = pcrmsg.getN(FUNC_NAME, 2);
    break;
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// オブジェクトで作成すると遅くなるので、頻繁に呼び出される部分はHTML文字列で作成

// ユニット情報(ID、名称、画像)HTML作成
pcrview.UNIT_INFO_TEMPLATE_HTML_ = undefined;
pcrview.makeUnitInfoHtml = function(unitInfo) {
  if (pcrview.UNIT_INFO_TEMPLATE_HTML_ === undefined) {
    pcrview.UNIT_INFO_TEMPLATE_HTML_ = $_('#unitInfoTemplate').innerHTML;
  }
  const escUnitImageURL =
    unitInfo.imageURL.replace('(', '\\(').replace(')', '\\)');
  const title = `title="${unitInfo.unitName}"`;
  const bgImageStyle = `style="background-image: url(${escUnitImageURL});"`;
  const html = pcrview.UNIT_INFO_TEMPLATE_HTML_
    .replace('<!--UNIT_ID-->', unitInfo.unitID)
    .replace('<!--UNIT_NAME-->', unitInfo.unitName)
    .replace('title="UNIT_NAME"', title)
    .replace('style="background-image: none;"', bgImageStyle);
  return html;
};

// 編成用ワイルドカードHTML作成
pcrview.UNIT_WILDCARD_TEMPLATE_HTML_ = undefined;
pcrview.makeUnitWildcardHtml = function() {
  if (pcrview.UNIT_WILDCARD_TEMPLATE_HTML_ === undefined) {
    pcrview.UNIT_WILDCARD_TEMPLATE_HTML_ = $_('#unitWildcardTemplate').innerHTML;
  }
  return pcrview.UNIT_WILDCARD_TEMPLATE_HTML_;
};

// 攻撃側、防衛側編成HTML作成(共通部)
pcrview.makePartyHtml = function(html, party) {
  for (const unitID of party.slice().reverse()) {
    let unitInfoHtml = undefined;
    if (unitID === '') {
      unitInfoHtml = '';
    } else if (pcract.isUnitWildcard(unitID)) {
      unitInfoHtml = pcrview.makeUnitWildcardHtml();
    } else {
      const unitInfo = pcrnote.gUnitInfoTable.findByUnitID(unitID);
      unitInfoHtml = pcrview.makeUnitInfoHtml(unitInfo);
    }
    html = html.replace('<!--UNIT_INFO_HTML-->', unitInfoHtml);
  }
  return html;
};
// 攻撃側HTML作成
pcrview.OFFENSE_PARTY_TEMPLATE_HTML_ = undefined;
pcrview.makeOffensePartyHtml = function(vsSet) {
  if (pcrview.OFFENSE_PARTY_TEMPLATE_HTML_ === undefined) {
    pcrview.OFFENSE_PARTY_TEMPLATE_HTML_ = $_('#offensePartyTemplate').innerHTML;
  }
  return pcrview.makePartyHtml(
    pcrview.OFFENSE_PARTY_TEMPLATE_HTML_,
    pcract.getOffenseParty(vsSet)
  );
};
// 防衛側HTML作成
pcrview.DEFENSE_PARTY_TEMPLATE_HTML_ = undefined;
pcrview.makeDefensePartyHtml = function(vsSet) {
  if (pcrview.DEFENSE_PARTY_TEMPLATE_HTML_ === undefined) {
    pcrview.DEFENSE_PARTY_TEMPLATE_HTML_ = $_('#defensePartyTemplate').innerHTML;
  }
  return pcrview.makePartyHtml(
    pcrview.DEFENSE_PARTY_TEMPLATE_HTML_,
    pcract.getDefenseParty(vsSet)
  );
};

// 評価HTML作成
pcrview.RATING_TEMPLATE_HTML_ = undefined;
pcrview.makeRatingHtml = function(vsSet) {
  if (pcrview.RATING_TEMPLATE_HTML_ === undefined) {
    pcrview.RATING_TEMPLATE_HTML_ = $_('#ratingTemplate').innerHTML;
  }
  const goodMarkStateClassName =
    (vsSet.rating.good !== 0) ? 'is-on' : 'is-off';
  const badMarkStateClassName =
    (vsSet.rating.bad !== 0) ? 'is-on' : 'is-off';
  const html = pcrview.RATING_TEMPLATE_HTML_
    .replace('GOOD_MARK_STATE_CLASS_NAME', goodMarkStateClassName)
    .replace('BAD_MARK_STATE_CLASS_NAME', badMarkStateClassName)
    .replace('<!--GOOD_VALUE-->', vsSet.rating.good)
    .replace('<!--BAD_VALUE-->', vsSet.rating.bad);
  return html;
};

// 現在のスロット番号HTML作成
pcrview.makeCurrSlotNumHtml = function() {
  const currSlotNum = pcrnote.gSearchVsSet.currSlotNum;
  const dispNum = pcrview.convertToNumForDisplay(currSlotNum + 1);
  return '(' + dispNum + ')';
};

// 作成ユーザーHTML作成
pcrview.makeTouchUserHtml = function(vsSet) {
  // 改行されないよう、途中のスペースをアンダースコアに変換
  return vsSet.createUser.replace(/\s/g, '_');
};

// 作成日時HTML作成
pcrview.makeTouchDateHtml = function(vsSet) {
  const formatter = new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_DISPLAY);
  const createDate = formatter.parse(vsSet.createDate);
  const dummyDate = new Date(2000, 0, 1);
  const dtStr = pcrutil.isDate(createDate) ? 
    formatter.format(createDate) : formatter.format(dummyDate);
  return dtStr;
};

// 切り替えボタンラベルHTML作成
pcrview.makeSwitchButtonLabelHtml = function(searchVsSet, index) {
  const FUNC_NAME = 'pcrview.makeSwitchButtonLabelHtml';

  let html = '';
  const currSlotNum = searchVsSet.currSlotNum;
  // 数値を減らすボタンラベルの作成
  if (index === 0) {
    if (currSlotNum === 0) {
      html = pcrmsg.getN(FUNC_NAME, 0);
    } else {
      const dispNum = pcrview.convertToNumForDisplay(currSlotNum + 0);
      html = pcrutil.buildMessage(pcrmsg.getN(FUNC_NAME, 1), dispNum);
    }
  // 数値を増やすボタンラベルの作成
  } else if (index === 1) {
    if (currSlotNum === pcrnote.gConfigData.numOfSearchPartySlots - 1) {
      html = pcrmsg.getN(FUNC_NAME, 0);
    } else {
      const dispNum = pcrview.convertToNumForDisplay(currSlotNum + 2);
      html = pcrutil.buildMessage(pcrmsg.getN(FUNC_NAME, 1), dispNum);
    }
  } else {
    throw pcrutil.makeError(pcrmsg.get('illegalArgument'), 'index');
  }
  return html;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// ハッシュタグ検索用セレクトボックスHTML構築
pcrview.buildHashtagSelectBox = function() {
  const FUNC_NAME = 'pcrview.buildHashtagSelectBox';

  const allHashtagList = pcract.extractAllHashtagList();

  let html = `<option value="" selected>${pcrmsg.getN(FUNC_NAME, 0)}</option>`;
  for (const hashtag of allHashtagList) {
    html += `<option value="${hashtag}">${hashtag}</option>`;
  }
  html += `<option value="[rebuild]">${pcrmsg.getN(FUNC_NAME, 1)}</option>`;

  $_('#hashtag1').innerHTML = html;
  $_('#hashtag1').selectedIndex = 0;
  $_('#hashtag2').innerHTML = html;
  $_('#hashtag2').selectedIndex = 0;
};

// 新規登録HTML構築
pcrview.buildNewVsSetHtml = function() {
  const $vsSet = $_('#newVsSet');
  // 攻撃側HTML
  $vsSet.querySelector('[name=offenseParty]').innerHTML =
    pcrview.makeOffensePartyHtml(pcrnote.gNewVsSet);
  // 防衛側HTML
  $vsSet.querySelector('[name=defenseParty]').innerHTML =
    pcrview.makeDefensePartyHtml(pcrnote.gNewVsSet);
  // 評価HTML
  $vsSet.querySelector('[name=rating]').innerHTML =
    pcrview.makeRatingHtml(pcrnote.gNewVsSet);
  // コメント入力領域
  $vsSet.querySelector('[name=commentArea]').value =
    pcrnote.gNewVsSet.comment;
};

// ユニット検索HTML構築
pcrview.buildSearchVsSetHtml = function() {
  const $vsSet = $_('#searchVsSet');
  // 攻撃側HTML
  $vsSet.querySelector('[name=offenseParty]').innerHTML =
    pcrview.makeOffensePartyHtml(pcrnote.gSearchVsSet);
  // 防衛側HTML
  $vsSet.querySelector('[name=defenseParty]').innerHTML =
    pcrview.makeDefensePartyHtml(pcrnote.gSearchVsSet);
  // コメント入力領域
  $vsSet.querySelector('[name=commentArea]').value =
    pcrnote.gSearchVsSet.comment;
  // 現在のスロット番号HTML
  $vsSet.querySelector('[name=currSlotNum]').innerHTML =
    pcrview.makeCurrSlotNumHtml();
  // 切り替えボタンのラベルを変更
  $vsSet.querySelectorAll('[name=switchVsSet]').forEach(($button, index) => {
    $button.innerHTML =
      pcrview.makeSwitchButtonLabelHtml(pcrnote.gSearchVsSet, index);
  });
};

// ユニット一覧HTML構築
pcrview.buildUnitCatalogHtml = function() {
  const $unitCatalogItemTemplate =
    $_('#unitCatalogItemTemplate').content.firstElementChild;
  const $unitCatalog = $_('#unitCatalog');
  const $flatPanel = $unitCatalog.querySelector('[name=flatPanel]');
  const $tieredPanel = $unitCatalog.querySelector('[name=tieredPanel]');
  const $flatPCUnitCatalog = $flatPanel.querySelector('[name=pcUnitCatalog]');
  const $flatNPCUnitCatalog = $flatPanel.querySelector('[name=npcUnitCatalog]');
  const $tieredPCUnitCatalogList =
    $tieredPanel.querySelectorAll('[name=pcUnitCatalog]');
  const $tieredNPCUnitCatalogList =
    $tieredPanel.querySelectorAll('[name=npcUnitCatalog]');

  const unitInfoList = pcrnote.gUnitInfoTable.getAllData();
  for (const unitInfo of unitInfoList) {
    const $unitCatalogItem1 = $unitCatalogItemTemplate.cloneNode(false);
    $unitCatalogItem1.innerHTML = pcrview.makeUnitInfoHtml(unitInfo);
    const $unitCatalogItem2 = $unitCatalogItem1.cloneNode(true);

    if (unitInfo.isPC) {
      $flatPCUnitCatalog.appendChild($unitCatalogItem1);
      $tieredPCUnitCatalogList[unitInfo.tierNum].appendChild($unitCatalogItem2);
    } else if (unitInfo.isNPC) {
      $flatNPCUnitCatalog.appendChild($unitCatalogItem1);
      $tieredNPCUnitCatalogList[unitInfo.tierNum].appendChild($unitCatalogItem2);
    }
  }
};

// 検索結果一覧HTML構築
pcrview.buildResultVsSetListHtml = function() {
  const $resultVsSetTemplate =
    $_('#resultVsSetTemplate').content.firstElementChild;
  const $resultVsSetList = $_('#resultVsSetList');

  $resultVsSetList.textContent = '';
  const resultVsSetList = pcrnote.gVsSetTable.getResult().limitedList;
  for (const vsSet of resultVsSetList) {
    const $vsSet = $resultVsSetTemplate.cloneNode(true);

    // 攻撃側HTML
    $vsSet.querySelector('[name=offenseParty]').innerHTML =
      pcrview.makeOffensePartyHtml(vsSet);
    // 評価HTML
    $vsSet.querySelector('[name=rating]').innerHTML =
      pcrview.makeRatingHtml(vsSet);
    // 防衛側HTML
    $vsSet.querySelector('[name=defenseParty]').innerHTML =
      pcrview.makeDefensePartyHtml(vsSet);
    // コメント入力領域
    $vsSet.querySelector('[name=commentArea]').value = vsSet.comment;
    // コメントラベル
    $vsSet.querySelector('[name=commentLabel]').innerText = vsSet.comment;
    // 作成ユーザーHTML
    $vsSet.querySelector('[name=touchUser]').innerHTML =
      pcrview.makeTouchUserHtml(vsSet);
    // 作成日時HTML
    $vsSet.querySelector('[name=touchDate]').innerHTML =
      pcrview.makeTouchDateHtml(vsSet);

    $resultVsSetList.appendChild($vsSet);
  }

  // 各検索結果間のパディング設定
  const $resultVsSetRecList =
    $resultVsSetList.querySelectorAll('[name=resultVsSetRec]');
  $resultVsSetRecList.forEach(($vsSet, index) => {
    if (index === 0) {
      $vsSet.classList.add('is-first');
    } else {
      $vsSet.classList.add('is-followers');
    }
  });
};

// 検索結果メッセージHTML構築
pcrview.buildResultMessageHtml = function() {
  const FUNC_NAME = 'pcrview.buildResultMessageHtml';

  const vsSetList = pcrnote.gVsSetTable.getAllData();
  const errMsg = pcrnote.gVsSetTable.getErrorMessage();
  const searchResult = pcrnote.gVsSetTable.getResult();
  const filtering = searchResult.filtering;
  const displayedNum = searchResult.limitedList.length;
  const totalNum = searchResult.totalNum;

  let resultMsg = undefined;
  // エラーが発生した場合
  if (errMsg !== '') {
    resultMsg = errMsg;
  // 対戦情報テーブルにデータが1件もない場合
  } else if (vsSetList.length === 0) {
    resultMsg = pcrnote.gConfigData.clientServerMode ?
      pcrmsg.getN(FUNC_NAME, 0) : pcrmsg.getN(FUNC_NAME, 1);
  // 検索未実行
  } else if (!filtering) {
    resultMsg = pcrmsg.getN(FUNC_NAME, 2);
  // 検索結果が0件
  } else if (totalNum === 0) {
    resultMsg = pcrmsg.getN(FUNC_NAME, 3);
  // 検索結果有(検索結果が表示上限数を超えている)
  } else if (displayedNum < totalNum) {
    resultMsg = pcrutil.buildMessage(
      pcrmsg.getN(FUNC_NAME, 4), displayedNum, totalNum
    );
  // 検索結果有(検索結果が表示上限数以内)
  } else {
    resultMsg = pcrutil.buildMessage(pcrmsg.getN(FUNC_NAME, 5), displayedNum);
  }
  $_('#resultMessage').innerText = resultMsg;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// メニュー部色付け
pcrview.colorMenu = function() {
  const isNewTabOn = pcrnote.gViewController.isNewTabOn();
  const isSearchTabOn = pcrnote.gViewController.isSearchTabOn();
  const $startNewRegist = $_('#startNewRegist');
  $startNewRegist.classList.toggle('is-selected', isNewTabOn);
  $startNewRegist.classList.toggle('is-noselected', !isNewTabOn);
  const $startUnitSearch = $_('#startUnitSearch')
  $startUnitSearch.classList.toggle('is-selected', isSearchTabOn);
  $startUnitSearch.classList.toggle('is-noselected', !isSearchTabOn);
};

// 新規登録部色付け
pcrview.colorNewVsSet = function() {
  const isNewTabOffenseOn = pcrnote.gViewController.isNewTabOffenseOn();
  const isNewTabDefenseOn = pcrnote.gViewController.isNewTabDefenseOn();
  const $vsSet = $_('#newVsSet');
  const $offenseParty = $vsSet.querySelector('[name=offenseParty]');
  $offenseParty.classList.toggle('is-selected', isNewTabOffenseOn);
  $offenseParty.classList.toggle('is-noselected', !isNewTabOffenseOn);
  const $offensePartyTag = $vsSet.querySelector('[name=offensePartyTag]');
  $offensePartyTag.classList.toggle('is-selected', isNewTabOffenseOn);
  $offensePartyTag.classList.toggle('is-noselected', !isNewTabOffenseOn);
  const $defenseParty = $vsSet.querySelector('[name=defenseParty]');
  $defenseParty.classList.toggle('is-selected', isNewTabDefenseOn);
  $defenseParty.classList.toggle('is-noselected', !isNewTabDefenseOn);
  const $defensePartyTag = $vsSet.querySelector('[name=defensePartyTag]');
  $defensePartyTag.classList.toggle('is-selected', isNewTabDefenseOn);
  $defensePartyTag.classList.toggle('is-noselected', !isNewTabDefenseOn);
};

// ユニット検索部色付け
pcrview.colorSearchVsSet = function() {
  const isSearchTabOffenseOn = pcrnote.gViewController.isSearchTabOffenseOn();
  const isSearchTabDefenseOn = pcrnote.gViewController.isSearchTabDefenseOn();
  const $vsSet = $_('#searchVsSet');
  const $offenseParty = $vsSet.querySelector('[name=offenseParty]');
  $offenseParty.classList.toggle('is-selected', isSearchTabOffenseOn);
  $offenseParty.classList.toggle('is-noselected', !isSearchTabOffenseOn);
  const $offensePartyTag = $vsSet.querySelector('[name=offensePartyTag]');
  $offensePartyTag.classList.toggle('is-selected', isSearchTabOffenseOn);
  $offensePartyTag.classList.toggle('is-noselected', !isSearchTabOffenseOn);
  const $defenseParty = $vsSet.querySelector('[name=defenseParty]');
  $defenseParty.classList.toggle('is-selected', isSearchTabDefenseOn);
  $defenseParty.classList.toggle('is-noselected', !isSearchTabDefenseOn);
  const $defensePartyTag = $vsSet.querySelector('[name=defensePartyTag]');
  $defensePartyTag.classList.toggle('is-selected', isSearchTabDefenseOn);
  $defensePartyTag.classList.toggle('is-noselected', !isSearchTabDefenseOn);

  // 切り替えボタンの有効化、無効化の表示切り替え
  const $buttons = $vsSet.querySelectorAll('[name=switchVsSet]');
  const currSlotNum = pcrnote.gSearchVsSet.currSlotNum;
  const isFirstSlot = (currSlotNum === 0);
  const isLastSlot =
    (currSlotNum === pcrnote.gConfigData.numOfSearchPartySlots - 1);
  $buttons[0].classList.toggle('is-disabled', isFirstSlot);
  $buttons[1].classList.toggle('is-disabled', isLastSlot);
};

// ユニット一覧部色付け
pcrview.colorUnitCatalog = function() {
  const isNewTabOffenseOn = pcrnote.gViewController.isNewTabOffenseOn();
  const isNewTabDefenseOn = pcrnote.gViewController.isNewTabDefenseOn();
  const isSearchTabOffenseOn = pcrnote.gViewController.isSearchTabOffenseOn();
  const isSearchTabDefenseOn = pcrnote.gViewController.isSearchTabDefenseOn();

  const $unitCatalog = $_('#unitCatalog');
  $unitCatalog.classList.toggle('for-new-offense', isNewTabOffenseOn);
  $unitCatalog.classList.toggle('for-new-defense', isNewTabDefenseOn);
  $unitCatalog.classList.toggle('for-search-offense', isSearchTabOffenseOn);
  $unitCatalog.classList.toggle('for-search-defense', isSearchTabDefenseOn);

  const $unitCatalogItemList =
    $unitCatalog.querySelectorAll('[name=unitCatalogItem]');
  $unitCatalogItemList.forEach(($unitCatalogItem) => {
    const unitID = $unitCatalogItem.querySelector('[name=unitID]').textContent;
    const $unitImage = $unitCatalogItem.querySelector('[name=unitImage]');

    // 選択中の編成を取得
    let targetParty = undefined;
    if (isNewTabOffenseOn) {
      targetParty = pcrnote.gNewVsSet.offenseParty;
    } else if (isNewTabDefenseOn) {
      targetParty = pcrnote.gNewVsSet.defenseParty;
    } else if (isSearchTabOffenseOn) {
      targetParty = pcract.getOffenseParty(pcrnote.gSearchVsSet);
    } else if (isSearchTabDefenseOn) {
      targetParty = pcract.getDefenseParty(pcrnote.gSearchVsSet);
    }
    // 対象ユニットが選択中の編成に含まれているかチェック
    const isSelectedUnit = targetParty.includes(unitID);

    $unitImage.classList.toggle('is-selected', isSelectedUnit);
    $unitImage.classList.toggle('is-noselected', !isSelectedUnit);
    $unitCatalogItem.classList.toggle('is-selected', isSelectedUnit);
    $unitCatalogItem.classList.toggle('is-noselected', !isSelectedUnit);
  });
};

// 検索結果一覧部色付け
pcrview.colorResultVsSetList = function() {
  const $resultVsSetRecList =
    $_('#resultVsSetList').querySelectorAll('[name=resultVsSetRec]');
  $resultVsSetRecList.forEach(($vsSet) => {
    const $offenseParty = $vsSet.querySelector('[name=offenseParty]');
    $offenseParty.classList.toggle('is-selected', true);
    const $offensePartyTag = $vsSet.querySelector('[name=offensePartyTag]');
    $offensePartyTag.classList.toggle('is-selected', true);
    const $defenseParty = $vsSet.querySelector('[name=defenseParty]');
    $defenseParty.classList.toggle('is-selected', true);
    const $defensePartyTag = $vsSet.querySelector('[name=defensePartyTag]');
    $defensePartyTag.classList.toggle('is-selected', true);
  });
};

// 検索結果メッセージ部色付け
pcrview.colorResultMessage = function() {
  const errMsg = pcrnote.gVsSetTable.getErrorMessage();
  $_('#resultMessage').classList.toggle('is-error', errMsg !== '');
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 常駐領域の表示を切り替え
pcrview.refreshCurrentTimeID_ = undefined;
pcrview.showResident = function() {
  if (!pcrnote.gViewController.isPageConfig()) {
    throw pcrutil.makeError(pcrmsg.get('fatalError'));
  }

  // 現在時刻を更新
  const refreshCurrentTime = () => {
    const formatter = new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_RESIDENT_CURRENT_TIME);
    const nowStr = formatter.format(new Date());
    $_('#currentTime').textContent = nowStr;

    // ついでに経過時間も更新
    refreshElapsedTime();
  };
  // 経過時間を更新
  const refreshElapsedTime = () => {
    if (!pcrutil.isVisibleHtmlElement($_('#elapsedTime'))) return;
    const formatter1 = new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_RESIDENT_PICKED_TIME);
    const formatter2 = new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_RESIDENT_ELAPSED_TIME);
    // 計測開始時刻を取得
    const pickedTime = formatter1.parse($_('#pickedTime').textContent);
    // 計測開始時刻から現在時刻までの差分を取得
    const deltaTime = new Date(new Date().getTime() - pickedTime.getTime());
    const elapsedTimeStr = formatter2.formatUTC(deltaTime);
    $_('#elapsedTime').textContent = elapsedTimeStr;
  };

  // 現在時刻の表示を切り替え
  if ($_('#displayCurrentTime').checked) {
    if (pcrview.refreshCurrentTimeID_ !== undefined) {
      throw pcrutil.makeError(pcrmsg.get('fatalError'));
    }
    pcrutil.showHtmlElement($_('#pageResident'));
    // 現在時刻の繰り返し更新開始
    pcrview.refreshCurrentTimeID_ =
      setInterval(refreshCurrentTime, pcrdef.REFRESH_CURRENT_TIME_FREQUENCY);
  } else {
    pcrutil.hideHtmlElement($_('#pageResident'));
    // 現在時刻の繰り返し更新停止
    clearInterval(pcrview.refreshCurrentTimeID_);
    pcrview.refreshCurrentTimeID_ = undefined;
  }
};

// ページの表示を切り替え
pcrview.showPage = function() {
  if (pcrnote.gViewController.isPageConfig()) {
    pcrutil.showHtmlElement($_('#pageConfig'));
    pcrutil.hideHtmlElement($_('#pageContent'));
  } else if (pcrnote.gViewController.isPageContent()) {
    pcrutil.hideHtmlElement($_('#pageConfig'));
    pcrutil.showHtmlElement($_('#pageContent'));
  } else {
    throw pcrutil.makeError(pcrmsg.get('fatalError'));
  }
};

// メニュー部の表示を切り替え
pcrview.showMenu = function() {
  if (pcrnote.gConfigData.clientServerMode) {
    pcrutil.hideHtmlElement($_('#groupOfImportDataFromFile'));
    pcrutil.showHtmlElement($_('#syncDataWithServer'));
  } else {
    pcrutil.showHtmlElement($_('#groupOfImportDataFromFile'));
    pcrutil.hideHtmlElement($_('#syncDataWithServer'));
  }
};

// 新規登録部の表示を切り替え
pcrview.showNewTab = function() {
  if (pcrnote.gViewController.isNewTabOn()) {
    pcrutil.showHtmlElement($_('#sectionNew'));
  } else {
    pcrutil.hideHtmlElement($_('#sectionNew'));
  }
};

// ユニット検索部の表示を切り替え
pcrview.showSearchTab = function() {
  if (pcrnote.gViewController.isSearchTabOn()) {
    pcrutil.showHtmlElement($_('#sectionSearch'));
  } else {
    pcrutil.hideHtmlElement($_('#sectionSearch'));
  }
};

// ユニット一覧部の表示を切り替え
pcrview.showUnitCatalog = function() {
  if (
    pcrnote.gViewController.isNewTabOn() ||
    pcrnote.gViewController.isSearchTabOn()
  ) {
    pcrutil.showHtmlElement($_('#sectionUnitCatalog'));
  } else {
    pcrutil.hideHtmlElement($_('#sectionUnitCatalog'));
    return;
  }

  const $unitCatalog = $_('#unitCatalog');
  const $flatPanel = $unitCatalog.querySelector('[name=flatPanel]');
  const $tieredPanel = $unitCatalog.querySelector('[name=tieredPanel]');
  const $activePanel =
    !pcrnote.gConfigData.tierUnitCatalog ? $flatPanel : $tieredPanel;
  const $pcUnitCatalogList =
    $activePanel.querySelectorAll('[name=pcUnitCatalog]');
  const $npcUnitCatalogList =
    $activePanel.querySelectorAll('[name=npcUnitCatalog]');

  // 平坦表示
  if (!pcrnote.gConfigData.tierUnitCatalog) {
    pcrutil.showHtmlElement($flatPanel);
    pcrutil.hideHtmlElement($tieredPanel);
  // 段階表示
  } else {
    pcrutil.hideHtmlElement($flatPanel);
    pcrutil.showHtmlElement($tieredPanel);
  }

  // アリーナ用表示
  if (
    pcrnote.gViewController.isUsedForArena() ||
    pcrnote.gViewController.isNewTabOffenseOn() ||
    pcrnote.gViewController.isSearchTabOffenseOn()
  ) {
    $pcUnitCatalogList.forEach(
      ($pcUnitCatalog) => pcrutil.showHtmlElement($pcUnitCatalog)
    );
    $npcUnitCatalogList.forEach(
      ($npcUnitCatalog) => pcrutil.hideHtmlElement($npcUnitCatalog)
    );
  // クラバト用表示
  } else {
    $pcUnitCatalogList.forEach(
      ($pcUnitCatalog) => pcrutil.hideHtmlElement($pcUnitCatalog)
    );
    $npcUnitCatalogList.forEach(
      ($npcUnitCatalog) => pcrutil.showHtmlElement($npcUnitCatalog)
    );
  }
};

// 検索結果一覧部の表示を切り替え
pcrview.showResultVsSetList = function() {
  const $sectionResult = $_('#sectionResult');
  const vsSetList = pcrnote.gVsSetTable.getAllData();
  const errMsg = pcrnote.gVsSetTable.getErrorMessage();
  const searchResult = pcrnote.gVsSetTable.getResult();
  const filtering = searchResult.filtering;
  const totalNum = searchResult.totalNum;

  // エラーが発生した場合
  if (errMsg !== '') {
    pcrutil.hideHtmlElement($sectionResult);
  // 対戦情報テーブルにデータが1件もない場合
  } else if (vsSetList.length === 0) {
    pcrutil.hideHtmlElement($sectionResult);
  // 検索未実行
  } else if (!filtering) {
    pcrutil.hideHtmlElement($sectionResult);
  // 検索結果が0件
  } else if (totalNum === 0) {
    pcrutil.hideHtmlElement($sectionResult);
  // 検索結果有
  } else {
    pcrutil.showHtmlElement($sectionResult);
  }
};

// 検索結果一覧の表示方法を切り替え
pcrview.switchResultVsSetViewStyle = function() {
  const $resultVsSetRecList = $$_('#resultVsSetList [name=resultVsSetRec]');
  // name="vsSetPanelSimple vsSetPanelNormal"と両方を持つ要素用に~=を使用
  switch (pcrnote.gViewController.viewStyle) {
  case pcrdef.ViewController.VIEW_STYLE_MINIMUM:
    $resultVsSetRecList.forEach(($vsSet) => {
      $vsSet.querySelectorAll('[name~=vsSetPanelSimple]').forEach(($panel) => {
        pcrutil.hideHtmlElement($panel);
      });
      $vsSet.querySelectorAll('[name~=vsSetPanelNormal]').forEach(($panel) => {
        pcrutil.hideHtmlElement($panel);
      });
    });
    break;
  case pcrdef.ViewController.VIEW_STYLE_SIMPLE:
    $resultVsSetRecList.forEach(($vsSet) => {
      $vsSet.querySelectorAll('[name~=vsSetPanelSimple]').forEach(($panel) => {
        pcrutil.showHtmlElement($panel);
      });
      $vsSet.querySelectorAll('[name=vsSetPanelNormal]').forEach(($panel) => {
        pcrutil.hideHtmlElement($panel);
      });
    });
    break;
  case pcrdef.ViewController.VIEW_STYLE_NORMAL:
    $resultVsSetRecList.forEach(($vsSet) => {
      $vsSet.querySelectorAll('[name=vsSetPanelSimple]').forEach(($panel) => {
        pcrutil.hideHtmlElement($panel);
      });
      $vsSet.querySelectorAll('[name~=vsSetPanelNormal]').forEach(($panel) => {
        pcrutil.showHtmlElement($panel);
      });
    });
    break;
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// メニュー部の画面更新
pcrview.refreshMenu = function() {
  pcrview.showMenu();
  pcrview.setLabelOfSyncDataWithServer();
  pcrview.setUsedForLabel();
  pcrview.colorMenu();
};

// 新規登録部の画面更新
pcrview.refreshNewVsSet = function() {
  pcrview.showNewTab();
  if (pcrnote.gViewController.isNewTabOn()) {
    pcrview.buildNewVsSetHtml();
    pcrview.colorNewVsSet();
    pcrevent.addEventListenerOnNewVsSet();
  }
};

// ユニット検索部の画面更新
pcrview.refreshSearchVsSet = function() {
  pcrview.showSearchTab();
  if (pcrnote.gViewController.isSearchTabOn()) {
    pcrview.buildSearchVsSetHtml();
    pcrview.colorSearchVsSet();
    pcrevent.addEventListenerOnSearchVsSet();
  }
};

// ユニット一覧部の画面更新
pcrview.refreshUnitCatalog = function() {
  pcrview.showUnitCatalog();
  if (
    pcrnote.gViewController.isNewTabOn() ||
    pcrnote.gViewController.isSearchTabOn()
  ) {
    pcrview.colorUnitCatalog();
  }
};

// 検索結果一覧部の画面更新
pcrview.refreshResultVsSetList = function() {
  pcrview.showResultVsSetList();
  pcrview.buildResultVsSetListHtml();
  pcrview.switchResultVsSetViewStyle();
  pcrview.colorResultVsSetList();
  pcrevent.addEventListenerOnResultVsSetList();
};

// 検索結果制御部の画面更新
pcrview.refreshResultControl = function() {
  pcrview.setViewStyleLabel();
  $_('#compareFunc').value = pcrnote.gViewController.compareFunc;
  $_('#orderBy').value = pcrnote.gViewController.orderBy;
};

// 検索結果メッセージ部の画面更新
pcrview.refreshResultMessage = function() {
  pcrview.buildResultMessageHtml();
  pcrview.colorResultMessage();
};

// コンテンツ画面の更新
pcrview.refreshContentView = function() {
  // コンテンツ画面の表示
  if (pcrnote.gViewController.isPageContent()) {
    pcrview.showPage();
  } else {
    throw pcrutil.makeError(pcrmsg.get('fatalError'));
  }

  //console.time('描画時間');

  const refreshFlags = pcrnote.gContentViewRefreshObserver.getRefreshFlags();
  // メニュー部の画面更新
  if (refreshFlags & pcrdef.ContentViewRefreshFlags.REFRESH_MENU) {
    pcrview.refreshMenu();
  }
  // 入力部の画面更新
  if (refreshFlags & pcrdef.ContentViewRefreshFlags.REFRESH_INPUT) {
    pcrview.refreshNewVsSet();
    pcrview.refreshSearchVsSet();
    pcrview.refreshUnitCatalog();
  }
  // 検索結果部の画面更新
  if (refreshFlags & pcrdef.ContentViewRefreshFlags.REFRESH_RESULT) {
    pcrview.refreshResultVsSetList();
    pcrview.refreshResultControl();
    pcrview.refreshResultMessage();
  }
  pcrnote.gContentViewRefreshObserver.updateStates();

  //console.timeEnd('描画時間');
};

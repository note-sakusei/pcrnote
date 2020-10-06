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

  switch (pcrnote.gVsSetTable.getImportState()) {
  case pcrdef.VsSetTableImportState.SYNC:
    $('#syncDataWithServer').html(pcrmsg.getN(FUNC_NAME, 0));
    break;
  case pcrdef.VsSetTableImportState.ASYNC:
    $('#syncDataWithServer').html(pcrmsg.getN(FUNC_NAME, 1));
    break;
  case pcrdef.VsSetTableImportState.WHILE_SYNC:
    $('#syncDataWithServer').html(pcrmsg.getN(FUNC_NAME, 2));
    break;
  }
};

// 用途ボタンのラベルを設定
pcrview.setUsedForLabel = function() {
  const FUNC_NAME = 'pcrview.setUsedForLabel';

  switch (pcrnote.gViewController.usedFor) {
  case pcrdef.ViewController.USED_FOR_ARENA:
    $('#switchUsedFor').html(pcrmsg.getN(FUNC_NAME, 0));
    break;
  case pcrdef.ViewController.USED_FOR_CLANBATTLE:
    $('#switchUsedFor').html(pcrmsg.getN(FUNC_NAME, 1));
    break;
  }
};

// 検索結果一覧の表示方法ボタンのラベルを設定
pcrview.setViewStyleLabel = function() {
  const FUNC_NAME = 'pcrview.setViewStyleLabel';

  const $viewStyle = $('#switchViewStyle');
  switch (pcrnote.gViewController.viewStyle) {
  case pcrdef.ViewController.VIEW_STYLE_MINIMUM:
    $viewStyle.html(pcrmsg.getN(FUNC_NAME, 0));
    break;
  case pcrdef.ViewController.VIEW_STYLE_SIMPLE:
    $viewStyle.html(pcrmsg.getN(FUNC_NAME, 1));
    break;
  case pcrdef.ViewController.VIEW_STYLE_NORMAL:
    $viewStyle.html(pcrmsg.getN(FUNC_NAME, 2));
    break;
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// jQueryオブジェクトで作成すると遅くなるので、頻繁に呼び出される部分はHTMLで作成

// ユニット情報(ID、名称、画像)HTML作成
pcrview.UNIT_INFO_TEMPLATE_HTML_ = undefined;
pcrview.makeUnitInfoHtml = function(unitInfo) {
  if (pcrview.UNIT_INFO_TEMPLATE_HTML_ === undefined) {
    pcrview.UNIT_INFO_TEMPLATE_HTML_ = $('#unitInfoTemplate').html();
  }
  const escUnitImageURL =
    unitInfo.imageURL.replace('(', '\\(').replace(')', '\\)');
  const unitNameTitle = `title="${unitInfo.unitName}"`;
  const bgImageStyle = `style="background-image: url(${escUnitImageURL});"`;
  const html = pcrview.UNIT_INFO_TEMPLATE_HTML_
    .replace('<!--UNIT_ID-->', unitInfo.unitID)
    .replace('<!--UNIT_NAME-->', unitInfo.unitName)
    .replace('title="UNIT_NAME"', unitNameTitle)
    .replace('style="background-image: none;"', bgImageStyle);
  return html;
};

// 編成用ワイルドカードHTML作成
pcrview.UNIT_WILDCARD_TEMPLATE_HTML_ = undefined;
pcrview.makeUnitWildcardHtml = function() {
  if (pcrview.UNIT_WILDCARD_TEMPLATE_HTML_ === undefined) {
    pcrview.UNIT_WILDCARD_TEMPLATE_HTML_ = $('#unitWildcardTemplate').html();
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
    pcrview.OFFENSE_PARTY_TEMPLATE_HTML_ = $('#offensePartyTemplate').html();
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
    pcrview.DEFENSE_PARTY_TEMPLATE_HTML_ = $('#defensePartyTemplate').html();
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
    pcrview.RATING_TEMPLATE_HTML_ = $('#ratingTemplate').html();
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
  return vsSet.createUser.replace(/\s/g, '');
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
    throw pcrutil.makeError(pcrmsg.build('illegalArgument', 'index'));
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
  html += `<option value="rebuild">${pcrmsg.getN(FUNC_NAME, 1)}</option>`;

  $('#hashtag1').html(html);
  $('#hashtag1').val('');
  $('#hashtag2').html(html);
  $('#hashtag2').val('');
};

// 新規登録HTML構築
pcrview.buildNewVsSetHtml = function() {
  const $vsSet = $('#newVsSet');
  // 攻撃側HTML
  $vsSet.find('[name=offenseParty]').html(
    pcrview.makeOffensePartyHtml(pcrnote.gNewVsSet)
  );
  // 防衛側HTML
  $vsSet.find('[name=defenseParty]').html(
    pcrview.makeDefensePartyHtml(pcrnote.gNewVsSet)
  );
  // 評価HTML
  $vsSet.find('[name=rating]').html(
    pcrview.makeRatingHtml(pcrnote.gNewVsSet)
  );
  // コメント入力領域
  $vsSet.find('[name=commentArea]').val(
    pcrnote.gNewVsSet.comment
  );
};

// ユニット検索HTML構築
pcrview.buildSearchVsSetHtml = function() {
  const $vsSet = $('#searchVsSet');
  // 攻撃側HTML
  $vsSet.find('[name=offenseParty]').html(
    pcrview.makeOffensePartyHtml(pcrnote.gSearchVsSet)
  );
  // 防衛側HTML
  $vsSet.find('[name=defenseParty]').html(
    pcrview.makeDefensePartyHtml(pcrnote.gSearchVsSet)
  );
  // コメント入力領域
  $vsSet.find('[name=commentArea]').val(
    pcrnote.gSearchVsSet.comment
  );
  // 現在のスロット番号HTML
  $vsSet.find('[name=currSlotNum]').html(
    pcrview.makeCurrSlotNumHtml()
  );
  // 切り替えボタンのラベルを変更
  $('#searchVsSet [name=switchVsSet]').each((index, buttonDom) => {
    $(buttonDom).html(
      pcrview.makeSwitchButtonLabelHtml(pcrnote.gSearchVsSet, index)
    );
  });
};

// ユニット一覧HTML構築
pcrview.buildUnitCatalogHtml = function() {
  const $unitCatalogItemTemplate = $('#unitCatalogItemTemplate');
  $('#unitCatalog').empty();
  const unitInfoList = pcrnote.gUnitInfoTable.getAllData();
  for (const unitInfo of unitInfoList) {
    const $unitCatalogItem = $unitCatalogItemTemplate.children().clone();
    $unitCatalogItem.html(pcrview.makeUnitInfoHtml(unitInfo));
    $('#unitCatalog').append($unitCatalogItem);
  }
};

// 検索結果一覧HTML構築
pcrview.buildResultVsSetListHtml = function() {
  const $resultVsSetTemplate = $('#resultVsSetTemplate').children();
  const resultVsSetList = pcrnote.gVsSetTable.getResult().limitedList;
  $('#resultVsSetList').empty();
  for (const vsSet of resultVsSetList) {
    const $vsSet = $resultVsSetTemplate.clone();

    // 攻撃側HTML
    $vsSet.find('[name=offenseParty]').html(
      pcrview.makeOffensePartyHtml(vsSet)
    );
    // 評価HTML
    $vsSet.find('[name=rating]').html(
      pcrview.makeRatingHtml(vsSet)
    );
    // 防衛側HTML
    $vsSet.find('[name=defenseParty]').html(
      pcrview.makeDefensePartyHtml(vsSet)
    );
    // コメント入力領域
    $vsSet.find('[name=commentArea]').val(
      vsSet.comment
    );
    // コメントラベル
    $vsSet.find('[name=commentLabel]').text(
      vsSet.comment
    );
    // 作成ユーザーHTML
    $vsSet.find('[name=touchUser]').html(
      pcrview.makeTouchUserHtml(vsSet)
    );
    // 作成日時HTML
    $vsSet.find('[name=touchDate]').html(
      pcrview.makeTouchDateHtml(vsSet)
    );

    $('#resultVsSetList').append($vsSet);
  }

  // 検索結果一覧のパディング設定
  const $resultVsSetList = $('#resultVsSetList [name=resultVsSet]');
  $resultVsSetList.toggleClass('is-followers', true);
  // 最初の表示データは上側のパディング調整を行う
  $resultVsSetList.first().removeClass('is-followers').addClass('is-first');
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
    resultMsg = errMsg.replace(/\n/g, '<br>');
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
  $('#resultMessage').html(resultMsg);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// メニュー部色付け
pcrview.colorMenu = function() {
  const isNewTabOn = pcrnote.gViewController.isNewTabOn();
  const isSearchTabOn = pcrnote.gViewController.isSearchTabOn();
  $('#startNewRegist')
    .toggleClass('is-selected', isNewTabOn)
    .toggleClass('is-noselected', !isNewTabOn);
  $('#startUnitSearch')
    .toggleClass('is-selected', isSearchTabOn)
    .toggleClass('is-noselected', !isSearchTabOn);
};

// 新規登録部色付け
pcrview.colorNewVsSet = function() {
  const isNewTabOffenseOn = pcrnote.gViewController.isNewTabOffenseOn();
  const isNewTabDefenseOn = pcrnote.gViewController.isNewTabDefenseOn();
  const $newVsSet = $('#newVsSet');
  $newVsSet.find('[name=offenseParty]')
    .toggleClass('is-selected', isNewTabOffenseOn)
    .toggleClass('is-noselected', !isNewTabOffenseOn);
  $newVsSet.find('[name=offensePartyTag]')
    .toggleClass('is-selected', isNewTabOffenseOn)
    .toggleClass('is-noselected', !isNewTabOffenseOn);
  $newVsSet.find('[name=defenseParty]')
    .toggleClass('is-selected', isNewTabDefenseOn)
    .toggleClass('is-noselected', !isNewTabDefenseOn);
  $newVsSet.find('[name=defensePartyTag]')
    .toggleClass('is-selected', isNewTabDefenseOn)
    .toggleClass('is-noselected', !isNewTabDefenseOn);
};

// ユニット検索部色付け
pcrview.colorSearchVsSet = function() {
  const isSearchTabOffenseOn = pcrnote.gViewController.isSearchTabOffenseOn();
  const isSearchTabDefenseOn = pcrnote.gViewController.isSearchTabDefenseOn();
  const $searchVsSet = $('#searchVsSet');
  $searchVsSet.find('[name=offenseParty]')
    .toggleClass('is-selected', isSearchTabOffenseOn)
    .toggleClass('is-noselected', !isSearchTabOffenseOn);
  $searchVsSet.find('[name=offensePartyTag]')
    .toggleClass('is-selected', isSearchTabOffenseOn)
    .toggleClass('is-noselected', !isSearchTabOffenseOn);
  $searchVsSet.find('[name=defenseParty]')
    .toggleClass('is-selected', isSearchTabDefenseOn)
    .toggleClass('is-noselected', !isSearchTabDefenseOn);
  $searchVsSet.find('[name=defensePartyTag]')
    .toggleClass('is-selected', isSearchTabDefenseOn)
    .toggleClass('is-noselected', !isSearchTabDefenseOn);

  // 切り替えボタンの有効化、無効化の表示切り替え
  const $prevButton = $searchVsSet.find('[name=switchVsSet]').eq(0);
  const $nextButton = $searchVsSet.find('[name=switchVsSet]').eq(1);
  const currSlotNum = pcrnote.gSearchVsSet.currSlotNum;
  const isFirstSlot = (currSlotNum === 0);
  const isLastSlot =
    (currSlotNum === pcrnote.gConfigData.numOfSearchPartySlots - 1);
  $prevButton.toggleClass('is-disabled', isFirstSlot);
  $nextButton.toggleClass('is-disabled', isLastSlot);
};

// ユニット一覧部色付け
pcrview.colorUnitCatalog = function() {
  const isNewTabOffenseOn = pcrnote.gViewController.isNewTabOffenseOn();
  const isNewTabDefenseOn = pcrnote.gViewController.isNewTabDefenseOn();
  const isSearchTabOffenseOn = pcrnote.gViewController.isSearchTabOffenseOn();
  const isSearchTabDefenseOn = pcrnote.gViewController.isSearchTabDefenseOn();

  $('#unitCatalog')
    .toggleClass('for-new-offense', isNewTabOffenseOn)
    .toggleClass('for-new-defense', isNewTabDefenseOn)
    .toggleClass('for-search-offense', isSearchTabOffenseOn)
    .toggleClass('for-search-defense', isSearchTabDefenseOn);

  const $unitCatalogItemList = $('#unitCatalog [name=unitCatalogItem]');
  $unitCatalogItemList.each((index, unitCatalogItemDom) => {
    const $unitCatalogItem = $(unitCatalogItemDom);
    const unitID = $unitCatalogItem.find('[name=unitID]').html();
    const $unitImage = $unitCatalogItem.find('[name=unitImage]');

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

    $unitImage
      .toggleClass('is-selected', isSelectedUnit)
      .toggleClass('is-noselected', !isSelectedUnit);
    $unitCatalogItem
      .toggleClass('is-selected', isSelectedUnit)
      .toggleClass('is-noselected', !isSelectedUnit);
  });
};

// 検索結果一覧部色付け
pcrview.colorResultVsSetList = function() {
  $('#resultVsSetList [name=offenseParty]')
    .toggleClass('is-selected', true);
  $('#resultVsSetList [name=offensePartyTag]')
    .toggleClass('is-selected', true);
  $('#resultVsSetList [name=defenseParty]')
    .toggleClass('is-selected', true);
  $('#resultVsSetList [name=defensePartyTag]')
    .toggleClass('is-selected', true);
};

// 検索結果メッセージ部色付け
pcrview.colorResultMessage = function() {
  const errMsg = pcrnote.gVsSetTable.getErrorMessage();
  $('#resultMessage').toggleClass('is-error', errMsg !== '');
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// ページの表示を切り替え
pcrview.showPage = function() {
  if (pcrnote.gViewController.isPageConfig()) {
    $('#pageConfig').show();
    $('#pageContent').hide();
  } else if (pcrnote.gViewController.isPageContent()) {
    $('#pageConfig').hide();
    $('#pageContent').show();
  } else {
    throw pcrutil.makeError(pcrmsg.get('fatalError'));
  }
};

// メニュー部の表示を切り替え
pcrview.showMenu = function() {
  if (pcrnote.gConfigData.clientServerMode) {
    $('#groupOfImportDataFromFile').hide();
    $('#syncDataWithServer').show();
  } else {
    $('#groupOfImportDataFromFile').show();
    $('#syncDataWithServer').hide();
  }
};

// 新規登録部の表示を切り替え
pcrview.showNewTab = function() {
  if (pcrnote.gViewController.isNewTabOn()) {
    $('#sectionNew').show();
  } else if (pcrnote.gViewController.isSearchTabOn()) {
    $('#sectionNew').hide();
  } else {
    $('#sectionNew').hide();
  }
};

// ユニット検索部の表示を切り替え
pcrview.showSearchTab = function() {
  if (pcrnote.gViewController.isNewTabOn()) {
    $('#sectionSearch').hide();
  } else if (pcrnote.gViewController.isSearchTabOn()) {
    $('#sectionSearch').show();
  } else {
    $('#sectionSearch').hide();
  }
};

// ユニット一覧部の表示を切り替え
pcrview.showUnitCatalog = function() {
  if (
    pcrnote.gViewController.isNewTabOn() ||
    pcrnote.gViewController.isSearchTabOn()
  ) {
    $('#sectionUnitCatalog').show();
  } else {
    $('#sectionUnitCatalog').hide();
    return;
  }

  const unitInfoList = pcrnote.gUnitInfoTable.getAllData();
  const $unitCatalogItemList = $('#unitCatalog [name=unitCatalogItem]');
  // アリーナ用表示
  if (
    pcrnote.gViewController.isUsedForArena() ||
    pcrnote.gViewController.isNewTabOffenseOn() ||
    pcrnote.gViewController.isSearchTabOffenseOn()
  ) {
    $unitCatalogItemList.each((index, itemDom) => {
      unitInfoList[index].isPc ? $(itemDom).show() : $(itemDom).hide();
    });
  // クラバト用表示
  } else {
    $unitCatalogItemList.each((index, itemDom) => {
      unitInfoList[index].isPc ? $(itemDom).hide() : $(itemDom).show();
    });
  }
};

// 検索結果一覧部の表示を切り替え
pcrview.showResultVsSetList = function() {
  const $sectionResult = $('#sectionResult');
  const vsSetList = pcrnote.gVsSetTable.getAllData();
  const errMsg = pcrnote.gVsSetTable.getErrorMessage();
  const searchResult = pcrnote.gVsSetTable.getResult();
  const filtering = searchResult.filtering;
  const totalNum = searchResult.totalNum;

  // エラーが発生した場合
  if (errMsg !== '') {
    $sectionResult.hide();
  // 対戦情報テーブルにデータが1件もない場合
  } else if (vsSetList.length === 0) {
    $sectionResult.hide();
  // 検索未実行
  } else if (!filtering) {
    $sectionResult.hide();
  // 検索結果が0件
  } else if (totalNum === 0) {
    $sectionResult.hide();
  // 検索結果有
  } else {
    $sectionResult.show();
  }
};

// 検索結果一覧の表示方法を切り替え
pcrview.switchResultVsSetViewStyle = function() {
  const $resultVsSetList = $('#resultVsSetList [name=resultVsSet]');
  switch (pcrnote.gViewController.viewStyle) {
  case pcrdef.ViewController.VIEW_STYLE_MINIMUM:
    $resultVsSetList.each((index, vsSetDom) => {
      $(vsSetDom).find('[name~=vsSetPanelSimple]').hide();
      $(vsSetDom).find('[name~=vsSetPanelNormal]').hide();
    });
    break;
  case pcrdef.ViewController.VIEW_STYLE_SIMPLE:
    $resultVsSetList.each((index, vsSetDom) => {
      $(vsSetDom).find('[name~=vsSetPanelSimple]').show();
      $(vsSetDom).find('[name=vsSetPanelNormal]').hide();
    });
    break;
  case pcrdef.ViewController.VIEW_STYLE_NORMAL:
    $resultVsSetList.each((index, vsSetDom) => {
      $(vsSetDom).find('[name=vsSetPanelSimple]').hide();
      $(vsSetDom).find('[name~=vsSetPanelNormal]').show();
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
  }
};

// ユニット検索部の画面更新
pcrview.refreshSearchVsSet = function() {
  pcrview.showSearchTab();
  if (pcrnote.gViewController.isSearchTabOn()) {
    pcrview.buildSearchVsSetHtml();
    pcrview.colorSearchVsSet();
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
};

// 検索結果制御部の画面更新
pcrview.refreshResultControl = function() {
  pcrview.setViewStyleLabel();
  $('#compareFunc').val(pcrnote.gViewController.compareFunc);
  $('#orderBy').val(pcrnote.gViewController.orderBy);
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

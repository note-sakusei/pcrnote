// クライアント側コンテンツ部
// イベント処理

'use strict';

var pcrevent = pcrevent || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

pcrevent.resident = {
  currentTime: {},
  pickedTime: {},
  elapsedTime: {}
};
pcrevent.goToConfig = {};
pcrevent.importDataFromFile = {};
pcrevent.exportDataToFile = {};
pcrevent.syncDataWithServer = {};
pcrevent.switchUsedFor = {};
pcrevent.startNewRegist = {};
pcrevent.startUnitSearch = {};
pcrevent.hashtag = {};
pcrevent.newVsSet = {
  offenseParty: {},
  defenseParty: {},
  offensePartyUnit: {},
  defensePartyUnit: {},
  rating: {},
  commentArea: {},
  registVsSet: {},
  copyVsSet: {},
  clearVsSet: {}
};
pcrevent.searchVsSet = {
  offenseParty: {},
  defenseParty: {},
  offensePartyUnit: {},
  defensePartyUnit: {},
  currSlotNum: {},
  commentArea: {},
  switchVsSet: {},
  clearVsSet: {}
};
pcrevent.unitCatalog = {
  unitCatalogItem: {}
};
pcrevent.resultVsSetList = {
  rating: {},
  commentArea: {},
  copyVsSet: {},
  deleteVsSet: {}
};
pcrevent.switchViewStyle = {};
pcrevent.compareFunc = {};
pcrevent.orderBy = {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 初期化
pcrevent.init = function() {
  pcrevent.addEventListener();
};

// 経過時刻の表示
pcrevent.resident.currentTime.onDblclick = function() {
  pcrutil.showHtmlElement($_('#elapsedTime'));
  const formatter = new pcrutil.DateFormat(pcrdef.DATE_FORMAT_FOR_RESIDENT_PICKED_TIME);
  $_('#pickedTime').textContent = formatter.format(new Date());
};
// 経過時刻の非表示
pcrevent.resident.elapsedTime.onDblclick = function() {
  pcrutil.hideHtmlElement($_('#elapsedTime'));
};

// ユーザー設定ページへ遷移
pcrevent.goToConfig.onClick = function() {
  pcrnote.gViewController.switchPageConfig();
  // ユーザー名とデータベース名は保存にチェックが付いていない場合、毎回初期化
  pcrnote.gConfigData = pcrconfig.eraseVolatileConfigItems(pcrnote.gConfigData);
  pcrconfig.refreshConfigView();
};
// コンテンツページでエスケープが押された場合、ユーザー設定ページへ遷移
pcrevent.goToConfig.onKeydown = function(event) {
  if (!pcrnote.gViewController.isPageContent()) return;
  const ASCII_CODE_ESC = 27;
  if (event.keyCode !== ASCII_CODE_ESC) return;
  pcrevent.goToConfig.onClick();
};

// ファイルから読み込み
pcrevent.importDataFromFile.onChange = function() {
  pcrnote.gVsSetTable.importDataFromFile(
    this.files[0],
    () => {
      pcrview.buildHashtagSelectBox();
      pcract.sortVsSetTable();
      pcract.filterVsSetTable();
      pcrview.refreshContentView();
    },
    () => {
      pcrview.refreshContentView();
    }
  );
};

// ファイルに保存
pcrevent.exportDataToFile.onClick = function() {
  const FUNC_NAME = 'pcrevent.exportDataToFile.onClick';

  const selectedFileType = pcrutil.getSelectBoxState($_('#fileType')).value;
  // 対戦情報一覧をファイルに保存
  if (
    selectedFileType === pcrdef.FileType.JSON ||
    selectedFileType === pcrdef.FileType.CSV
  ) {
    const vsSetList = pcrnote.gVsSetTable.getAllData();
    if (vsSetList.length === 0) {
      pcrutil.popup(pcrmsg.getN(FUNC_NAME, 0));
      return;
    }
    pcrutil.popup(
      pcrmsg.getN(FUNC_NAME, 1),
      () => pcrnote.gVsSetTable.exportDataToFile(selectedFileType)
    );
  // 現在の入力状態をクッキーに保存
  } else if (selectedFileType === pcrdef.FileType.TEMP) {
    if (!pcrnote.gConfigData.saveCookie) {
      pcrutil.popup(pcrmsg.getN(FUNC_NAME, 2));
      return;
    }
    pcract.saveInputStateToCookie();
    pcrutil.popup(pcrmsg.getN(FUNC_NAME, 3));
  } else {
    throw pcrutil.makeError(pcrmsg.get('fatalError'));
  }
};

// サーバーと同期、更新確定
pcrevent.syncDataWithServer.onClick = function() {
  const FUNC_NAME = 'pcrevent.syncDataWithServer.onClick';

  // 同期(サーバーからデータ取得)
  if (pcrnote.gVsSetTable.isImportDataSync()) {
    pcrnote.gVsSetTable.importDataFromServer(
      // 成功時後処理
      () => {
        pcrview.buildHashtagSelectBox();
        pcract.sortVsSetTable();
        pcract.filterVsSetTable();
        pcrview.refreshContentView();
      },
      // 失敗時後処理
      () => {
        pcrview.refreshContentView();
      }
    );
    pcrview.refreshContentView();
  // 更新確定(サーバーに更新データ送信)
  } else if (pcrnote.gVsSetTable.isImportDataAsync()) {
    pcrnote.gVsSetTable.exportDataToServer(
      // 成功時後処理
      () => {
        pcrutil.popup(pcrmsg.getN(FUNC_NAME, 0));
        pcrview.refreshContentView();
      },
      // 失敗時後処理
      () => {
        pcrutil.popup(pcrmsg.getN(FUNC_NAME, 1));
        pcrview.refreshContentView();
      }
    );
    pcrview.refreshContentView();
  // 同期中なので何もしない
  } else if (pcrnote.gVsSetTable.isImportDataWhileSync()) {
    //
  }
};

// 用途の切り替え
pcrevent.switchUsedFor.onClick = function() {
  pcrnote.gViewController.switchUsedFor();
  pcract.filterVsSetTable();
  pcrview.refreshContentView();
};

// 新規登録開始
pcrevent.startNewRegist.onClick = function() {
  if (pcrnote.gViewController.isNewTabOn()) {
    pcrnote.gViewController.switchNewTabOff();
  } else {
    pcrnote.gViewController.switchNewTabOn();
  }
  pcrview.refreshContentView();
};

// ユニット検索開始
pcrevent.startUnitSearch.onClick = function() {
  if (pcrnote.gViewController.isSearchTabOn()) {
    pcrnote.gViewController.switchSearchTabOff();
  } else {
    pcrnote.gViewController.switchSearchTabOn();
  }
  pcrview.refreshContentView();
};

// ハッシュタグ切り替え
pcrevent.hashtag.onChange = function() {
  const hashtag1 = pcrutil.getSelectBoxState($_('#hashtag1')).value;
  const hashtag2 = pcrutil.getSelectBoxState($_('#hashtag2')).value;
  if (hashtag1 === '[rebuild]' || hashtag2 === '[rebuild]') {
    pcrview.buildHashtagSelectBox();
  }
  pcract.filterVsSetTable();
  pcrview.refreshContentView();
};

// 新規登録部の攻撃側、防衛側タブ切り替え
pcrevent.newVsSet.offenseParty.onClick = function() {
  pcrnote.gViewController.switchNewTabOn(0);
  pcrview.refreshContentView();
};
pcrevent.newVsSet.defenseParty.onClick = function() {
  pcrnote.gViewController.switchNewTabOn(1);
  pcrview.refreshContentView();
};

// 新規登録部の選択ユニットの更新(追加したユニットから操作)
pcrevent.newVsSet.offensePartyUnit.onClick = function() {
  const unitIndex = pcrutil.indexOfHtmlElement(
    $$_('#newVsSet [name=offensePartyUnit]'), this
  );
  const offenseParty = pcrnote.gNewVsSet.offenseParty;
  const unitID = offenseParty[offenseParty.length - 1 - unitIndex];
  if (unitID !== '') {
    pcract.toggleUnitSelection(pcrnote.gNewVsSet.offenseParty, unitID);
  }
  //pcrview.refreshContentView(); 画面更新は親要素で行っている
};
pcrevent.newVsSet.defensePartyUnit.onClick = function() {
  const unitIndex = pcrutil.indexOfHtmlElement(
    $$_('#newVsSet [name=defensePartyUnit]'), this
  );
  const defenseParty = pcrnote.gNewVsSet.defenseParty;
  const unitID = defenseParty[defenseParty.length - 1 - unitIndex];
  if (unitID !== '') {
    pcract.toggleUnitSelection(pcrnote.gNewVsSet.defenseParty, unitID);
  }
  //pcrview.refreshContentView(); 画面更新は親要素で行っている
};

// 新規登録部の評価値の更新
pcrevent.newVsSet.rating.onClick = function(event) {
  const elemRect = this.getBoundingClientRect();
  const clickPos = pcrutil.getClickPosOnHtmlElement(this, event);

  pcract.raiseOrLowerRating(pcrnote.gNewVsSet, elemRect, clickPos);

  // 負荷を避けるため評価部のみ直接画面更新
  this.innerHTML = pcrview.makeRatingHtml(pcrnote.gNewVsSet);
};

// 新規登録部のコメントの更新
pcrevent.newVsSet.commentArea.onChange = function() {
  const $commentArea = $_('#newVsSet [name=commentArea]');
  const newComment = $commentArea.value.trimEnd();
  $commentArea.value = newComment;
  pcrnote.gNewVsSet.comment = newComment;
};

// 新規登録
pcrevent.newVsSet.registVsSet.onClick = function() {
  const FUNC_NAME = 'pcrevent.newVsSet.registVsSet.onClick';

  // チェックと確認
  // 1つ目
  // 防衛側にユニットを1人でも設定しているかチェック
  const firstCheck = () => {
    return new Promise((nextCheck) => {
      const numOfDefenseUnits =
        pcrnote.gNewVsSet.defenseParty.filter((elem) => elem !== '').length;
      if (numOfDefenseUnits === 0) {
        pcrutil.popup(pcrmsg.getN(FUNC_NAME, 0));
        return;
      }
      nextCheck();
    });
  }
  // 2つ目
  // 登録済みデータに同一編成が存在していないかチェック
  const secondCheck = () => {
    return new Promise((nextCheck) => {
      const sameParty = pcrnote.gVsSetTable.getAllData().find(
        (elem) => pcrnote.gVsSetTable.pkey.isSame(elem, pcrnote.gNewVsSet)
      );
      if (sameParty !== undefined) {
        pcrutil.popup(pcrmsg.getN(FUNC_NAME, 1));
        return;
      }
      nextCheck();
    });
  }
  // 3つ目
  // まだ1つもデータが登録されてないが、登録を続行するか選択
  const thirdCheckAndConfirm = () => {
    return new Promise((nextCheck) => {
      const vsSetList = pcrnote.gVsSetTable.getAllData();
      if (vsSetList.length !== 0) {
        nextCheck();
      } else {
        const confirmMsg = pcrmsg.getN(FUNC_NAME, 2);
        pcrutil.popup(confirmMsg, nextCheck);
      }
    });
  }
  // 4つ目
  // 攻撃側に全てのユニットを設定してないが、登録を続行するか選択
  const fourthCheckAndConfirm = () => {
    return new Promise((registVsSet) => {
      const numOfOffenseUnits =
        pcrnote.gNewVsSet.offenseParty.filter((elem) => elem !== '').length;
      if (numOfOffenseUnits === pcrdef.PARTY_UNITS_MAX) {
        registVsSet();
      } else {
        const confirmMsg = pcrmsg.getN(FUNC_NAME, 3);
        pcrutil.popup(confirmMsg, registVsSet);
      }
    });
  }
  // 新規登録実行およびその後の処理
  const registVsSet = () => {
    pcrnote.gVsSetTable.insert(pcrnote.gNewVsSet);
    pcrutil.popup(pcrmsg.getN(FUNC_NAME, 4));
    pcract.sortVsSetTable();
    pcract.filterVsSetTable();
    pcrview.refreshContentView();
  }

  // 順次呼び出し
  firstCheck()
  .then(secondCheck)
  .then(thirdCheckAndConfirm)
  .then(fourthCheckAndConfirm)
  .then(registVsSet);
};

// ユニット検索部から新規登録部に編成を複製
pcrevent.newVsSet.copyVsSet.onClick = function() {
  pcrnote.gNewVsSet = pcrutil.assignPartially(
    pcrnote.gNewVsSet,
    pcrnote.gSearchVsSet.slotList[pcrnote.gSearchVsSet.currSlotNum],
    ['offenseParty', 'defenseParty']
  );
  pcract.removeUnitWildcardFromParty(pcrnote.gNewVsSet.defenseParty);

  pcrview.refreshContentView();
};

// 新規登録内容の消去
pcrevent.newVsSet.clearVsSet.onClick = function() {
  const $newVsSet = $_('#newVsSet');
  const $rating = $newVsSet.querySelector('[name=rating]');
  const $commentArea = $newVsSet.querySelector('[name=commentArea]');

  pcract.initNewVsSet();

  // 評価値とコメントは共通の画面更新処理を介さず直接更新するので、手動で消去
  $rating.innerHTML = pcrview.makeRatingHtml(pcrnote.gNewVsSet);
  $commentArea.value = '';

  // コメント入力部の大きさも復元
  $commentArea.style.height = $_('#commentAreaForResotration').style.height;

  pcrview.refreshContentView();
};

// ユニット検索部の攻撃側、防衛側タブ切り替え
pcrevent.searchVsSet.offenseParty.onClick = function() {
  pcrnote.gViewController.switchSearchTabOn(0);
  pcrview.refreshContentView();
};
pcrevent.searchVsSet.defenseParty.onClick = function() {
  pcrnote.gViewController.switchSearchTabOn(1);
  pcrview.refreshContentView();
};

// ユニット検索部の選択ユニットの更新(追加したユニットから操作)
pcrevent.searchVsSet.offensePartyUnit.onClick = function() {
  const unitIndex = pcrutil.indexOfHtmlElement(
    $$_('#searchVsSet [name=offensePartyUnit]'), this
  );
  const offenseParty = pcract.getOffenseParty(pcrnote.gSearchVsSet);
  const unitID = offenseParty[offenseParty.length - 1 - unitIndex];
  pcract.toggleUnitSelection(offenseParty, unitID);
  //pcrview.refreshContentView(); 画面更新は親要素で行っている
};
pcrevent.searchVsSet.defensePartyUnit.onClick = function() {
  const unitIndex = pcrutil.indexOfHtmlElement(
    $$_('#searchVsSet [name=defensePartyUnit]'), this
  );
  const defenseParty = pcract.getDefenseParty(pcrnote.gSearchVsSet);
  const unitID = defenseParty[defenseParty.length - 1 - unitIndex];
  pcract.toggleUnitSelection(defenseParty, unitID);
  pcract.filterVsSetTable();
  //pcrview.refreshContentView(); 画面更新は親要素で行っている
};

// 編成用ワイルドカードの切り替え
pcrevent.searchVsSet.defensePartyUnit.onDblclick = function() {
  const unitIndex = pcrutil.indexOfHtmlElement(
    $$_('#searchVsSet [name=defensePartyUnit]'), this
  );
  const defenseParty = pcract.getDefenseParty(pcrnote.gSearchVsSet);
  const pos = defenseParty.length - 1 - unitIndex;
  pcract.toggleUnitWildcard(defenseParty, pos);

  pcract.filterVsSetTable();
  pcrview.refreshContentView(); // ダブルクリック(タップ)時は画面更新が必要
};

// 攻撃側編成と防衛側編成の入れ替え
pcrevent.searchVsSet.currSlotNum.onDblclick = function() {
  const currSlotNum = pcrnote.gSearchVsSet.currSlotNum;
  const currSlot = pcrnote.gSearchVsSet.slotList[currSlotNum];
  const tempParty = currSlot.offenseParty;
  currSlot.offenseParty = currSlot.defenseParty;
  currSlot.defenseParty = tempParty;
  pcract.removeUnitWildcardFromParty(currSlot.offenseParty);
  if (pcrnote.gViewController.isSearchTabOffenseOn()) {
    pcrnote.gViewController.switchSearchTabDefenseOn();
  } else {
    pcrnote.gViewController.switchSearchTabOffenseOn();
  }

  pcract.filterVsSetTable();
  pcrview.refreshContentView(); // ダブルクリック(タップ)時は画面更新が必要
};

// 検索登録部のコメントの更新
pcrevent.searchVsSet.commentArea.onChange = function() {
  const $commentArea = $_('#searchVsSet [name=commentArea]');
  const newComment = $commentArea.value.trimEnd();
  $commentArea.value = newComment;
  pcrnote.gSearchVsSet.comment = newComment;
};

// ユニット検索部のスロット切り替え
pcrevent.searchVsSet.switchVsSet.onClick = function() {
  const buttonIndex = pcrutil.indexOfHtmlElement(
    $$_('#searchVsSet [name=switchVsSet]'), this
  );

  let nextSlotNum = pcrnote.gSearchVsSet.currSlotNum;
  if (buttonIndex === 0) {
    --nextSlotNum;
  } else if (buttonIndex === 1) {
    ++nextSlotNum;
  }
  if (nextSlotNum < 0) {
    nextSlotNum = 0;
  }
  if (pcrnote.gConfigData.numOfSearchPartySlots <= nextSlotNum) {
    nextSlotNum = pcrnote.gConfigData.numOfSearchPartySlots - 1;
  }
  if (pcrnote.gSearchVsSet.currSlotNum === nextSlotNum) {
    return;
  }
  pcrnote.gSearchVsSet.currSlotNum = nextSlotNum;

  // スロット切り替え後、攻撃側、防衛側どちらを選択しているか設定
  const offenseParty = pcract.getOffenseParty(pcrnote.gSearchVsSet);
  const defenseParty = pcract.getDefenseParty(pcrnote.gSearchVsSet);
  const numOfOffenseUnits =
    offenseParty.filter((elem) => elem !== '').length;
  const numOfDefenseUnits =
    defenseParty.filter((elem) => elem !== '').length;
  if (numOfDefenseUnits < pcrdef.PARTY_UNITS_MAX) {
    pcrnote.gViewController.switchSearchTabDefenseOn();
  } else if (numOfOffenseUnits < pcrdef.PARTY_UNITS_MAX) {
    pcrnote.gViewController.switchSearchTabOffenseOn();
  } else {
    pcrnote.gViewController.switchSearchTabDefenseOn();
  }

  pcract.filterVsSetTable();
  pcrview.refreshContentView();
};

// ユニット検索情報消去
pcrevent.searchVsSet.clearVsSet.onClick = function() {
  const currSlotNum = pcrnote.gSearchVsSet.currSlotNum;
  const currSlot = pcrnote.gSearchVsSet.slotList[currSlotNum];
  currSlot.offenseParty = pcract.makeEmptyParty();
  currSlot.defenseParty = pcract.makeEmptyParty();

  // コメント入力部の大きさも復元
  $_('#searchVsSet [name=commentArea').style.height =
    $_('#commentAreaForResotration').style.height;

  pcrnote.gViewController.switchSearchTabDefenseOn();
  pcract.filterVsSetTable();
  pcrview.refreshContentView();
};

// ユニット一覧部から選択ユニットの更新
pcrevent.unitCatalog.unitCatalogItem.onClick = function() {
  const unitID = this.querySelector('[name=unitID]').textContent;

  let targetParty = undefined;
  if (pcrnote.gViewController.isNewTabOffenseOn()) {
    targetParty = pcrnote.gNewVsSet.offenseParty;
  } else if (pcrnote.gViewController.isNewTabDefenseOn()) {
    targetParty = pcrnote.gNewVsSet.defenseParty;
  } else if (pcrnote.gViewController.isSearchTabOffenseOn()) {
    targetParty = pcract.getOffenseParty(pcrnote.gSearchVsSet);
  } else if (pcrnote.gViewController.isSearchTabDefenseOn()) {
    targetParty = pcract.getDefenseParty(pcrnote.gSearchVsSet);
  }
  // クラバト用、新規登録部、防衛側の場合、追加専用
  if (
    pcrnote.gViewController.isUsedForClanbattle() &&
    pcrnote.gViewController.isNewTabDefenseOn()
  ) {
    pcract.addUnitSelection(targetParty, unitID);
  // それ以外は追加、除外交互
  } else {
    pcract.toggleUnitSelection(targetParty, unitID);
  }

  if (pcrnote.gViewController.isSearchTabDefenseOn()) {
    pcract.filterVsSetTable();
  }
  pcrview.refreshContentView();
};

// 検索結果一覧の評価値の更新
pcrevent.resultVsSetList.rating.onClick = function(event) {
  const vsSetIndex = pcrutil.indexOfHtmlElement(
    $$_('#resultVsSetList [name=rating]'), this
  );
  const elemRect = this.getBoundingClientRect();
  const clickPos = pcrutil.getClickPosOnHtmlElement(this, event);

  const updVsSet = pcrnote.gVsSetTable.getResult().pickDuplicating(vsSetIndex);
  const oldRating = pcrutil.deepCopy(updVsSet.rating);
  pcract.raiseOrLowerRating(updVsSet, elemRect, clickPos);

  if (JSON.stringify(updVsSet.rating) !== JSON.stringify(oldRating)) {
    pcrnote.gVsSetTable.update(updVsSet);
  }

  // 負荷を避けるため評価部のみ直接画面更新
  this.innerHTML = pcrview.makeRatingHtml(updVsSet);

  // メニュー部(同期ボタン)の更新
  pcrview.refreshContentView();
};

// 検索結果一覧のコメントの更新
pcrevent.resultVsSetList.commentArea.onChange = function() {
  const $commentAreaList = $$_('#resultVsSetList [name=commentArea]');
  const commentIndex = pcrutil.indexOfHtmlElement($commentAreaList, this);
  const $commentArea = $commentAreaList[commentIndex];
  const $commentLabel =
    $$_('#resultVsSetList [name=commentLabel]')[commentIndex];

  const newComment = $commentArea.value.trimEnd();
  $commentArea.value = newComment;
  // 変更点がない場合、更新は行わない
  if (newComment === $commentLabel.textContent) return;
  // コメントラベルを同期
  $commentLabel.textContent = newComment;

  const updVsSet = pcrnote.gVsSetTable.getResult().pickDuplicating(commentIndex);
  updVsSet.comment = newComment;
  pcrnote.gVsSetTable.update(updVsSet);

  pcrview.refreshContentView();
};

// 検索結果一覧から新規登録部もしくはユニット検索部に編成を複製
pcrevent.resultVsSetList.copyVsSet.onClick = function() {
  const vsSetIndex = pcrutil.indexOfHtmlElement(
    $$_('#resultVsSetList [name=copyVsSet]'), this
  );
  const resultVsSetRec =
    pcrnote.gVsSetTable.getResult().pickDuplicating(vsSetIndex);
  if (pcrnote.gViewController.isNewTabOn()) {
    pcrnote.gNewVsSet = pcrutil.assignPartially(
      pcrnote.gNewVsSet,
      resultVsSetRec,
      ['offenseParty', 'defenseParty', 'rating', 'comment']
    );
  } else if (pcrnote.gViewController.isSearchTabOn()) {
    const slotList = pcrnote.gSearchVsSet.slotList;
    const currSlotNum = pcrnote.gSearchVsSet.currSlotNum;
    slotList[currSlotNum] = pcrutil.assignPartially(
      slotList[currSlotNum],
      resultVsSetRec,
      ['offenseParty', 'defenseParty']
    );
  } else {
    //
  }

  if (pcrnote.gViewController.isSearchTabOn()) {
    pcract.filterVsSetTable();
  }
  pcrview.refreshContentView();
};

// 検索結果一覧から削除
pcrevent.resultVsSetList.deleteVsSet.onClick = function() {
  const FUNC_NAME = 'pcrevent.resultVsSetList.deleteVsSet.onClick';

  const deleteVsSet = () => {
    const buttonIndex = pcrutil.indexOfHtmlElement(
      $$_('#resultVsSetList [name=deleteVsSet]'), this
    );
    const delVsSet =
      pcrnote.gVsSetTable.getResult().pickDuplicating(buttonIndex);
    pcrnote.gVsSetTable.delete(delVsSet);
    pcract.filterVsSetTable();
    pcrview.refreshContentView();
  }

  pcrutil.popup(pcrmsg.getN(FUNC_NAME, 0), deleteVsSet);
};

// 検索結果一覧の表示方法の切り替え
pcrevent.switchViewStyle.onClick = function() {
  pcrnote.gViewController.switchViewStyle();
  pcrview.refreshContentView();
};

// 検索結果一覧のソート条件変更
pcrevent.compareFunc.onChange = function() {
  pcrnote.gViewController.states.compareFunc =
    pcrutil.getSelectBoxState($_('#compareFunc')).value;
  pcract.sortVsSetTable();
  pcract.filterVsSetTable();
  pcrview.refreshContentView();
};
pcrevent.orderBy.onChange = function() {
  pcrnote.gViewController.states.orderBy =
    pcrutil.getSelectBoxState($_('#orderBy')).value;
  pcract.sortVsSetTable();
  pcract.filterVsSetTable();
  pcrview.refreshContentView();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// 初期化時のイベントリスナー登録
pcrevent.addEventListener = function() {
  $on($_('#blur'), 'click', function() {}); // iOSのフォーカス外し用
  $on($_('#currentTime'), 'dblclick', pcrevent.resident.currentTime.onDblclick);
  $on($_('#pickedTime'), 'dblclick', pcrevent.resident.pickedTime.onDblclick);
  $on($_('#elapsedTime'), 'dblclick', pcrevent.resident.elapsedTime.onDblclick);
  $on($_('#goToConfig'), 'click', pcrevent.goToConfig.onClick);
  $on(window, 'keydown', pcrevent.goToConfig.onKeydown);
  $on($_('#importDataFromFile'), 'change', pcrevent.importDataFromFile.onChange);
  $on($_('#exportDataToFile'), 'click', pcrevent.exportDataToFile.onClick);
  $on($_('#syncDataWithServer'), 'click', pcrevent.syncDataWithServer.onClick);
  $on($_('#switchUsedFor'), 'click', pcrevent.switchUsedFor.onClick);
  $on($_('#startNewRegist'), 'click', pcrevent.startNewRegist.onClick);
  $on($_('#startUnitSearch'), 'click', pcrevent.startUnitSearch.onClick);
  $on($_('#hashtag1'), 'change', pcrevent.hashtag.onChange);
  $on($_('#hashtag2'), 'change', pcrevent.hashtag.onChange);
  const $newVsSet = $_('#newVsSet');
  $on($newVsSet.querySelector('[name=offenseParty]'), 'click', pcrevent.newVsSet.offenseParty.onClick);
  $on($newVsSet.querySelector('[name=defenseParty]'), 'click', pcrevent.newVsSet.defenseParty.onClick);
  $on($newVsSet.querySelector('[name=rating]'), 'click', pcrevent.newVsSet.rating.onClick);
  $on($newVsSet.querySelector('[name=commentArea]'), 'change', pcrevent.newVsSet.commentArea.onChange);
  $on($newVsSet.querySelector('[name=registVsSet]'), 'click', pcrevent.newVsSet.registVsSet.onClick);
  $on($newVsSet.querySelector('[name=copyVsSet]'), 'click', pcrevent.newVsSet.copyVsSet.onClick);
  $on($newVsSet.querySelector('[name=clearVsSet]'), 'click', pcrevent.newVsSet.clearVsSet.onClick);
  const $searchVsSet = $_('#searchVsSet');
  $on($searchVsSet.querySelector('[name=offenseParty]'), 'click', pcrevent.searchVsSet.offenseParty.onClick);
  $on($searchVsSet.querySelector('[name=defenseParty]'), 'click', pcrevent.searchVsSet.defenseParty.onClick);
  $on($searchVsSet.querySelector('[name=currSlotNum]'), 'dblclick', pcrevent.searchVsSet.currSlotNum.onDblclick);
  $on($searchVsSet.querySelector('[name=commentArea]'), 'change', pcrevent.searchVsSet.commentArea.onChange);
  $searchVsSet.querySelectorAll('[name=switchVsSet]').forEach(($switchVsSet) => {
    $on($switchVsSet, 'click', pcrevent.searchVsSet.switchVsSet.onClick);
  });
  $on($searchVsSet.querySelector('[name=clearVsSet]'), 'click', pcrevent.searchVsSet.clearVsSet.onClick);
  $$_('#unitCatalog [name=unitCatalogItem]').forEach(($unitCatalogItem) => {
    $on($unitCatalogItem, 'click', pcrevent.unitCatalog.unitCatalogItem.onClick);
  });
  $on($_('#switchViewStyle'), 'click', pcrevent.switchViewStyle.onClick);
  $on($_('#compareFunc'), 'change', pcrevent.compareFunc.onChange);
  $on($_('#orderBy'), 'change', pcrevent.orderBy.onChange);
};

// 新規登録部のイベントリスナー追加登録
pcrevent.addEventListenerOnNewVsSet = function() {
  $$_('#newVsSet [name=offensePartyUnit]').forEach(($offensePartyUnit) => {
    $on($offensePartyUnit, 'click', pcrevent.newVsSet.offensePartyUnit.onClick);
  });
  $$_('#newVsSet [name=defensePartyUnit]').forEach(($defensePartyUnit) => {
    $on($defensePartyUnit, 'click', pcrevent.newVsSet.defensePartyUnit.onClick);
  });
};

// ユニット検索部のイベントリスナー追加登録
pcrevent.addEventListenerOnSearchVsSet = function() {
  $$_('#searchVsSet [name=offensePartyUnit]').forEach(($offensePartyUnit) => {
    $on($offensePartyUnit, 'click', pcrevent.searchVsSet.offensePartyUnit.onClick);
  });
  $$_('#searchVsSet [name=defensePartyUnit]').forEach(($defensePartyUnit) => {
    $on($defensePartyUnit, 'click', pcrevent.searchVsSet.defensePartyUnit.onClick);
    $on($defensePartyUnit, 'dblclick', pcrevent.searchVsSet.defensePartyUnit.onDblclick);
  });
};

// 検索結果一覧部のイベントリスナー追加登録
pcrevent.addEventListenerOnResultVsSetList = function() {
  $$_('#resultVsSetList [name=resultVsSetRec]').forEach(($resultVsSetRec) => {
    $on($resultVsSetRec.querySelector('[name=rating]'), 'click', pcrevent.resultVsSetList.rating.onClick);
    $on($resultVsSetRec.querySelector('[name=commentArea]'), 'change', pcrevent.resultVsSetList.commentArea.onChange);
    $on($resultVsSetRec.querySelector('[name=copyVsSet]'), 'click', pcrevent.resultVsSetList.copyVsSet.onClick);
    $on($resultVsSetRec.querySelector('[name=deleteVsSet]'), 'click', pcrevent.resultVsSetList.deleteVsSet.onClick);
  });
};

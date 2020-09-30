// クライアント側コンテンツ部
// イベント処理

'use strict';

var pcrevent = pcrevent || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

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

// ユーザー設定ページへ遷移
pcrevent.goToConfig.onClick = function() {
  pcrnote.gViewController.switchPageConfig();
  // ユーザー名とデータベース名は保存にチェックが付いていない場合、毎回初期化
  pcrnote.gConfigData = pcrconfig.eraseVolatileConfigItems(pcrnote.gConfigData);
  pcrconfig.refreshConfigView();
};
// コンテンツページでエスケープが押された場合、ユーザー設定ページへ遷移
pcrevent.goToConfig.onKeydown = function(e) {
  if (!pcrnote.gViewController.isPageContent()) return;
  if (e.keyCode !== 27) return;
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

  const selectedFileType = $('#fileType').find(':selected').val();
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
    pcrview.refreshContentView();
  // 更新確定(サーバーに更新データ送信)
  } else if (pcrnote.gVsSetTable.isImportDataAsync()) {
    pcrnote.gVsSetTable.exportDataToServer(
      () => {
        pcrutil.popup(pcrmsg.getN(FUNC_NAME, 0));
        pcrview.refreshContentView();
      },
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
  const hashtag1 = pcract.getSelectedHashtag1();
  const hashtag2 = pcract.getSelectedHashtag2();
  if (hashtag1 === 'rebuild' || hashtag2 === 'rebuild') {
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
  const index = $('#newVsSet [name=offensePartyUnit]').index(this);
  const offenseParty = pcrnote.gNewVsSet.offenseParty;
  const unitID = offenseParty[offenseParty.length - 1 - index];
  if (unitID !== '') {
    pcract.toggleUnitSelection(pcrnote.gNewVsSet.offenseParty, unitID);
  }
  //pcrview.refreshContentView(); 画面更新は親要素で行っている
};
pcrevent.newVsSet.defensePartyUnit.onClick = function() {
  const index = $('#newVsSet [name=defensePartyUnit]').index(this);
  const defenseParty = pcrnote.gNewVsSet.defenseParty;
  const unitID = defenseParty[defenseParty.length - 1 - index];
  if (unitID !== '') {
    pcract.toggleUnitSelection(pcrnote.gNewVsSet.defenseParty, unitID);
  }
  //pcrview.refreshContentView(); 画面更新は親要素で行っている
};

// 新規登録部の評価値の更新
pcrevent.newVsSet.rating.onClick = function(e) {
  const centralPos = [$(this).width() / 2, $(this).height() / 2];
  const clickPos = [
    e.pageX - $(this).offset().left,
    e.pageY - $(this).offset().top
  ];

  pcract.raiseOrLowerRating(pcrnote.gNewVsSet, centralPos, clickPos);

  // 負荷を避けるため評価部のみ直接画面更新
  $(this).html(pcrview.makeRatingHtml(pcrnote.gNewVsSet));
};

// 新規登録部のコメントの更新
pcrevent.newVsSet.commentArea.onChange = function() {
  const $commentArea = $('#newVsSet [name=commentArea]');
  const newComment = $commentArea.val().trimEnd();
  $commentArea.val(newComment);
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

  pcrview.refreshContentView();
};

// 新規登録内容の消去
pcrevent.newVsSet.clearVsSet.onClick = function() {
  pcract.initNewVsSet();

  // コメント入力部の大きさも復元
  const height = $('#commentAreaForResotration').css('height');
  $('#newVsSet [name=commentArea').css('height', height);

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
  const index = $('#searchVsSet [name=offensePartyUnit]').index(this);
  const offenseParty = pcract.getOffenseParty(pcrnote.gSearchVsSet);
  const unitID = offenseParty[offenseParty.length - 1 - index];
  pcract.toggleUnitSelection(offenseParty, unitID);
  //pcrview.refreshContentView(); 画面更新は親要素で行っている
};
pcrevent.searchVsSet.defensePartyUnit.onClick = function() {
  const index = $('#searchVsSet [name=defensePartyUnit]').index(this);
  const defenseParty = pcract.getDefenseParty(pcrnote.gSearchVsSet);
  const unitID = defenseParty[defenseParty.length - 1 - index];
  pcract.toggleUnitSelection(defenseParty, unitID);
  pcract.filterVsSetTable();
  //pcrview.refreshContentView(); 画面更新は親要素で行っている
};

pcrevent.searchVsSet.defensePartyUnit.onDblclick = function() {
  const index = $('#searchVsSet [name=defensePartyUnit]').index(this);
  const defenseParty = pcract.getDefenseParty(pcrnote.gSearchVsSet);
  const pos = defenseParty.length - 1 - index;
  pcract.toggleUnitWildcard(defenseParty, pos);
  pcract.filterVsSetTable();
  pcrview.refreshContentView(); // ダブルクリック(タップ)時は画面更新が必要
};

// 検索登録部のコメントの更新
pcrevent.searchVsSet.commentArea.onChange = function() {
  const $commentArea = $('#searchVsSet [name=commentArea]');
  const newComment = $commentArea.val().trimEnd();
  $commentArea.val(newComment);
  pcrnote.gSearchVsSet.comment = newComment;
};

// ユニット検索部のスロット切り替え
pcrevent.searchVsSet.switchVsSet.onClick = function() {
  const index = $('#searchVsSet [name=switchVsSet]').index(this);
  let nextSlotNum = pcrnote.gSearchVsSet.currSlotNum;
  if (index === 0) {
    --nextSlotNum;
  } else if (index === 1) {
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
  pcrnote.gSearchVsSet.slotList[currSlotNum].offenseParty =
    pcract.makeEmptyParty();
  pcrnote.gSearchVsSet.slotList[currSlotNum].defenseParty =
    pcract.makeEmptyParty();

  // コメント入力部の大きさも復元
  const height = $('#commentAreaForResotration').css('height');
  $('#searchVsSet [name=commentArea').css('height', height);

  pcrnote.gViewController.switchSearchTabDefenseOn();
  pcract.filterVsSetTable();
  pcrview.refreshContentView();
};

// ユニット一覧部から選択ユニットの更新
pcrevent.unitCatalog.unitCatalogItem.onClick = function() {
  const index = $('#unitCatalog [name=unitCatalogItem]').index(this);
  const unitID = pcrnote.gUnitInfoTable.getAllData()[index].unitID;

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
pcrevent.resultVsSetList.rating.onClick = function(e) {
  const index = $('#resultVsSetList [name=rating]').index(this);
  const centralPos = [$(this).width() / 2, $(this).height() / 2];
  const clickPos = [
    e.pageX - $(this).offset().left,
    e.pageY - $(this).offset().top
  ];

  const updVsSet = pcrnote.gVsSetTable.getResult().pickDuplicating(index);
  const oldRating = pcrutil.deepCopy(updVsSet.rating);
  pcract.raiseOrLowerRating(updVsSet, centralPos, clickPos);

  if (JSON.stringify(updVsSet.rating) !== JSON.stringify(oldRating)) {
    pcrnote.gVsSetTable.update(updVsSet);
  }

  // 負荷を避けるため評価部のみ直接画面更新
  $(this).html(pcrview.makeRatingHtml(updVsSet));

  pcrview.refreshContentView();
};

// 検索結果一覧のコメントの更新
pcrevent.resultVsSetList.commentArea.onChange = function() {
  const $allCommentArea = $('#resultVsSetList [name=commentArea]');
  const index = $allCommentArea.index(this);
  const $commentArea = $allCommentArea.eq(index);
  const $commentLabel = $('#resultVsSetList [name=commentLabel]').eq(index);

  const newComment = $commentArea.val().trimEnd();
  $commentArea.val(newComment);
  // 変更点がない場合、更新は行わない
  if (newComment === $commentLabel.text()) return;
  // コメントラベルを同期
  $commentLabel.text(newComment);

  const updVsSet = pcrnote.gVsSetTable.getResult().pickDuplicating(index);
  updVsSet.comment = newComment;
  pcrnote.gVsSetTable.update(updVsSet);

  pcrview.refreshContentView();
};

// 検索結果一覧から新規登録部もしくはユニット検索部に編成を複製
pcrevent.resultVsSetList.copyVsSet.onClick = function() {
  const index = $('#resultVsSetList [name=copyVsSet]').index(this);
  const resultVsSet = pcrnote.gVsSetTable.getResult().pickDuplicating(index);
  if (pcrnote.gViewController.isNewTabOn()) {
    pcrnote.gNewVsSet = pcrutil.assignPartially(
      pcrnote.gNewVsSet,
      resultVsSet,
      ['offenseParty', 'defenseParty', 'rating', 'comment']
    );
  } else if (pcrnote.gViewController.isSearchTabOn()) {
    const slotList = pcrnote.gSearchVsSet.slotList;
    const currSlotNum = pcrnote.gSearchVsSet.currSlotNum;
    slotList[currSlotNum] = pcrutil.assignPartially(
      slotList[currSlotNum],
      resultVsSet,
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
    const index = $('#resultVsSetList [name=deleteVsSet]').index(this);
    const delVsSet = pcrnote.gVsSetTable.getResult().pickDuplicating(index);
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
  const compareFunc = $('#compareFunc').find(':selected').val();
  pcrnote.gViewController.states.compareFunc = compareFunc;
  pcract.sortVsSetTable();
  pcract.filterVsSetTable();
  pcrview.refreshContentView();
};
pcrevent.orderBy.onChange = function() {
  const orderBy = $('#orderBy').find(':selected').val();
  pcrnote.gViewController.states.orderBy = orderBy;
  pcract.sortVsSetTable();
  pcract.filterVsSetTable();
  pcrview.refreshContentView();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// イベントリスナー登録
pcrevent.addEventListener = function() {
  $('#goToConfig').on('click', pcrevent.goToConfig.onClick);
  $(window).on('keydown', pcrevent.goToConfig.onKeydown);
  $('#importDataFromFile').on('change', pcrevent.importDataFromFile.onChange);
  $('#exportDataToFile').on('click', pcrevent.exportDataToFile.onClick);
  $('#syncDataWithServer').on('click', pcrevent.syncDataWithServer.onClick);
  $('#switchUsedFor').on('click', pcrevent.switchUsedFor.onClick);
  $('#startNewRegist').on('click', pcrevent.startNewRegist.onClick);
  $('#startUnitSearch').on('click', pcrevent.startUnitSearch.onClick);
  $('#hashtag1').on('change', pcrevent.hashtag.onChange);
  $('#hashtag2').on('change', pcrevent.hashtag.onChange);
  $('#newVsSet').on('click', '[name=offenseParty]', pcrevent.newVsSet.offenseParty.onClick);
  $('#newVsSet').on('click', '[name=defenseParty]', pcrevent.newVsSet.defenseParty.onClick);
  $('#newVsSet').on('click', '[name=offensePartyUnit]', pcrevent.newVsSet.offensePartyUnit.onClick);
  $('#newVsSet').on('click', '[name=defensePartyUnit]', pcrevent.newVsSet.defensePartyUnit.onClick);
  $('#newVsSet').on('click', '[name=rating]', pcrevent.newVsSet.rating.onClick);
  $('#newVsSet').on('change', '[name=commentArea]', pcrevent.newVsSet.commentArea.onChange);
  $('#newVsSet').on('click', '[name=registVsSet]', pcrevent.newVsSet.registVsSet.onClick);
  $('#newVsSet').on('click', '[name=copyVsSet]', pcrevent.newVsSet.copyVsSet.onClick);
  $('#newVsSet').on('click', '[name=clearVsSet]', pcrevent.newVsSet.clearVsSet.onClick);
  $('#searchVsSet').on('click', '[name=offenseParty]', pcrevent.searchVsSet.offenseParty.onClick);
  $('#searchVsSet').on('click', '[name=defenseParty]', pcrevent.searchVsSet.defenseParty.onClick);
  $('#searchVsSet').on('click', '[name=offensePartyUnit]', pcrevent.searchVsSet.offensePartyUnit.onClick);
  $('#searchVsSet').on('click', '[name=defensePartyUnit]', pcrevent.searchVsSet.defensePartyUnit.onClick);
  $('#searchVsSet').on('dblclick', '[name=defensePartyUnit]', pcrevent.searchVsSet.defensePartyUnit.onDblclick);
  $('#searchVsSet').on('change', '[name=commentArea]', pcrevent.searchVsSet.commentArea.onChange);
  $('#searchVsSet').on('click', '[name=switchVsSet]', pcrevent.searchVsSet.switchVsSet.onClick);
  $('#searchVsSet').on('click', '[name=clearVsSet]', pcrevent.searchVsSet.clearVsSet.onClick);
  $('#unitCatalog').on('click', '[name=unitCatalogItem]', pcrevent.unitCatalog.unitCatalogItem.onClick);
  $('#resultVsSetList').on('click', '[name=rating]', pcrevent.resultVsSetList.rating.onClick);
  $('#resultVsSetList').on('change', '[name=commentArea]', pcrevent.resultVsSetList.commentArea.onChange);
  $('#resultVsSetList').on('click', '[name=copyVsSet]', pcrevent.resultVsSetList.copyVsSet.onClick);
  $('#resultVsSetList').on('click', '[name=deleteVsSet]', pcrevent.resultVsSetList.deleteVsSet.onClick);
  $('#switchViewStyle').on('click', pcrevent.switchViewStyle.onClick);
  $('#compareFunc').on('change', pcrevent.compareFunc.onChange);
  $('#orderBy').on('change', pcrevent.orderBy.onChange);
};

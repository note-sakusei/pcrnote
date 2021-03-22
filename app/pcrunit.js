// ユニット定義

'use strict';

var exports = exports || undefined;

var pcrunit = exports || pcrunit || {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// プレイヤーユニット情報一覧(隊列順)
// [ユニットID(内部処理用), ユニット名(表示用), 画像パス, 表示の有無]
pcrunit.PC_UNIT_INFO_LIST = [
  // 前衛
  [
    ['rima', 'リマ', './img/arena/リマ.jpg', true],
    ['miyako', 'ミヤコ', './img/arena/ミヤコ.jpg', true],
    ['kuuka', 'クウカ', './img/arena/クウカ.jpg', true],
    ['jun', 'ジュン', './img/arena/ジュン.jpg', true],
    ['muimi_newyear', 'ムイミ(ニューイヤー)', './img/arena/ムイミ(ニューイヤー).jpg', true],
    ['kuuka_ooedo', 'クウカ(オーエド)', './img/arena/クウカ(オーエド).jpg', true],
    ['kaori', 'カオリ', './img/arena/カオリ.jpg', true],
    ['saren_christmas', 'サレン(クリスマス)', './img/arena/サレン(クリスマス).jpg', true],
    ['tsumugi_halloween', 'ツムギ(ハロウィン)', './img/arena/ツムギ(ハロウィン).jpg', true],
    ['rei_newyear', 'レイ(ニューイヤー)', './img/arena/レイ(ニューイヤー).jpg', true],
    ['rin_deremas', 'リン(デレマス)', './img/arena/リン(デレマス).jpg', true],
    ['pecorine', 'ペコリーヌ', './img/arena/ペコリーヌ.jpg', true],
    ['pecorine_princess', 'ペコリーヌ(プリンセス)', './img/arena/ペコリーヌ(プリンセス).jpg', true],
    ['ruka', 'ルカ', './img/arena/ルカ.jpg', true],
    ['kokkoro_newyear', 'コッコロ(ニューイヤー)', './img/arena/コッコロ(ニューイヤー).jpg', true],
    ['nozomi', 'ノゾミ', './img/arena/ノゾミ.jpg', true],
    ['muimi', 'ムイミ', './img/arena/ムイミ.jpg', true],
    ['makoto', 'マコト', './img/arena/マコト.jpg', true],
    ['makoto_cinderella', 'マコト(シンデレラ)', './img/arena/マコト(シンデレラ).jpg', true],
    ['kaya', 'カヤ', './img/arena/カヤ.jpg', true],
    ['hiyori_newyear', 'ヒヨリ(ニューイヤー)', './img/arena/ヒヨリ(ニューイヤー).jpg', true],
    ['rima_cinderella', 'リマ(シンデレラ)', './img/arena/リマ(シンデレラ).jpg', true],
    ['ninon_ooedo', 'ニノン(オーエド)', './img/arena/ニノン(オーエド).jpg', true],
    ['akino', 'アキノ', './img/arena/アキノ.jpg', true],
    ['makoto_summer', 'マコト(サマー)', './img/arena/マコト(サマー).jpg', true],
    ['jun_summer', 'ジュン(サマー)', './img/arena/ジュン(サマー).jpg', true],
    ['matsuri', 'マツリ', './img/arena/マツリ.jpg', true],
    ['chloe', 'クロエ', './img/arena/クロエ.jpg', true],
    ['matsuri_halloween', 'マツリ(ハロウィン)', './img/arena/マツリ(ハロウィン).jpg', true],
    ['eriko_valentine', 'エリコ(バレンタイン)', './img/arena/エリコ(バレンタイン).jpg', true],
    ['akino_christmas', 'アキノ(クリスマス)', './img/arena/アキノ(クリスマス).jpg', true],
    ['ayane_christmas', 'アヤネ(クリスマス)', './img/arena/アヤネ(クリスマス).jpg', true],
    ['ruka_summer', 'ルカ(サマー)', './img/arena/ルカ(サマー).jpg', true],
    ['tsumugi', 'ツムギ', './img/arena/ツムギ.jpg', true],
    ['inori', 'イノリ', './img/arena/イノリ.jpg', true],
    ['hiyori_princess', 'ヒヨリ(プリンセス)', './img/arena/ヒヨリ(プリンセス).jpg', true],
    ['hiyori', 'ヒヨリ', './img/arena/ヒヨリ.jpg', true],
    ['misogi', 'ミソギ', './img/arena/ミソギ.jpg', true],
    ['ayane', 'アヤネ', './img/arena/アヤネ.jpg', true],
    ['misogi_halloween', 'ミソギ(ハロウィン)', './img/arena/ミソギ(ハロウィン).jpg', true],
    ['tamaki', 'タマキ', './img/arena/タマキ.jpg', true],
    ['tomo', 'トモ', './img/arena/トモ.jpg', true],
    ['chieru', 'チエル', './img/arena/チエル.jpg', true],
    ['tamaki_summer', 'タマキ(サマー)', './img/arena/タマキ(サマー).jpg', true],
    ['eriko', 'エリコ', './img/arena/エリコ.jpg', true],
    ['pecorine_summer', 'ペコリーヌ(サマー)', './img/arena/ペコリーヌ(サマー).jpg', true],
    ['kurumi', 'クルミ', './img/arena/クルミ.jpg', true],
    ['djeeta', 'ジータ', './img/arena/ジータ.jpg', true],
    ['pecorine_newyear', 'ペコリーヌ(ニューイヤー)', './img/arena/ペコリーヌ(ニューイヤー).jpg', true],
    ['rei', 'レイ', './img/arena/レイ.jpg', true],
    ['ilya_christmas', 'イリヤ(クリスマス)', './img/arena/イリヤ(クリスマス).jpg', true],
    ['anna_summer', 'アンナ(サマー)', './img/arena/アンナ(サマー).jpg', true],
    ['christina_chrismas', 'クリスティーナ(クリスマス)', './img/arena/クリスティーナ(クリスマス).jpg', true],
    ['shizuru', 'シズル', './img/arena/シズル.jpg', true],
    ['christina', 'クリスティーナ', './img/arena/クリスティーナ.jpg', true],
    ['kurumi_christmas', 'クルミ(クリスマス)', './img/arena/クルミ(クリスマス).jpg', true]
  ],
  // 中衛
  [
    ['mimi', 'ミミ', './img/arena/ミミ.jpg', true],
    ['shinobu', 'シノブ', './img/arena/シノブ.jpg', true],
    ['mimi_halloween', 'ミミ(ハロウィン)', './img/arena/ミミ(ハロウィン).jpg', true],
    ['shefi', 'シェフィ', './img/arena/シェフィ.jpg', true],
    ['uzuki_deremas', 'ウヅキ(デレマス)', './img/arena/ウヅキ(デレマス).jpg', true],
    ['rei_halloween', 'レイ(ハロウィン)', './img/arena/レイ(ハロウィン).jpg', true],
    ['shizuru_valentine', 'シズル(バレンタイン)', './img/arena/シズル(バレンタイン).jpg', true],
    ['mahiru_ranger', 'マヒル(レンジャー)', './img/arena/マヒル(レンジャー).jpg', true],
    ['mahiru', 'マヒル', './img/arena/マヒル.jpg', true],
    ['tomo_magical', 'トモ(マジカル)', './img/arena/トモ(マジカル).jpg', true],
    ['yukari', 'ユカリ', './img/arena/ユカリ.jpg', true],
    ['yukari_christmas', 'ユカリ(クリスマス)', './img/arena/ユカリ(クリスマス).jpg', true],
    ['monika', 'モニカ', './img/arena/モニカ.jpg', true],
    ['ninon', 'ニノン', './img/arena/ニノン.jpg', true],
    ['nozomi_christmas', 'ノゾミ(クリスマス)', './img/arena/ノゾミ(クリスマス).jpg', true],
    ['mihuyu', 'ミフユ', './img/arena/ミフユ.jpg', true],
    ['rin_ranger', 'リン(レンジャー)', './img/arena/リン(レンジャー).jpg', true],
    ['ilya', 'イリヤ', './img/arena/イリヤ.jpg', true],
    ['kaori_summer', 'カオリ(サマー)', './img/arena/カオリ(サマー).jpg', true],
    ['saren', 'サレン', './img/arena/サレン.jpg', true],
    ['anna', 'アンナ', './img/arena/アンナ.jpg', true],
    ['nanaka_summer', 'ナナカ(サマー)', './img/arena/ナナカ(サマー).jpg', true],
    ['shinobu_halloween', 'シノブ(ハロウィン)', './img/arena/シノブ(ハロウィン).jpg', true],
    ['mihuyu_summer', 'ミフユ(サマー)', './img/arena/ミフユ(サマー).jpg', true],
    ['kokkoro', 'コッコロ', './img/arena/コッコロ.jpg', true],
    ['ayumi_wonder', 'アユミ(ワンダー)', './img/arena/アユミ(ワンダー).jpg', true],
    ['ayumi', 'アユミ', './img/arena/アユミ.jpg', true],
    ['grea', 'グレア', './img/arena/グレア.jpg', true],
    ['monika_magical', 'モニカ(マジカル)', './img/arena/モニカ(マジカル).jpg', true],
    ['akari_angel', 'アカリ(エンジェル)', './img/arena/アカリ(エンジェル).jpg', true],
    ['yori_angel', 'ヨリ(エンジェル)', './img/arena/ヨリ(エンジェル).jpg', true],
    ['kokkoro_gishouzoku', 'コッコロ(儀装束)', './img/arena/コッコロ(儀装束).jpg', true],
    ['kokkoro_summer', 'コッコロ(サマー)', './img/arena/コッコロ(サマー).jpg', true],
    ['rem', 'レム', './img/arena/レム.jpg', true],
    ['ram', 'ラム', './img/arena/ラム.jpg', true],
    ['rin', 'リン', './img/arena/リン.jpg', true],
    ['kokkoro_princess', 'コッコロ(プリンセス)', './img/arena/コッコロ(プリンセス).jpg', true],
    ['labyrista', 'ラビリスタ', './img/arena/ラビリスタ.jpg', true],
    ['neneka_newyear', 'ネネカ(ニューイヤー)', './img/arena/ネネカ(ニューイヤー).jpg', true],
    ['mitsuki', 'ミツキ', './img/arena/ミツキ.jpg', true],
    ['hatsune_summer', 'ハツネ(サマー)', './img/arena/ハツネ(サマー).jpg', true],
    ['akari', 'アカリ', './img/arena/アカリ.jpg', true],
    ['yori', 'ヨリ', './img/arena/ヨリ.jpg', true],
    ['yui_gishouzoku', 'ユイ(儀装束)', './img/arena/ユイ(儀装束).jpg', true],
    ['saren_summer', 'サレン(サマー)', './img/arena/サレン(サマー).jpg', true],
    ['miyako_halloween', 'ミヤコ(ハロウィン)', './img/arena/ミヤコ(ハロウィン).jpg', true]
  ],
  // 後衛
  [
    ['arisa', 'アリサ', './img/arena/アリサ.jpg', true],
    ['anne', 'アン', './img/arena/アン.jpg', true],
    ['lou', 'ルゥ', './img/arena/ルゥ.jpg', true],
    ['maho_cinderella', 'マホ(シンデレラ)', './img/arena/マホ(シンデレラ).jpg', true],
    ['neneka', 'ネネカ', './img/arena/ネネカ.jpg', true],
    ['aoi_hennyuusei', 'アオイ(編入生)', './img/arena/アオイ(編入生).jpg', true],
    ['kyaru_newyear', 'キャル(ニューイヤー)', './img/arena/キャル(ニューイヤー).jpg', true],
    ['mio_deremas', 'ミオ(デレマス)', './img/arena/ミオ(デレマス).jpg', true],
    ['misato_summer', 'ミサト(サマー)', './img/arena/ミサト(サマー).jpg', true],
    ['rino', 'リノ', './img/arena/リノ.jpg', true],
    ['suzuna', 'スズナ', './img/arena/スズナ.jpg', true],
    ['suzuna_summer', 'スズナ(サマー)', './img/arena/スズナ(サマー).jpg', true],
    ['shiori', 'シオリ', './img/arena/シオリ.jpg', true],
    ['shiori_magical', 'シオリ(マジカル)', './img/arena/シオリ(マジカル).jpg', true],
    ['io', 'イオ', './img/arena/イオ.jpg', true],
    ['io_summer', 'イオ(サマー)', './img/arena/イオ(サマー).jpg', true],
    ['suzume', 'スズメ', './img/arena/スズメ.jpg', true],
    ['suzume_newyear', 'スズメ(ニューイヤー)', './img/arena/スズメ(ニューイヤー).jpg', true],
    ['emilia', 'エミリア', './img/arena/エミリア.jpg', true],
    ['kasumi', 'カスミ', './img/arena/カスミ.jpg', true],
    ['kasumi_magical', 'カスミ(マジカル)', './img/arena/カスミ(マジカル).jpg', true],
    ['rino_wonder', 'リノ(ワンダー)', './img/arena/リノ(ワンダー).jpg', true],
    ['misato', 'ミサト', './img/arena/ミサト.jpg', true],
    ['kasumi_summer', 'カスミ(サマー)', './img/arena/カスミ(サマー).jpg', true],
    ['nanaka', 'ナナカ', './img/arena/ナナカ.jpg', true],
    ['yui_newyear', 'ユイ(ニューイヤー)', './img/arena/ユイ(ニューイヤー).jpg', true],
    ['kyaru_princess', 'キャル(プリンセス)', './img/arena/キャル(プリンセス).jpg', true],
    ['kyaru', 'キャル', './img/arena/キャル.jpg', true],
    ['hatsune', 'ハツネ', './img/arena/ハツネ.jpg', true],
    ['misaki', 'ミサキ', './img/arena/ミサキ.jpg', true],
    ['luna', 'ルナ', './img/arena/ルナ.jpg', true],
    ['yui_princess', 'ユイ(プリンセス)', './img/arena/ユイ(プリンセス).jpg', true],
    ['chika_christmas', 'チカ(クリスマス)', './img/arena/チカ(クリスマス).jpg', true],
    ['suzume_summer', 'スズメ(サマー)', './img/arena/スズメ(サマー).jpg', true],
    ['kyaru_summer', 'キャル(サマー)', './img/arena/キャル(サマー).jpg', true],
    ['aoi', 'アオイ', './img/arena/アオイ.jpg', true],
    ['chika', 'チカ', './img/arena/チカ.jpg', true],
    ['maho_summer', 'マホ(サマー)', './img/arena/マホ(サマー).jpg', true],
    ['maho', 'マホ', './img/arena/マホ.jpg', true],
    ['yui', 'ユイ', './img/arena/ユイ.jpg', true],
    ['yuki', 'ユキ', './img/arena/ユキ.jpg', true],
    ['yuni', 'ユニ', './img/arena/ユニ.jpg', true],
    ['kyouka', 'キョウカ', './img/arena/キョウカ.jpg', true],
    ['misaki_halloween', 'ミサキ(ハロウィン)', './img/arena/ミサキ(ハロウィン).jpg', true],
    ['kyouka_halloween', 'キョウカ(ハロウィン)', './img/arena/キョウカ(ハロウィン).jpg', true]
  ]
];

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// NPCユニット情報一覧
pcrunit.NPC_UNIT_INFO_LIST = [
  // 1番目
  [
    ['goblingreat', 'ゴブリングレート', './img/clanbattle/ゴブリングレート.jpg', true],
    ['wyvern', 'ワイバーン', './img/clanbattle/ワイバーン.jpg', true]
  ],
  // 2番目
  [
    ['landsloth', 'ランドスロース', './img/clanbattle/ランドスロース.jpg', true],
    ['rairai', 'ライライ', './img/clanbattle/ライライ.jpg', true],
    ['wildgriffin', 'ワイルドグリフォン', './img/clanbattle/ワイルドグリフォン.jpg', true]
  ],
  // 3番目
  [
    ['jackalthief', 'ジャッカルシーフ', './img/clanbattle/ジャッカルシーフ.jpg', true],
    ['madamprism', 'マダムプリズム', './img/clanbattle/マダムプリズム.jpg', true],
    ['megaraphan', 'メガラパーン', './img/clanbattle/メガラパーン.jpg', true],
    ['mushufsh', 'ムシュフシュ', './img/clanbattle/ムシュフシュ.jpg', true],
    ['needlecreeper', 'ニードルクリーパー', './img/clanbattle/ニードルクリーパー.jpg', true],
    ['orkchief', 'オークチーフ', './img/clanbattle/オークチーフ.jpg', true],
    ['raiden', 'ライデン', './img/clanbattle/ライデン.jpg', true],
    ['seadrake', 'シードレイク', './img/clanbattle/シードレイク.jpg', true],
    ['skyvalkyrie', 'スカイワルキューレ', './img/clanbattle/スカイワルキューレ.jpg', true],
    ['wraithlord', 'レイスロード', './img/clanbattle/レイスロード.jpg', true]
  ],
  // 4番目
  [
    ['cyclops', 'サイクロプス', './img/clanbattle/サイクロプス.jpg', true],
    ['darkgargoyle', 'ダークガーゴイル', './img/clanbattle/ダークガーゴイル.jpg', true],
    ['madbear', 'マッドベア', './img/clanbattle/マッドベア.jpg', true],
    ['mastersenri', 'マスターセンリ', './img/clanbattle/マスターセンリ.jpg', true],
    ['mova', 'ムーバ', './img/clanbattle/ムーバ.jpg', true],
    ['neputerion', 'ネプテリオン', './img/clanbattle/ネプテリオン.jpg', true],
    ['obsidianwyvern', 'オブシダンワイバーン', './img/clanbattle/オブシダンワイバーン.jpg', true],
    ['spirithorn', 'スピリットホーン', './img/clanbattle/スピリットホーン.jpg', true],
    ['titanoturtle', 'ティタノタートル', './img/clanbattle/ティタノタートル.jpg', true],
    ['trylocker', 'トライロッカー', './img/clanbattle/トライロッカー.jpg', true],
    ['ulfhedinn', 'ウールヴヘジン', './img/clanbattle/ウールヴヘジン.jpg', true]
  ],
  // 5番目
  [
    ['aquarios', 'アクアリオス', './img/clanbattle/アクアリオス.jpg', true],
    ['torpedon', 'トルペドン', './img/clanbattle/トルペドン.jpg', true],
    ['mesarthim', 'メサルティム', './img/clanbattle/メサルティム.jpg', true],
    ['minotaur', 'ミノタウロス', './img/clanbattle/ミノタウロス.jpg', true],
    ['twinpigs', 'ツインピッグス', './img/clanbattle/ツインピッグス.jpg', true],
    ['karkinos', 'カルキノス', './img/clanbattle/カルキノス.jpg', true],
    ['orleon', 'オルレオン', './img/clanbattle/オルレオン.jpg', true],
    ['medusa', 'メデューサ', './img/clanbattle/メデューサ.jpg', true],
    ['glutton', 'グラットン', './img/clanbattle/グラットン.jpg', true],
    ['scorpion', 'レサトパルト', './img/clanbattle/レサトパルト.jpg', true],
    ['sagittarius', 'サジタリウス', './img/clanbattle/サジタリウス.jpg', true],
    ['argeti', 'アルゲティ', './img/clanbattle/アルゲティ.jpg', true]
  ]
];

﻿// ユニット定義

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
    ['kuuka_summer', 'クウカ(サマー)', './img/arena/クウカ(サマー).jpg', true],
    ['jun', 'ジュン', './img/arena/ジュン.jpg', true],
    ['muimi_newyear', 'ムイミ(ニューイヤー)', './img/arena/ムイミ(ニューイヤー).jpg', true],
    ['kuuka_ooedo', 'クウカ(オーエド)', './img/arena/クウカ(オーエド).jpg', true],
    ['kuuka_noir', 'クウカ(ノワール)', './img/arena/クウカ(ノワール).jpg', true],
    ['jun_christmas', 'ジュン(クリスマス)', './img/arena/ジュン(クリスマス).jpg', true],
    ['kaori', 'カオリ', './img/arena/カオリ.jpg', true],
    ['rem_summer', 'レム(サマー)', './img/arena/レム(サマー).jpg', true],
    ['saren_christmas', 'サレン(クリスマス)', './img/arena/サレン(クリスマス).jpg', true],
    ['tsumugi_halloween', 'ツムギ(ハロウィン)', './img/arena/ツムギ(ハロウィン).jpg', true],
    ['rei_newyear', 'レイ(ニューイヤー)', './img/arena/レイ(ニューイヤー).jpg', true],
    ['rin_deremas', 'リン(デレマス)', './img/arena/リン(デレマス).jpg', true],
    ['pecorine', 'ペコリーヌ', './img/arena/ペコリーヌ.jpg', true],
    ['pecorine_princess', 'ペコリーヌ(プリンセス)', './img/arena/ペコリーヌ(プリンセス).jpg', true],
    ['kaori_halloween', 'カオリ(ハロウィン)', './img/arena/カオリ(ハロウィン).jpg', true],
    ['ruka_sarasaria', 'ルカ(サラサリア)', './img/arena/ルカ(サラサリア).jpg', true],
    ['ruka', 'ルカ', './img/arena/ルカ.jpg', true],
    ['kokkoro_newyear', 'コッコロ(ニューイヤー)', './img/arena/コッコロ(ニューイヤー).jpg', true],
    ['yukari_summer', 'ユカリ(サマー)', './img/arena/ユカリ(サマー).jpg', true],
    ['nozomi', 'ノゾミ', './img/arena/ノゾミ.jpg', true],
    ['muimi', 'ムイミ', './img/arena/ムイミ.jpg', true],
    ['shizuru_summer', 'シズル(サマー)', './img/arena/シズル(サマー).jpg', true],
    ['pecorine_overlord', 'ペコリーヌ(オーバーロード)', './img/arena/ペコリーヌ(オーバーロード).jpg', true],
    ['makoto', 'マコト', './img/arena/マコト.jpg', true],
    ['nea_summer', 'ネア(サマー)', './img/arena/ネア(サマー).jpg', true],
    ['makoto_cinderella', 'マコト(シンデレラ)', './img/arena/マコト(シンデレラ).jpg', true],
    ['kaya', 'カヤ', './img/arena/カヤ.jpg', true],
    ['kaya_timetravel', 'カヤ(タイムトラベル)', './img/arena/カヤ(タイムトラベル).jpg', true],
    ['hiyori_newyear', 'ヒヨリ(ニューイヤー)', './img/arena/ヒヨリ(ニューイヤー).jpg', true],
    ['kaya_liberator', 'カヤ(リベレイター)', './img/arena/カヤ(リベレイター).jpg', true],
    ['rima_cinderella', 'リマ(シンデレラ)', './img/arena/リマ(シンデレラ).jpg', true],
    ['ninon_ooedo', 'ニノン(オーエド)', './img/arena/ニノン(オーエド).jpg', true],
    ['akino', 'アキノ', './img/arena/アキノ.jpg', true],
    ['makoto_summer', 'マコト(サマー)', './img/arena/マコト(サマー).jpg', true],
    ['jun_summer', 'ジュン(サマー)', './img/arena/ジュン(サマー).jpg', true],
    ['matsuri_wild', 'マツリ(ワイルド)', './img/arena/マツリ(ワイルド).jpg', true],
    ['chloe_schoolfestival', 'クロエ(聖学祭)', './img/arena/クロエ(聖学祭).jpg', true],
    ['matsuri', 'マツリ', './img/arena/マツリ.jpg', true],
    ['chloe', 'クロエ', './img/arena/クロエ.jpg', true],
    ['matsuri_halloween', 'マツリ(ハロウィン)', './img/arena/マツリ(ハロウィン).jpg', true],
    ['eriko_valentine', 'エリコ(バレンタイン)', './img/arena/エリコ(バレンタイン).jpg', true],
    ['chloe_winter', 'クロエ(ウィンター)', './img/arena/クロエ(ウィンター).jpg', true],
    ['akino_christmas', 'アキノ(クリスマス)', './img/arena/アキノ(クリスマス).jpg', true],
    ['ayane_christmas', 'アヤネ(クリスマス)', './img/arena/アヤネ(クリスマス).jpg', true],
    ['shizuru_noir', 'シズル(ノワール)', './img/arena/シズル(ノワール).jpg', true],
    ['inori_newyear', 'イノリ(ニューイヤー)', './img/arena/イノリ(ニューイヤー).jpg', true],
    ['ruka_summer', 'ルカ(サマー)', './img/arena/ルカ(サマー).jpg', true],
    ['ruka_newyear', 'ルカ(ニューイヤー)', './img/arena/ルカ(ニューイヤー).jpg', true],
    ['rei_astral', 'レイ(アストラル)', './img/arena/レイ(アストラル).jpg', true],
    ['tsumugi', 'ツムギ', './img/arena/ツムギ.jpg', true],
    ['inori', 'イノリ', './img/arena/イノリ.jpg', true],
    ['hiyori_princess', 'ヒヨリ(プリンセス)', './img/arena/ヒヨリ(プリンセス).jpg', true],
    ['hiyori', 'ヒヨリ', './img/arena/ヒヨリ.jpg', true],
    ['misogi', 'ミソギ', './img/arena/ミソギ.jpg', true],
    ['ayane', 'アヤネ', './img/arena/アヤネ.jpg', true],
    ['misogi_halloween', 'ミソギ(ハロウィン)', './img/arena/ミソギ(ハロウィン).jpg', true],
    ['tamaki', 'タマキ', './img/arena/タマキ.jpg', true],
    ['tamaki_workclothes', 'タマキ(作業服)', './img/arena/タマキ(作業服).jpg', true],
    ['tomo', 'トモ', './img/arena/トモ.jpg', true],
    ['muimi_liberator', 'ムイミ(リベレイター)', './img/arena/ムイミ(リベレイター).jpg', true],
    ['chieru', 'チエル', './img/arena/チエル.jpg', true],
    ['chieru_schoolfestival', 'チエル(聖学祭)', './img/arena/チエル(聖学祭).jpg', true],
    ['akino_summer', 'アキノ(サマー)', './img/arena/アキノ(サマー).jpg', true],
    ['tamaki_summer', 'タマキ(サマー)', './img/arena/タマキ(サマー).jpg', true],
    ['hiyori_astral', 'ヒヨリ(アストラル)', './img/arena/ヒヨリ(アストラル).jpg', true],
    ['eriko', 'エリコ', './img/arena/エリコ.jpg', true],
    ['pecorine_summer', 'ペコリーヌ(サマー)', './img/arena/ペコリーヌ(サマー).jpg', true],
    ['misogi_summer', 'ミソギ(サマー)', './img/arena/ミソギ(サマー).jpg', true],
    ['christina_wild', 'クリスティーナ(ワイルド)', './img/arena/クリスティーナ(ワイルド).jpg', true],
    ['kurumi', 'クルミ', './img/arena/クルミ.jpg', true],
    ['djeeta', 'ジータ', './img/arena/ジータ.jpg', true],
    ['pecorine_newyear', 'ペコリーヌ(ニューイヤー)', './img/arena/ペコリーヌ(ニューイヤー).jpg', true],
    ['rei', 'レイ', './img/arena/レイ.jpg', true],
    ['rei_summer', 'レイ(サマー)', './img/arena/レイ(サマー).jpg', true],
    ['inori_timetravel', 'イノリ(タイムトラベル)', './img/arena/イノリ(タイムトラベル).jpg', true],
    ['ilya_christmas', 'イリヤ(クリスマス)', './img/arena/イリヤ(クリスマス).jpg', true],
    ['shinobu_summer', 'シノブ(サマー)', './img/arena/シノブ(サマー).jpg', true],
    ['anna_summer', 'アンナ(サマー)', './img/arena/アンナ(サマー).jpg', true],
    ['ayane_explorer', 'アヤネ(エクスプローラー)', './img/arena/アヤネ(エクスプローラー).jpg', true],
    ['labyrista_overlord', 'ラビリスタ(オーバーロード)', './img/arena/ラビリスタ(オーバーロード).jpg', true],
    ['tomo_halloween', 'トモ(ハロウィン)', './img/arena/トモ(ハロウィン).jpg', true],
    ['hiyori_summer', 'ヒヨリ(サマー)', './img/arena/ヒヨリ(サマー).jpg', true],
    ['christina_chrismas', 'クリスティーナ(クリスマス)', './img/arena/クリスティーナ(クリスマス).jpg', true],
    ['vikala', 'ビカラ', './img/arena/ビカラ.jpg', true],
    ['makoto_commander', 'マコト(コマンダー)', './img/arena/マコト(コマンダー).jpg', true],
    ['mihuyu_workclothes', 'ミフユ(作業服)', './img/arena/ミフユ(作業服).jpg', true],
    ['sheffy_newyear', 'シェフィ(ニューイヤー)', './img/arena/シェフィ(ニューイヤー).jpg', true],
    ['shizuru', 'シズル', './img/arena/シズル.jpg', true],
    ['christina', 'クリスティーナ', './img/arena/クリスティーナ.jpg', true],
    ['inori_phantomthief', 'イノリ(怪盗)', './img/arena/イノリ(怪盗).jpg', true],
    ['anna_pirate', 'アンナ(パイレーツ)', './img/arena/アンナ(パイレーツ).jpg', true],
    ['eriko_commander', 'エリコ(コマンダー)', './img/arena/エリコ(コマンダー).jpg', true],
    ['kurumi_christmas', 'クルミ(クリスマス)', './img/arena/クルミ(クリスマス).jpg', true]
  ],
  // 中衛
  [
    ['miyako_christmas', 'ミヤコ(クリスマス)', './img/arena/ミヤコ(クリスマス).jpg', true],
    ['saren_sarasaria', 'サレン(サラサリア)', './img/arena/サレン(サラサリア).jpg', true],
    ['nea', 'ネア', './img/arena/ネア.jpg', true],
    ['tsumugi_summer', 'ツムギ(サマー)', './img/arena/ツムギ(サマー).jpg', true],
    ['mimi', 'ミミ', './img/arena/ミミ.jpg', true],
    ['mimi_summer', 'ミミ(サマー)', './img/arena/ミミ(サマー).jpg', true],
    ['shinobu', 'シノブ', './img/arena/シノブ.jpg', true],
    ['mimi_halloween', 'ミミ(ハロウィン)', './img/arena/ミミ(ハロウィン).jpg', true],
    ['sheffy', 'シェフィ', './img/arena/シェフィ.jpg', true],
    ['sheffy_princess', 'シェフィ(プリンセス)', './img/arena/シェフィ(プリンセス).jpg', true],
    ['uzuki_deremas', 'ウヅキ(デレマス)', './img/arena/ウヅキ(デレマス).jpg', true],
    ['pecorine_christmas', 'ペコリーヌ(クリスマス)', './img/arena/ペコリーヌ(クリスマス).jpg', true],
    ['croce', 'クローチェ', './img/arena/クローチェ.jpg', true],
    ['rei_halloween', 'レイ(ハロウィン)', './img/arena/レイ(ハロウィン).jpg', true],
    ['rei_princess', 'レイ(プリンセス)', './img/arena/レイ(プリンセス).jpg', true],
    ['shinobu_pirate', 'シノブ(パイレーツ)', './img/arena/シノブ(パイレーツ).jpg', true],
    ['shizuru_valentine', 'シズル(バレンタイン)', './img/arena/シズル(バレンタイン).jpg', true],
    ['mahiru_ranger', 'マヒル(レンジャー)', './img/arena/マヒル(レンジャー).jpg', true],
    ['mahiru', 'マヒル', './img/arena/マヒル.jpg', true],
    ['mahiru_christmas', 'マヒル(クリスマス)', './img/arena/マヒル(クリスマス).jpg', true],
    ['riri_summer', 'リリ(サマー)', './img/arena/リリ(サマー).jpg', true],
    ['tomo_magical', 'トモ(マジカル)', './img/arena/トモ(マジカル).jpg', true],
    ['yukari', 'ユカリ', './img/arena/ユカリ.jpg', true],
    ['quria_fallen', 'クリア(フォールン)', './img/arena/クリア(フォールン).jpg', true],
    ['eriko_summer', 'エリコ(サマー)', './img/arena/エリコ(サマー).jpg', true],
    ['yukari_christmas', 'ユカリ(クリスマス)', './img/arena/ユカリ(クリスマス).jpg', true],
    ['monika', 'モニカ', './img/arena/モニカ.jpg', true],
    ['ninon', 'ニノン', './img/arena/ニノン.jpg', true],
    ['nozomi_summer', 'ノゾミ(サマー)', './img/arena/ノゾミ(サマー).jpg', true],
    ['nozomi_christmas', 'ノゾミ(クリスマス)', './img/arena/ノゾミ(クリスマス).jpg', true],
    ['yukari_camp', 'ユカリ(キャンプ)', './img/arena/ユカリ(キャンプ).jpg', true],
    ['mihuyu', 'ミフユ', './img/arena/ミフユ.jpg', true],
    ['akino_and_saren', 'アキノ＆サレン', './img/arena/アキノ＆サレン.jpg', true],
    ['rin_ranger', 'リン(レンジャー)', './img/arena/リン(レンジャー).jpg', true],
    ['nozomi_liberator', 'ノゾミ(リベレイター)', './img/arena/ノゾミ(リベレイター).jpg', true],
    ['ilya_newyear', 'イリヤ(ニューイヤー)', './img/arena/イリヤ(ニューイヤー).jpg', true],
    ['ilya', 'イリヤ', './img/arena/イリヤ.jpg', true],
    ['kaori_summer', 'カオリ(サマー)', './img/arena/カオリ(サマー).jpg', true],
    ['saren', 'サレン', './img/arena/サレン.jpg', true],
    ['yori_christmas', 'ヨリ(クリスマス)', './img/arena/ヨリ(クリスマス).jpg', true],
    ['akari_christmas', 'アカリ(クリスマス)', './img/arena/アカリ(クリスマス).jpg', true],
    ['anna', 'アンナ', './img/arena/アンナ.jpg', true],
    ['shinobu_halloween', 'シノブ(ハロウィン)', './img/arena/シノブ(ハロウィン).jpg', true],
    ['kururu', 'クルル', './img/arena/クルル.jpg', true],
    ['djeeta_warlock', 'ジータ(ウォーロック)', './img/arena/ジータ(ウォーロック).jpg', true],
    ['yuki_gishouzoku', 'ユキ(儀装束)', './img/arena/ユキ(儀装束).jpg', true],
    ['monika_cafe', 'モニカ(カフェ)', './img/arena/モニカ(カフェ).jpg', true],
    ['riri_fallen', 'リリ(フォールン)', './img/arena/リリ(フォールン).jpg', true],
    ['misogi_and_mimi_and_kyouka', 'ミソギ＆ミミ＆キョウカ', './img/arena/ミソギ＆ミミ＆キョウカ.jpg', true],
    ['nanaka_summer', 'ナナカ(サマー)', './img/arena/ナナカ(サマー).jpg', true],
    ['precia_fallen', 'プレシア(フォールン)', './img/arena/プレシア(フォールン).jpg', true],
    ['mihuyu_summer', 'ミフユ(サマー)', './img/arena/ミフユ(サマー).jpg', true],
    ['kokkoro', 'コッコロ', './img/arena/コッコロ.jpg', true],
    ['ayumi_wonder', 'アユミ(ワンダー)', './img/arena/アユミ(ワンダー).jpg', true],
    ['ayumi', 'アユミ', './img/arena/アユミ.jpg', true],
    ['ninon_halloween', 'ニノン(ハロウィン)', './img/arena/ニノン(ハロウィン).jpg', true],
    ['chika_summer', 'チカ(サマー)', './img/arena/チカ(サマー).jpg', true],
    ['grea', 'グレア', './img/arena/グレア.jpg', true],
    ['aoi_workclothes', 'アオイ(作業服)', './img/arena/アオイ(作業服).jpg', true],
    ['monika_magical', 'モニカ(マジカル)', './img/arena/モニカ(マジカル).jpg', true],
    ['akari_angel', 'アカリ(エンジェル)', './img/arena/アカリ(エンジェル).jpg', true],
    ['yori_angel', 'ヨリ(エンジェル)', './img/arena/ヨリ(エンジェル).jpg', true],
    ['kokkoro_gishouzoku', 'コッコロ(儀装束)', './img/arena/コッコロ(儀装束).jpg', true],
    ['kokkoro_summer', 'コッコロ(サマー)', './img/arena/コッコロ(サマー).jpg', true],
    ['rem', 'レム', './img/arena/レム.jpg', true],
    ['nephinera', 'ネフィ＝ネラ', './img/arena/ネフィ＝ネラ.jpg', true],
    ['ram', 'ラム', './img/arena/ラム.jpg', true],
    ['rin', 'リン', './img/arena/リン.jpg', true],
    ['anemone', 'アネモネ', './img/arena/アネモネ.jpg', true],
    ['shizuru_and_rino', 'シズル＆リノ', './img/arena/シズル＆リノ.jpg', true],
    ['mitsuki_ooedo', 'ミツキ(オーエド)', './img/arena/ミツキ(オーエド).jpg', true],
    ['yui_summer', 'ユイ(サマー)', './img/arena/ユイ(サマー).jpg', true],
    ['kokkoro_princess', 'コッコロ(プリンセス)', './img/arena/コッコロ(プリンセス).jpg', true],
    ['suzume_spring', 'スズメ(スプリング)', './img/arena/スズメ(スプリング).jpg', true],
    ['labyrista', 'ラビリスタ', './img/arena/ラビリスタ.jpg', true],
    ['neneka_newyear', 'ネネカ(ニューイヤー)', './img/arena/ネネカ(ニューイヤー).jpg', true],
    ['kyouka_spring', 'キョウカ(スプリング)', './img/arena/キョウカ(スプリング).jpg', true],
    ['vampy', 'ヴァンピィ', './img/arena/ヴァンピィ.jpg', true],
    ['mitsuki', 'ミツキ', './img/arena/ミツキ.jpg', true],
    ['hatsune_summer', 'ハツネ(サマー)', './img/arena/ハツネ(サマー).jpg', true],
    ['ilya_gishouzoku', 'イリヤ(儀装束)', './img/arena/イリヤ(儀装束).jpg', true],
    ['akari', 'アカリ', './img/arena/アカリ.jpg', true],
    ['yori', 'ヨリ', './img/arena/ヨリ.jpg', true],
    ['anne_and_grea', 'アン＆グレア', './img/arena/アン＆グレア.jpg', true],
    ['yui_gishouzoku', 'ユイ(儀装束)', './img/arena/ユイ(儀装束).jpg', true],
    ['karin_alchemist', 'カリン(アルケミスト)', './img/arena/カリン(アルケミスト).jpg', true],
    ['rin_halloween', 'リン(ハロウィン)', './img/arena/リン(ハロウィン).jpg', true],
    ['saren_summer', 'サレン(サマー)', './img/arena/サレン(サマー).jpg', true],
    ['karyl_overlord', 'キャル(オーバーロード)', './img/arena/キャル(オーバーロード).jpg', true],
    ['miyako_halloween', 'ミヤコ(ハロウィン)', './img/arena/ミヤコ(ハロウィン).jpg', true],
    ['ayumi_phantomthief', 'アユミ(怪盗)', './img/arena/アユミ(怪盗).jpg', true],
    ['mitsuki_newyear', 'ミツキ(ニューイヤー)', './img/arena/ミツキ(ニューイヤー).jpg', true]
  ],
  // 後衛
  [
    ['arisa', 'アリサ', './img/arena/アリサ.jpg', true],
    ['anne', 'アン', './img/arena/アン.jpg', true],
    ['lou', 'ルゥ', './img/arena/ルゥ.jpg', true],
    ['maho_cinderella', 'マホ(シンデレラ)', './img/arena/マホ(シンデレラ).jpg', true],
    ['neneka_summer', 'ネネカ(サマー)', './img/arena/ネネカ(サマー).jpg', true],
    ['kaiserinsight', 'カイザーインサイト', './img/arena/カイザーインサイト.jpg', true],
    ['neneka', 'ネネカ', './img/arena/ネネカ.jpg', true],
    ['aoi_hennyuusei', 'アオイ(編入生)', './img/arena/アオイ(編入生).jpg', true],
    ['ranpha_summer', 'ランファ(サマー)', './img/arena/ランファ(サマー).jpg', true],
    ['karyl_newyear', 'キャル(ニューイヤー)', './img/arena/キャル(ニューイヤー).jpg', true],
    ['lind', 'リンド', './img/arena/リンド.jpg', true],
    ['mio_deremas', 'ミオ(デレマス)', './img/arena/ミオ(デレマス).jpg', true],
    ['misato_summer', 'ミサト(サマー)', './img/arena/ミサト(サマー).jpg', true],
    ['misato_newyear', 'ミサト(ニューイヤー)', './img/arena/ミサト(ニューイヤー).jpg', true],
    ['rino', 'リノ', './img/arena/リノ.jpg', true],
    ['maho_dreampark', 'マホ(ドリームパーク)', './img/arena/マホ(ドリームパーク).jpg', true],
    ['suzuna', 'スズナ', './img/arena/スズナ.jpg', true],
    ['suzuna_summer', 'スズナ(サマー)', './img/arena/スズナ(サマー).jpg', true],
    ['wurm', 'ヴルム', './img/arena/ヴルム.jpg', true],
    ['homare_newyear', 'ホマレ(ニューイヤー)', './img/arena/ホマレ(ニューイヤー).jpg', true],
    ['yuni_winter', 'ユニ(ウィンター)', './img/arena/ユニ(ウィンター).jpg', true],
    ['homare_summer', 'ホマレ(サマー)', './img/arena/ホマレ(サマー).jpg', true],
    ['shiori', 'シオリ', './img/arena/シオリ.jpg', true],
    ['shiori_ranger', 'シオリ(レンジャー)', './img/arena/シオリ(レンジャー).jpg', true],
    ['shiori_magical', 'シオリ(マジカル)', './img/arena/シオリ(マジカル).jpg', true],
    ['io_noir', 'イオ(ノワール)', './img/arena/イオ(ノワール).jpg', true],
    ['io', 'イオ', './img/arena/イオ.jpg', true],
    ['io_summer', 'イオ(サマー)', './img/arena/イオ(サマー).jpg', true],
    ['suzume', 'スズメ', './img/arena/スズメ.jpg', true],
    ['nozomi_alchemist', 'ノゾミ(アルケミスト)', './img/arena/ノゾミ(アルケミスト).jpg', true],
    ['suzume_newyear', 'スズメ(ニューイヤー)', './img/arena/スズメ(ニューイヤー).jpg', true],
    ['creditta_christmas', 'クレジッタ(クリスマス)', './img/arena/クレジッタ(クリスマス).jpg', true],
    ['emilia', 'エミリア', './img/arena/エミリア.jpg', true],
    ['emilia_summer', 'エミリア(サマー)', './img/arena/エミリア(サマー).jpg', true],
    ['homare', 'ホマレ', './img/arena/ホマレ.jpg', true],
    ['kasumi', 'カスミ', './img/arena/カスミ.jpg', true],
    ['kasumi_magical', 'カスミ(マジカル)', './img/arena/カスミ(マジカル).jpg', true],
    ['rino_wonder', 'リノ(ワンダー)', './img/arena/リノ(ワンダー).jpg', true],
    ['misora', 'ミソラ', './img/arena/ミソラ.jpg', true],
    ['kurumi_stage', 'クルミ(ステージ)', './img/arena/クルミ(ステージ).jpg', true],
    ['aoi_camp', 'アオイ(キャンプ)', './img/arena/アオイ(キャンプ).jpg', true],
    ['hatsune_and_shiori', 'ハツネ＆シオリ', './img/arena/ハツネ＆シオリ.jpg', true],
    ['misato', 'ミサト', './img/arena/ミサト.jpg', true],
    ['kasumi_summer', 'カスミ(サマー)', './img/arena/カスミ(サマー).jpg', true],
    ['kasumi_newyear', 'カスミ(ニューイヤー)', './img/arena/カスミ(ニューイヤー).jpg', true],
    ['nanaka', 'ナナカ', './img/arena/ナナカ.jpg', true],
    ['lyrael', 'ライラエル', './img/arena/ライラエル.jpg', true],
    ['nanaka_halloween', 'ナナカ(ハロウィン)', './img/arena/ナナカ(ハロウィン).jpg', true],
    ['misaki_stage', 'ミサキ(ステージ)', './img/arena/ミサキ(ステージ).jpg', true],
    ['ameth_summer', 'アメス(サマー)', './img/arena/アメス(サマー).jpg', true],
    ['yui_newyear', 'ユイ(ニューイヤー)', './img/arena/ユイ(ニューイヤー).jpg', true],
    ['ameth', 'アメス', './img/arena/アメス.jpg', true],
    ['karyl_princess', 'キャル(プリンセス)', './img/arena/キャル(プリンセス).jpg', true],
    ['karyl', 'キャル', './img/arena/キャル.jpg', true],
    ['suzuna_hennyuusei', 'スズナ(編入生)', './img/arena/スズナ(編入生).jpg', true],
    ['creditta', 'クレジッタ', './img/arena/クレジッタ.jpg', true],
    ['kokkoro_ranger', 'コッコロ(レンジャー)', './img/arena/コッコロ(レンジャー).jpg', true],
    ['misora_summer', 'ミソラ(サマー)', './img/arena/ミソラ(サマー).jpg', true],
    ['hatsune', 'ハツネ', './img/arena/ハツネ.jpg', true],
    ['misaki', 'ミサキ', './img/arena/ミサキ.jpg', true],
    ['suzuna_halloween', 'スズナ(ハロウィン)', './img/arena/スズナ(ハロウィン).jpg', true],
    ['rino_christmas', 'リノ(クリスマス)', './img/arena/リノ(クリスマス).jpg', true],
    ['luna', 'ルナ', './img/arena/ルナ.jpg', true],
    ['yui_princess', 'ユイ(プリンセス)', './img/arena/ユイ(プリンセス).jpg', true],
    ['chika_christmas', 'チカ(クリスマス)', './img/arena/チカ(クリスマス).jpg', true],
    ['yui_astral', 'ユイ(アストラル)', './img/arena/ユイ(アストラル).jpg', true],
    ['suzume_summer', 'スズメ(サマー)', './img/arena/スズメ(サマー).jpg', true],
    ['echidna_summer', 'エキドナ(サマー)', './img/arena/エキドナ(サマー).jpg', true],
    ['karyl_summer', 'キャル(サマー)', './img/arena/キャル(サマー).jpg', true],
    ['ranpha', 'ランファ', './img/arena/ランファ.jpg', true],
    ['aoi', 'アオイ', './img/arena/アオイ.jpg', true],
    ['karin', 'カリン', './img/arena/カリン.jpg', true],
    ['chika', 'チカ', './img/arena/チカ.jpg', true],
    ['maho_summer', 'マホ(サマー)', './img/arena/マホ(サマー).jpg', true],
    ['maho_explorer', 'マホ(エクスプローラー)', './img/arena/マホ(エクスプローラー).jpg', true],
    ['maho', 'マホ', './img/arena/マホ.jpg', true],
    ['yuki_ooedo', 'ユキ(オーエド)', './img/arena/ユキ(オーエド).jpg', true],
    ['yui', 'ユイ', './img/arena/ユイ.jpg', true],
    ['eris', 'エリス', './img/arena/エリス.jpg', true],
    ['hatsune_newyear', 'ハツネ(ニューイヤー)', './img/arena/ハツネ(ニューイヤー).jpg', true],
    ['karyl_hennyuusei', 'キャル(編入生)', './img/arena/キャル(編入生).jpg', true],
    ['yuki', 'ユキ', './img/arena/ユキ.jpg', true],
    ['yuni', 'ユニ', './img/arena/ユニ.jpg', true],
    ['yuni_schoolfestival', 'ユニ(聖学祭)', './img/arena/ユニ(聖学祭).jpg', true],
    ['kyouka', 'キョウカ', './img/arena/キョウカ.jpg', true],
    ['kyouka_summer', 'キョウカ(サマー)', './img/arena/キョウカ(サマー).jpg', true],
    ['misaki_halloween', 'ミサキ(ハロウィン)', './img/arena/ミサキ(ハロウィン).jpg', true],
    ['kyouka_halloween', 'キョウカ(ハロウィン)', './img/arena/キョウカ(ハロウィン).jpg', true],
    ['tamaki_cafe', 'タマキ(カフェ)', './img/arena/タマキ(カフェ).jpg', true],
    ['nebbia', 'ネビア', './img/arena/ネビア.jpg', true]
  ]
];

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/

// NPCユニット情報一覧
pcrunit.NPC_UNIT_INFO_LIST = [
  // 1番目
  [
    ['frosthound', 'フロストハウンド', './img/clanbattle/フロストハウンド.jpg', true],
    ['goblingreat', 'ゴブリングレート', './img/clanbattle/ゴブリングレート.jpg', true],
    ['greatergolem', 'グレーターゴーレム', './img/clanbattle/グレーターゴーレム.jpg', true],
    ['madamelectra', 'マダムエレクトラ', './img/clanbattle/マダムエレクトラ.jpg', true],
    ['wyvern', 'ワイバーン', './img/clanbattle/ワイバーン.jpg', true]
  ],
  // 2番目
  [
    ['goblinrider', 'ゴブリンライダー', './img/clanbattle/ゴブリンライダー.jpg', true],
    ['landsloth', 'ランドスロース', './img/clanbattle/ランドスロース.jpg', true],
    ['rairai', 'ライライ', './img/clanbattle/ライライ.jpg', true],
    ['toughgeist', 'タフガイスト', './img/clanbattle/タフガイスト.jpg', true],
    ['wildgriffin', 'ワイルドグリフォン', './img/clanbattle/ワイルドグリフォン.jpg', true]
  ],
  // 3番目
  [
    ['basilisk', 'バジリスク', './img/clanbattle/バジリスク.jpg', true],
    ['burnsaurus', 'バーンサウルス', './img/clanbattle/バーンサウルス.jpg', true],
    ['dragator', 'ドロゲーター', './img/clanbattle/ドロゲーター.jpg', true],
    ['jackalthief', 'ジャッカルシーフ', './img/clanbattle/ジャッカルシーフ.jpg', true],
    ['madamprism', 'マダムプリズム', './img/clanbattle/マダムプリズム.jpg', true],
    ['megaraphan', 'メガラパーン', './img/clanbattle/メガラパーン.jpg', true],
    ['mushufsh', 'ムシュフシュ', './img/clanbattle/ムシュフシュ.jpg', true],
    ['needlecreeper', 'ニードルクリーパー', './img/clanbattle/ニードルクリーパー.jpg', true],
    ['orkchief', 'オークチーフ', './img/clanbattle/オークチーフ.jpg', true],
    ['raiden', 'ライデン', './img/clanbattle/ライデン.jpg', true],
    ['seadrake', 'シードレイク', './img/clanbattle/シードレイク.jpg', true],
    ['skyvalkyrie', 'スカイワルキューレ', './img/clanbattle/スカイワルキューレ.jpg', true],
    ['venomsalamander', 'ベノムサラマンドラ', './img/clanbattle/ベノムサラマンドラ.jpg', true],
    ['wraithlord', 'レイスロード', './img/clanbattle/レイスロード.jpg', true]
  ],
  // 4番目
  [
    ['cyclops', 'サイクロプス', './img/clanbattle/サイクロプス.jpg', true],
    ['darkgargoyle', 'ダークガーゴイル', './img/clanbattle/ダークガーゴイル.jpg', true],
    ['flowerchevalier', 'フラワーシュバリエ', './img/clanbattle/フラワーシュバリエ.jpg', true],
    ['madbear', 'マッドベア', './img/clanbattle/マッドベア.jpg', true],
    ['mastersenri', 'マスターセンリ', './img/clanbattle/マスターセンリ.jpg', true],
    ['mova', 'ムーバ', './img/clanbattle/ムーバ.jpg', true],
    ['neputerion', 'ネプテリオン', './img/clanbattle/ネプテリオン.jpg', true],
    ['obsidianwyvern', 'オブシダンワイバーン', './img/clanbattle/オブシダンワイバーン.jpg', true],
    ['rainspirit', 'レインスピリット', './img/clanbattle/レインスピリット.jpg', true],
    ['spirithorn', 'スピリットホーン', './img/clanbattle/スピリットホーン.jpg', true],
    ['swordcobra', 'ソードコブラ', './img/clanbattle/ソードコブラ.jpg', true],
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

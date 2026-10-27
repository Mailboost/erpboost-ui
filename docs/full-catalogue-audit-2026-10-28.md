# 全ページ比較と修正記録（2026-10-27〜28）

参照: https://ui.tailor.tech/  
公開先: https://mailboost.github.io/erpboost-ui/

以前の抜き取り確認を広げ、ホーム・カテゴリ3ページ・Components 38・Pages 10・Patterns 19の全71 URLを比較した。Pages / Patternsには57プレビューがある。**全ページを訪問したことと、全操作・全画素が一致したことは区別する。完全一致とは判定していない。**

## 今回の比較方法

| 条件 | 全ページの確認 | スクロール撮影 |
| --- | --- | --- |
| 1280×720 / 英語 / ライト | 71 / 71 | ページ末尾まで。差分修正後に関連ページを再確認 |
| 1280×720 / 英語 / ダーク | 71 / 71 | 各サイト154フレーム |
| 375×812 / 日本語 / ライト | 71 / 71 | 各サイト183フレーム。修正ページは再撮影 |

- 同じ実ビューポートで参照と実装を読み込み、遅延読み込みとサイドバーの開閉アニメーション完了を待った。
- 外側のスクロール領域を最下部まで撮影。Layout / DataTableは内側のスクロール末尾も比較した。
- 本文の文字、文字サイズ・行高・太さ・書体・配色・位置・寸法を照合した。入力欄についても全71ページで種類・placeholder・disabled・checked・書体・行高・影を追加比較。隠しフォーム入力は表示比較から除外した。
- スクリーンショット差分も確認し、DOMの本文比較では拾えないアイコン色、バッジのドット、入力欄の初期値・等幅フォントを修正した。
- JPEG画像の圧縮・文字アンチエイリアス・スクロールバーのフェード・チャートアニメーションは画素差を生むため、差分画像だけで不一致・一致を断定しない。

## 修正内容

| 対象 | 修正 |
| --- | --- |
| カタログ共通 | 末尾の余白、Primitives usedのリスト・書体・リンク、カテゴリ紹介文、セクションナビの幅 |
| サイドバー | 選択中の文字の太さ、言語切替の寸法・余白・下線 |
| ページのプレビュー | Assistant / Chat / Document / Emailの重複した内側余白、Documentのモバイル用ヘッダ配置、展開アイコンの色 |
| Document補足 | 62箇所の日本語訳を追加し、補足説明と表をページ末尾まで一致させた |
| 入力欄 | emailの初期値、Input / Field.Control / Combobox / Autocompleteの影、検索placeholder、Markdown入力の等幅フォント |
| DateField / DatePicker / Form | 横幅、説明・エラー位置、必須エラーの太さ、フォームの2列配置 |
| 基本部品 | Button / Badgeの間隔とアイコン、Alertの配置、Attachment / Avatar / ActivityCardの文字、Menu見出し、DescriptionCardの値、MetricCardのトレンド色 |
| Tabs / Layout / DataTable | タブの背景・文字の太さ、Layoutの高さと行背景、空表示の位置、ステータス色 |
| Select | @base-ui/reactを1.7.0へ固定し、複数選択のポップアップが選択末尾に揃う挙動を再現。依存再読込後に実操作で比較 |
| Supplier / Thread / RightSheet | 最大幅、シートを開いたときの余白、背景なしモードの説明文 |
| Bulk actions | 一括操作バーの位置、Approve / Rejectでサンプル行を書き換えず選択解除する挙動 |
| Code | ファイル選択、14pxアイコン、Copy allのFilesアイコンとCopied all表示、ソースの等幅フォント、折返しを参照に合わせた |
| フォント | 参照で使用するInterとJetBrains Monoをローカル配信し、OFLと出典を記載 |

以前の記録にあった「モバイルのCodeボタンを折り返してパネル内に収める」変更は撤回した。今回は参照と同じ折り返さない配置へ変更している。

## 操作の追加確認

下記は参照と実装を実際に操作した。全ボタンの全入力組み合わせを網羅したという意味ではない。前回までのCSV・ビルダー・コピー確認は[過去の操作記録](interaction-audit-2026-10-27.md)に残す。

| 対象 | 操作 |
| --- | --- |
| Dialog / Sheet / Menu / Tooltip | 開閉、Escape、フォーカス、チェック切替。モバイルのアニメーション完了後も比較 |
| Select / Combobox / Autocomplete / DatePicker | 単一・複数選択、検索・該当なし、キーボード選択、日付の境界 |
| Form / Form as page | 送信結果JSON、ステップ2〜4の遷移 |
| CSV importer | モバイルの開閉。CSV実ファイルの内容一致は前回記録参照 |
| Assistant / Chat / Email | 質問・出典・ツール・エラー、会話切替・入力・送信、メール選択・未読・スター・検索0件 |
| Detail / Collection | タブ・検索・0件、一覧/グリッド、選択と解除 |
| Document | 編集・タイトル/本文保存・新規文書 |
| Kanban | カード詳細、Table / Expandの選択状態を明示確認 |
| Timeline | メニュー、分割、レーン追加・名称・色変更、Move down、リセット |
| Conversation | 送信・返信、Markdownプレビュー、添付プレビュー、編集保存・Like |
| RightSheet | 背景あり/なしの2モード |
| Profile | モバイルの小型/2列フォーム |
| Code / 検索 | ファイル切替とコピー表示。モバイルのサイドバー検索でfield-diffを絞り込み、ArrowDown / Enterで両サイトとも差分テーブルへ遷移 |

## 残る相違・検証の限界

1. ERPboostの名前・ロゴ・パッケージimportは自社表記。ホームの製品紹介も異なる。ソース本文のバイト一致は主張しない。
2. 参照側のマスタ編集ではName / DescriptionがSave後に元へ戻る。ERPboost側は修正済みの保存処理を維持する。今回も保存→再編集でこの相違を再確認した。サーバー保存の検証ではなく、デモ内の状態保持である。
3. GanttのDiscoveryラベルは参照でもフォント読み込み順により内側/外側が変わる。Mayラベルにも約0.8pxの計測差が出る。アニメーション・読み込みタイミングを含めた全画素一致は保証しない。
4. ドラッグによる並べ替えは、両サイトとも検証ブラウザのドラッグで順序が変わらず、成功確認できていない。代替のネイティブアプリ操作は安全審査で拒否された。Move downなど別の操作の成功をドラッグ成功とは数えない。
5. フレームワークの`/__appinfo`は実装側に存在し、参照は404。可視カタログ71 URLとは別の相違として記録する。
6. 表示専用ボタン、デモの状態保存、メール送信・AI呼出し・バックエンド永続化は別物。参照に実処理のないボタンへ実サービスの処理を加えていない。

## 検証コマンド

- `npm run typecheck`
- `BASE_PATH=/erpboost-ui/ npm run build`
- `npm run check:package`（npm packを別Reactアプリへインストールして型チェック・本番ビルド）
- `node scripts/export-pages.mjs`（ホームに加えて70可視ルートと__appinfoを出力）

ローカル証跡は `/tmp/erpboost-ui-full-audit-20261027/` に保存した。デプロイ成功・公開ページの読み込みと操作は、ビルド検証と別に確認する。

## 訪問した全URL

各行の○は、その条件でページを読み込み末尾まで確認したことを表す。無条件の完全一致という意味ではない。

| URL | PCライト | PCダーク | モバイル日本語 |
| --- | --- | --- | --- |
| `/` | ○ | ○ | ○ |
| `/components` | ○ | ○ | ○ |
| `/page` | ○ | ○ | ○ |
| `/patterns` | ○ | ○ | ○ |
| `/components/overview` | ○ | ○ | ○ |
| `/components/foundation` | ○ | ○ | ○ |
| `/components/action-panel` | ○ | ○ | ○ |
| `/components/activity-card` | ○ | ○ | ○ |
| `/components/alert` | ○ | ○ | ○ |
| `/components/attachment` | ○ | ○ | ○ |
| `/components/app-shell` | ○ | ○ | ○ |
| `/components/auth-provider` | ○ | ○ | ○ |
| `/components/autocomplete` | ○ | ○ | ○ |
| `/components/avatar` | ○ | ○ | ○ |
| `/components/badge` | ○ | ○ | ○ |
| `/components/button` | ○ | ○ | ○ |
| `/components/calendar` | ○ | ○ | ○ |
| `/components/card` | ○ | ○ | ○ |
| `/components/collection-control-provider` | ○ | ○ | ○ |
| `/components/combobox` | ○ | ○ | ○ |
| `/components/command-palette` | ○ | ○ | ○ |
| `/components/csv-importer` | ○ | ○ | ○ |
| `/components/data-table` | ○ | ○ | ○ |
| `/components/date-field` | ○ | ○ | ○ |
| `/components/date-picker` | ○ | ○ | ○ |
| `/components/description-card` | ○ | ○ | ○ |
| `/components/dialog` | ○ | ○ | ○ |
| `/components/field` | ○ | ○ | ○ |
| `/components/fieldset` | ○ | ○ | ○ |
| `/components/form` | ○ | ○ | ○ |
| `/components/input` | ○ | ○ | ○ |
| `/components/layout` | ○ | ○ | ○ |
| `/components/link` | ○ | ○ | ○ |
| `/components/menu` | ○ | ○ | ○ |
| `/components/metric-card` | ○ | ○ | ○ |
| `/components/select` | ○ | ○ | ○ |
| `/components/sheet` | ○ | ○ | ○ |
| `/components/sidebar` | ○ | ○ | ○ |
| `/components/table` | ○ | ○ | ○ |
| `/components/tabs` | ○ | ○ | ○ |
| `/components/tooltip` | ○ | ○ | ○ |
| `/components/with-guard` | ○ | ○ | ○ |
| `/page/assistant-panel` | ○ | ○ | ○ |
| `/page/chat` | ○ | ○ | ○ |
| `/page/collection` | ○ | ○ | ○ |
| `/page/dashboard-with-charts` | ○ | ○ | ○ |
| `/page/detail-2col-action-panel` | ○ | ○ | ○ |
| `/page/document-page` | ○ | ○ | ○ |
| `/page/email` | ○ | ○ | ○ |
| `/page/form-as-page` | ○ | ○ | ○ |
| `/page/pipeline-kanban` | ○ | ○ | ○ |
| `/page/simple-master-crud` | ○ | ○ | ○ |
| `/patterns/ai-chat` | ○ | ○ | ○ |
| `/patterns/approval-flow` | ○ | ○ | ○ |
| `/patterns/approval-route-builder` | ○ | ○ | ○ |
| `/patterns/bulk-actions-bar` | ○ | ○ | ○ |
| `/patterns/conversation-thread` | ○ | ○ | ○ |
| `/patterns/data-charts` | ○ | ○ | ○ |
| `/patterns/datatable-inline-edit` | ○ | ○ | ○ |
| `/patterns/field-diff-table` | ○ | ○ | ○ |
| `/patterns/form-builder` | ○ | ○ | ○ |
| `/patterns/grid-view` | ○ | ○ | ○ |
| `/patterns/multi-step-form` | ○ | ○ | ○ |
| `/patterns/notification-panel` | ○ | ○ | ○ |
| `/patterns/pipeline-stage-manager` | ○ | ○ | ○ |
| `/patterns/rich-text-editor` | ○ | ○ | ○ |
| `/patterns/right-sheet-custom` | ○ | ○ | ○ |
| `/patterns/supplier-cascader` | ○ | ○ | ○ |
| `/patterns/thread-composer` | ○ | ○ | ○ |
| `/patterns/timeline` | ○ | ○ | ○ |
| `/patterns/user-profile-dialog` | ○ | ○ | ○ |

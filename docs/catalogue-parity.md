# カタログ比較記録

比較日: 2026-10-27。参照: https://ui.tailor.tech/ 。対象は Components 38、Pages 10、Patterns 19 の全67項目。Pages / Patterns は計57バリエーションです。

入力検証・取消・フォーカス・保存後の再表示などの追加確認と修正は[操作挙動の再比較](interaction-audit-2026-10-27.md)を参照してください。参照側にも存在したマスタ保存不具合はERPboost側で修正しています。

## 変更した内容

- 参照サイトの公開 Code / Copy as Markdown の例を使い、独自の簡略化デモを置き換えた。サンプルデータ、状態遷移、ファイル構成、説明・Do / Don't、日本語見出しを揃えた。
- コンポーネントの使用例、ページの720pxフレーム、チャートの2列配置、プレビュー幅384px / 768px、背景切替、コードのファイル切替・コピーを揃えた。
- 基本色、ステータス色、ライト/ダークの Alert / Badge、ボタン・カード・入力欄の寸法と余白を修正した。
- Tiptap は修正済みの3系を使用し、公開例のAPIと描画構造の差を調整した。

## 検証の範囲

1280px幅のブラウザで参照と実装を読み込み、Components全38項目の見出し・カード・表、Pages / Patterns全57プレビューの幅・高さを比較した。ページ系プレビューの測定値は小数第1位まで一致した。DescriptionCardには0.5pxの端数差があり、文字描画の全画素比較を行ったという意味ではない。

日本語表示とダークテーマの差分テーブルでは、説明・サンプル文字列・寸法・セル余白・配色も比較した。全項目を全テーマ・全幅・全操作の組み合わせで画素比較したという保証ではない。

ブラウザで操作した代表例:

- Field diff: All / Changed only、キーボードによるタブ選択
- Approval flow: コメント、承認、差戻し、リセット
- Approval route builder: ステージ追加・名前変更、JSON出力
- Bulk actions: 複数選択、一括承認、選択解除
- Inline edit / Form builder / Pipeline stages: 編集、追加、削除と出力更新
- Forms: 必須検証、選択変更、ウィザードの前後移動と入力保持
- Thread / AI chat: 返信、リアクション、スクリプト再生、ツール実行結果・出典表示
- Collection / Email / Detail: 検索・絞り込み・表示切替
- Document / Master list / Profile: 編集、保存、再表示
- Gantt / Timeline: 日付入力・カレンダー選択・保存、バー分割、レーン名変更
- CSV importer: サンプルCSV選択、列マッピング、検証、取込完了
- Right sheet / Notification / Assistant panel: 開閉、既読切替
- Code: 複数ファイルの選択、選択ファイルと全ファイルのコピー

参照の Save / Discard / Reply などには表示だけのボタンも含まれる。公開例に処理がない場合はそのまま維持し、実サービスへの保存・メール送信・モデル呼び出しとは区別している。

参照の Primitives used にある Checkbox 等の一部リンクは、参照サイト自身で404になることを確認した。対応するリンク構成は保持している。ERPboostのロゴ・パッケージ名は自社表記とする。

型チェック、公開用ビルド、GitHub Pages各URL出力、npm packを外部Reactアプリにインストールした型チェック・本番ビルドを実施。公開環境への反映はGitHub Actionsのデプロイ結果と公開画面で別途確認する。

## 項目別の確認

| 項目 | Pages / Patterns のバリエーション数 | 比較範囲 |
| --- | ---: | --- |
| [/components/overview](https://mailboost.github.io/erpboost-ui/components/overview/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/foundation](https://mailboost.github.io/erpboost-ui/components/foundation/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/action-panel](https://mailboost.github.io/erpboost-ui/components/action-panel/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/activity-card](https://mailboost.github.io/erpboost-ui/components/activity-card/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/alert](https://mailboost.github.io/erpboost-ui/components/alert/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/attachment](https://mailboost.github.io/erpboost-ui/components/attachment/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/app-shell](https://mailboost.github.io/erpboost-ui/components/app-shell/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/auth-provider](https://mailboost.github.io/erpboost-ui/components/auth-provider/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/autocomplete](https://mailboost.github.io/erpboost-ui/components/autocomplete/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/avatar](https://mailboost.github.io/erpboost-ui/components/avatar/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/badge](https://mailboost.github.io/erpboost-ui/components/badge/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/button](https://mailboost.github.io/erpboost-ui/components/button/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/calendar](https://mailboost.github.io/erpboost-ui/components/calendar/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/card](https://mailboost.github.io/erpboost-ui/components/card/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/collection-control-provider](https://mailboost.github.io/erpboost-ui/components/collection-control-provider/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/combobox](https://mailboost.github.io/erpboost-ui/components/combobox/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/command-palette](https://mailboost.github.io/erpboost-ui/components/command-palette/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/csv-importer](https://mailboost.github.io/erpboost-ui/components/csv-importer/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/data-table](https://mailboost.github.io/erpboost-ui/components/data-table/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/date-field](https://mailboost.github.io/erpboost-ui/components/date-field/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/date-picker](https://mailboost.github.io/erpboost-ui/components/date-picker/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/description-card](https://mailboost.github.io/erpboost-ui/components/description-card/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/dialog](https://mailboost.github.io/erpboost-ui/components/dialog/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/field](https://mailboost.github.io/erpboost-ui/components/field/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/fieldset](https://mailboost.github.io/erpboost-ui/components/fieldset/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/form](https://mailboost.github.io/erpboost-ui/components/form/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/input](https://mailboost.github.io/erpboost-ui/components/input/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/layout](https://mailboost.github.io/erpboost-ui/components/layout/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/link](https://mailboost.github.io/erpboost-ui/components/link/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/menu](https://mailboost.github.io/erpboost-ui/components/menu/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/metric-card](https://mailboost.github.io/erpboost-ui/components/metric-card/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/select](https://mailboost.github.io/erpboost-ui/components/select/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/sheet](https://mailboost.github.io/erpboost-ui/components/sheet/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/sidebar](https://mailboost.github.io/erpboost-ui/components/sidebar/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/table](https://mailboost.github.io/erpboost-ui/components/table/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/tabs](https://mailboost.github.io/erpboost-ui/components/tabs/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/tooltip](https://mailboost.github.io/erpboost-ui/components/tooltip/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/components/with-guard](https://mailboost.github.io/erpboost-ui/components/with-guard/) | — | 説明・使用例・主要なカード/表の寸法を比較 |
| [/page/assistant-panel](https://mailboost.github.io/erpboost-ui/page/assistant-panel/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/page/chat](https://mailboost.github.io/erpboost-ui/page/chat/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/page/collection](https://mailboost.github.io/erpboost-ui/page/collection/) | 3 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/page/dashboard-with-charts](https://mailboost.github.io/erpboost-ui/page/dashboard-with-charts/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/page/detail-2col-action-panel](https://mailboost.github.io/erpboost-ui/page/detail-2col-action-panel/) | 2 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/page/document-page](https://mailboost.github.io/erpboost-ui/page/document-page/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/page/email](https://mailboost.github.io/erpboost-ui/page/email/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/page/form-as-page](https://mailboost.github.io/erpboost-ui/page/form-as-page/) | 3 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/page/pipeline-kanban](https://mailboost.github.io/erpboost-ui/page/pipeline-kanban/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/page/simple-master-crud](https://mailboost.github.io/erpboost-ui/page/simple-master-crud/) | 2 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/ai-chat](https://mailboost.github.io/erpboost-ui/patterns/ai-chat/) | 10 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/approval-flow](https://mailboost.github.io/erpboost-ui/patterns/approval-flow/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/approval-route-builder](https://mailboost.github.io/erpboost-ui/patterns/approval-route-builder/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/bulk-actions-bar](https://mailboost.github.io/erpboost-ui/patterns/bulk-actions-bar/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/conversation-thread](https://mailboost.github.io/erpboost-ui/patterns/conversation-thread/) | 5 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/data-charts](https://mailboost.github.io/erpboost-ui/patterns/data-charts/) | 7 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/datatable-inline-edit](https://mailboost.github.io/erpboost-ui/patterns/datatable-inline-edit/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/field-diff-table](https://mailboost.github.io/erpboost-ui/patterns/field-diff-table/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/form-builder](https://mailboost.github.io/erpboost-ui/patterns/form-builder/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/grid-view](https://mailboost.github.io/erpboost-ui/patterns/grid-view/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/multi-step-form](https://mailboost.github.io/erpboost-ui/patterns/multi-step-form/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/notification-panel](https://mailboost.github.io/erpboost-ui/patterns/notification-panel/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/pipeline-stage-manager](https://mailboost.github.io/erpboost-ui/patterns/pipeline-stage-manager/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/rich-text-editor](https://mailboost.github.io/erpboost-ui/patterns/rich-text-editor/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/right-sheet-custom](https://mailboost.github.io/erpboost-ui/patterns/right-sheet-custom/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/supplier-cascader](https://mailboost.github.io/erpboost-ui/patterns/supplier-cascader/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/thread-composer](https://mailboost.github.io/erpboost-ui/patterns/thread-composer/) | 1 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/timeline](https://mailboost.github.io/erpboost-ui/patterns/timeline/) | 2 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |
| [/patterns/user-profile-dialog](https://mailboost.github.io/erpboost-ui/patterns/user-profile-dialog/) | 3 | サンプル内容・全バリエーションの描画・プレビュー寸法を比較 |

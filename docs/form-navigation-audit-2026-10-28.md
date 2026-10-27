# フォーム・見出しナビ・プロフィールの追加検証（2026-10-28）

参照: https://ui.tailor.tech/  
公開先: https://mailboost.github.io/erpboost-ui/

既存58ケースに10ケースを追加した。1280×900・ライトと375×812・ダーク、英語、Chromiumで比較する。全ページの全操作や全画素の一致を意味しない。

## 見つけて修正した差分

`Form-as-page`の見出しナビで、`scrollIntoView`がプレビュー外のページもスクロールしていた。また、IntersectionObserverで「交差状態が変化した見出し」だけを選んでいたため、Timelineへ移動した後に下のFollow-upが選択表示になることがあった。

| 操作・状態 | 参照 | 修正前 | 修正後の確認方法 |
| --- | --- | --- | --- |
| 全画面の見出しをクリック | 外側のページ位置を保持 | PCでは外側が25px、モバイルでは17px動く失敗を記録 | 外側のページと、プレビューより外側にある全祖先のscrollTopを比較する |
| Follow-up→Assignment→Timeline | Timelineを選択表示 | Timelineの位置へ移動してもFollow-upを選択表示する記録あり | 到達位置・選択中のリンク・選択リンクが1個だけであることを確認する |

通常カタログでは、末尾セクションの下に十分な余白がなく、上端から96pxの位置まで動かせない。ここは参照と同じスクロール末尾で止まり、Follow-upを選択表示することも確認する。

修正した[共有フック](../apps/catalog/src/reference/shared/use-section-scroll-spy.ts)は、最寄りのスクロール領域だけを直接動かす。すべての見出しの位置をその領域から測り直し、末尾に到達した状態も扱う。HTML・フォームの項目定義は変更していない。

修正前の公開版に同じ全画面ナビテストを実行すると、PC・モバイルとも失敗し、参照版の2ケースは成功した。最初のテスト作成時にあった固定座標・入力欄ラベルの指定誤りは、製品の不具合として数えない。

## 追加した10ケース

| 対象 | 操作 | ケース数 |
| --- | --- | --- |
| 見出しナビ | 通常カタログ／全画面で4見出しを順にクリック。到達位置・外側のスクロール保持・選択表示を確認。さらにマウスホイールで戻り、Assignmentへ選択が追従する | 4 |
| Form | 必須未入力→先頭エラーへのフォーカス、不正メール→送信結果なし、正しい値→日本語を含むJSON、値を変更して再送信 | 2 |
| Wizard | 未訪問ステップを無効化。Title・Description・Owner・Priority・日付を入力し、Backと訪問済みステップへの直接移動で保持。その後のReview移動で起きるネイティブ送信も確認 | 2 |
| 小型プロフィール | 名前・言語を変更→Cancel→再表示すると下書き保持→Save changes→再表示すると値を保持し保存ボタン無効化。管理者用Status / Assigned rolesは入力欄にならない。Escapeで閉じる | 2 |

テスト: [form-navigation-state.spec.ts](../tests/e2e/form-navigation-state.spec.ts)。各操作の最終画面とアクセシビリティスナップショットを保存する。キーボードIME変換中の入力は含まない。

プロフィールは通常カタログで操作した。Cancelが下書きを破棄しない挙動も参照と同じであり、保存を実サービスの永続化とは扱わない。

## 参照版にも存在する制約

### WizardはReviewへ到達する前にネイティブ送信される

Scheduleの最後のNextを押すと、クリック開始時は`type="button"`・Nextだったボタンから、submit時には`type="submit"`・Createとしてブラウザの送信イベントが発生した。GET先は`/page/form-as-page?notes=`となり、プレビュー指定と入力したTitleが失われた。参照・ローカル両方で、実マウスクリックと`isTrusted: true`のsubmitを記録した。

これを「Reviewまで値を保持して遷移できた」成功とは数えない。以前の全体記録にあるステップ4への到達表現を訂正する。今回のコード修正は見出しナビに限定し、参照と共通のウィザードの送信動作は変更していない。

### User profile dialogの全画面プレビューはエラーになる

`patterns/user-profile-dialog?preview=fullscreen`は、参照・ローカルとも`useSidebar must be used within a SidebarProvider.`のエラー境界を表示した。Sidebarの全画面と同様、正常なプロフィール表示の成功には含めない。通常カタログの小型ダイアログは上記の操作テストで別に検証する。

### 前回の一度だけ起きた選択解除

[ページをまたぐ選択の未解決事項](table-context-audit-2026-10-28.md#公開版で一度発生した未解決の選択解除)は継続する。今回の見出しナビ修正で原因を解消したとは扱わない。

## 証跡と再実行

- `E2E_TARGETS=reference,local npm run test:e2e`: 各68ケースを実行する。
- `E2E_TARGETS=published npm run test:e2e`: 公開反映後の68ケースを実行する。
- `npm test`、`npm run typecheck`、`BASE_PATH=/erpboost-ui/ npm run build`、`npm run check:package`、`node scripts/export-pages.mjs`も確認する。

参照・ローカルは各68ケース、計136ケースが成功した。コンポーネント21件、型チェック、ビルド、外部Reactアプリへのパッケージ導入・型チェック・ビルド、71ルートの静的出力も成功した。公開版は反映後に別途確認する。

Timelineへ到達した状態の974×718pxの画像は、参照・ローカルの切り出しで差が0画素だった。この1状態の画像比較であり、全ページ・全状態の画素一致とは扱わない。

結果集計は[JSON](audits/2026-10-28-form-navigation.json)。修正前の失敗・到達位置・参照側の制約・スクリーンショット・詳細結果は`/Users/ymktmk/.codex/visualizations/2026/10/28/erpboost-ui-form-audit/`に保存する。実機、他ブラウザ、実サービスへの送信・保存・権限変更の検証ではない。

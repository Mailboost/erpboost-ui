# ERPboost UI

Mailboost の React コンポーネント、ページテンプレート、UIパターンと、実際に操作できるカタログを管理するリポジトリです。

**カタログ:** https://mailboost.github.io/erpboost-ui/

Tailor UI Catalogue の Components・Pages・Patterns という構成と操作を参考にしています。コンポーネント本体は公開 MIT ライセンスの [Tailor AppShell](https://github.com/tailor-platform/app-shell) を基に、このリポジトリ内で管理します。出典・ライセンス・基準コミットは [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) に記載しています。Tailor の非公開カタログのソースを複製したものではありません。

## ローカルで起動

Node.js 24 以降と npm を使用します。

```sh
npm ci
npm run dev
```

http://127.0.0.1:5178/ を開いてください。

```sh
npm run typecheck
npm run build
npm run check:package
```

## 構成

```text
packages/ui/
  src/components/       コンポーネント本体
  src/contexts/         テーマ・言語・アプリケーションの共有状態
  src/assets/           デザイントークン
  src/index.ts          @mailboost/erpboost-ui の公開API
apps/catalog/
  src/registry.ts       サイドバーとURLの定義
  src/examples/         コンポーネントの使用例
  src/demos/            カタログ表示用の型と参照先
  src/reference/        公開サンプルを適用したページ・パターンと使用例
  src/Catalogue.tsx     Preview / Code、幅切替、コードコピー
scripts/export-pages.mjs  GitHub Pages の各URLにHTMLを出力
```

## コンポーネントの利用

このリポジトリ内では npm workspace として参照しています。

```tsx
import { Button, Input, Sheet } from "@mailboost/erpboost-ui";
import "@mailboost/erpboost-ui/styles";
```

`npm run build -w @mailboost/erpboost-ui` で ESM・型定義・CSS が `packages/ui/dist/` に出力されます。`npm pack -w @mailboost/erpboost-ui` で、他プロジェクトに導入するためのパッケージを作れます。npm レジストリへの公開はまだ行っていません。React 19 を使用します。

DataTableは既定でブラウザの右クリック操作を妨げません。組み込みのコピー・列固定メニューを使う場合は、`<DataTable.Root value={table} contextMenu>`で明示的に有効にします。列のsort / filter設定がある場合は、そのメニューも利用できます。

## カタログの更新

1. `packages/ui/src/components/` の実装を変更します。
2. 使用例を `apps/catalog/src/examples/components/`、ページやパターンを `apps/catalog/src/reference/` に追加します。
3. 新しい項目は `registry.ts` と `reference/demos.tsx` に登録します。
4. `npm run typecheck` と `npm run build`、ブラウザでの操作確認を行います。

コード表示は実際のサンプルソースから生成します。プレビューは同じサンプルをカタログ内で実行し、Desktop / Tablet / Mobile の幅で確認できます。言語・ライト／ダークテーマの切替、検索、プレビューの単独表示にも対応します。

`check:package` は `npm pack` の成果物を別ディレクトリのReactアプリにインストールし、公開ファイルの存在・型定義・本番ビルドを検証します。カタログ内のソース参照で配布パッケージの不備が隠れないよう、CIでも実行します。

全データはサンプルです。登録・編集・承認・送信の操作はプレビュー内の状態だけを変更し、実ERPやメールサービスへ接続しません。AIチャットはローカルの会話UIサンプルです。認証プロバイダーの画面は表示状態のサンプルで、認証サービスの設定は利用するアプリケーション側で行います。

参照サイトの公開例に合わせ、保存処理のない見本ボタンは表示のみです。状態を持つ例では入力・編集内容をプレビュー内で保持し、ページ再読み込みやプレビュー更新で初期状態へ戻します。AIチャットはモデルを呼ばず、同梱されたシナリオを再生します。言語切替はカタログの見出し・説明が対象で、サンプルの業務データには英語表記も含まれます。

2026-10-27 時点の参照との比較範囲・確認結果は [カタログ比較記録](docs/catalogue-parity.md) に記録しています。

## 公開

`main` への push で GitHub Actions が型チェック・ビルドを行い、成功した成果物を GitHub Pages に公開します。コンポーネント、カタログ、公開履歴を同じリポジトリで管理します。新しいクラウドサーバーや外部APIキーは不要です。

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

既存アプリに共通部品だけを導入する場合は、個別の入口を使えます。AppShell・認証・ルーターを置き換える必要はありません。スタイルは引き続き明示的に読み込みます。

```tsx
import { Button } from "@mailboost/erpboost-ui/button";
import { Input } from "@mailboost/erpboost-ui/input";
import { Textarea } from "@mailboost/erpboost-ui/textarea";
import { Table } from "@mailboost/erpboost-ui/table";
import { Spinner } from "@mailboost/erpboost-ui/spinner";
import "@mailboost/erpboost-ui/styles";
```

これらはルートの公開APIと同じ実装です。React 19の要件は変わりません。`check:package` は個別入口の外部アプリもビルドし、AI・認証SDK・React Routerが含まれないことを確認します。

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

### Existing applications and database workspaces

Existing apps can import controls independently of `AppShell` through `/button`,
`/input`, `/textarea`, `/table`, `/spinner`, `/badge`, `/alert`, `/checkbox`,
`/select`, `/combobox`, `/menu`, `/tabs`, `/dialog`, `/sheet`, `/tooltip`, `/field`
and `/database-workspace`. `Select.Parts` and `Combobox.Parts` expose the compound
controls. They do not require the library auth provider or router.

`DatabaseWorkspace` provides a table explorer with search, permission-aware create
buttons, collapsible table navigation and closable table/diagram tabs. It accepts
ordinary table names and callbacks, and renders an app-owned grid or diagram in
`children`. SQL types, validation, queries, write authorization and persistence
stay in the consumer. See the `patterns/database-workspace` catalogue example.

Apps that scope the stylesheet can supply `container` to Menu, Dialog, Sheet and
Tooltip content, as with Select/Combobox. Dialog content also accepts
`showCloseButton={false}` when the application owns its close action (for example,
while saving or checking unsaved changes). Defaults preserve the existing API.

Set the language of standalone controls with the existing locale context:

```tsx
import { LocaleProvider } from "@mailboost/erpboost-ui/locale-provider";

<LocaleProvider locale="ja-JP">
  <DatabaseWorkspace {...workspaceProps}>{grid}</DatabaseWorkspace>
</LocaleProvider>
```

`LocaleProvider` uses the same configuration context as AppShell and does not mount a router or auth provider.

### ER diagram

```tsx
import { ErdDiagram } from "@mailboost/erpboost-ui/erd-diagram";

<div style={{ height: 600 }}>
  <ErdDiagram
    schema={{ models: tables, relations }}
    initialTable="sale_order"
    onOpenTable={openTable}
  />
</div>
```

Tables have `name`, optional `label`, `primaryKeys`, and `columns` (`name`, `type`, optional `label`/`required`). Relations connect `fromTable`/`fromField` to `toTable`/`toField` with optional `optional` nullability. The component provides search, key filtering, auto layout, pan/zoom and a minimap. The application supplies authorized schema data and owns table navigation. Use `LocaleProvider` for standalone labels and `portalContainer` when popups need an application-owned container. The database workspace catalogue includes a working diagram example.

### Standalone forms and pagination

`Field`, `Fieldset` and `DatePicker` can be used through `/field`, `/fieldset` and `/date-field` without mounting AppShell. Use `Field.Control` for a labelled text input; Select, Combobox, Textarea and DatePicker connect directly to `Field.Root`. DatePicker accepts `container` for an embedded app's overlay theme.

`Pagination` from `/pagination` is the same control used by `DataTable.Pagination`. The consumer supplies page state and navigation callbacks, so it works with existing server or local pagination. `onPageChange` optionally enables direct page entry. Use `container` for the page-size menu in a scoped app.

`/avatar` and `/card` expose the existing Avatar and Card implementations as standalone imports. `/shell-parts` provides HeaderBar (also used by GlobalHeader) and SidebarPanel using the same base styles as the fixed AppShell sidebar, without routing or collapse state. `/skeleton` provides a decorative shimmer with reduced-motion support; loading-region labels and page-specific shapes remain with the application. The database-workspace catalogue demonstrates these parts together.

`/toolbar` and `/layout` expose the existing Toolbar and Layout implementations without AppShell. Layout.Header accepts className for page-specific outer spacing. `/empty-state` displays an app-supplied title, description, icon and optional actions; headingLevel preserves the surrounding heading hierarchy. It contains no fetching or business behavior.

### Standalone editor and database surfaces

`/code-editor` exposes the existing CodeMirror editor (Python or plain JSON text), with controlled values, read-only state and optional line-focus requests. It never executes code. `/file-list` provides `FileList` and `FileListItem`; selection and add/remove policies belong to the app. `/workflow-node` styles a step card without owning React Flow, graph layout or application data.

`/log-viewer` renders plain text and an optional empty slot. `/description-list` uses explicit JSX label/value items, with application-owned formatting. `/resize-handle` is a styled, focusable separator; layouts provide values and pointer/keyboard handlers. `/status-dot` provides neutral/success/error indicators; callers supply accessible labels.

`/cell-editor` provides the existing anchored editing surface, close button, busy dismissal guard, outside-click/Escape handling, and action slots. Supply an application-owned `container` for themed portals. The app owns input controls, value parsing, Enter-to-save and persistence. No API clients, screen-definition schema or business-specific configuration is included. The database-workspace catalogue demonstrates all of these alongside the existing components.

### Workspace layout and graph controls

`CodeWorkspace` from `/code-workspace` provides explicit JSX regions: Root, Sidebar, Main, Editor, EditorTabs, Results, ResultsHeader, ResultsBody, Panel and Header. Supply a Panel width and your existing ResizeHandle callbacks; the package owns the desktop/mobile layout and region scrolling. ResultsHeader and Header accept action slots. No file, API, tab or execution state is stored by the layout.

`GraphControls` from `/graph-controls` is the same toolbar used by ErdDiagram. Callers supply zoom bounds, labels, handlers and an optional overlay container. Extra controls (such as graph direction) and a reset-zoom button fit in JSX slots. Disabled zoom actions are skipped by the existing Toolbar keyboard behavior.

Dialog, Sheet, Card, Table and Fieldset retain their existing implementation and default appearance. Compose the existing Header / Content / Footer and ordinary JSX for application layout; no compact, grid, preview or sectioned variants are added.

### Context and detail surfaces

`HeaderBar layout="context"` provides `Brand`, `Separator`, `ContextItem`, `ContextTrigger` and `ContextLoading`. Wrap an existing controlled Combobox trigger with `ContextTrigger`; auth, filtering and selection remain in the consumer.

Use the existing Card.Header / Card.Content parts for detail sections. `OptionCard` is a native button with a title, description and optional icon.

Use the existing Table parts for database rows and previews. Frozen offsets, row/cell selection semantics, keyboard navigation, precision-safe values, schema and mutations remain app code.

`SidebarPanel` composes existing Button / Text / Avatar styling through native `Nav`, `Label`, `Button`, `Footer`, `AccountTrigger` and `Identity` parts. Pass `active` and existing navigation/account handlers explicitly; no router or authentication provider is introduced.

`SearchField` composes Input and Button, supports controlled values, an optional labelled clear action. Clearing returns focus to the text input; filtering remains in the consumer.

CodeWorkspace's PageHeader/TitleTrigger/TitleInput/CodeToolbar and Header share editor chrome. Consumers retain rename/unsaved/IME behavior and action portal content.

`Field.InputGroup` lays out an existing Field.Control and explicit trailing actions without changing their standard frames; value/reveal state and validation remain controlled by the app. Use the existing Fieldset.Root / Legend with explicit JSX fields. No schema-driven form generation is added.

`FileList.Editor` lays out an input/action row while the consumer retains file validation, Enter/Escape/IME handling and creation.

### ERPboost header

`ErpHeader` from `@mailboost/erpboost-ui/erp-header` displays fixed `brand`, `organization` and `connection` JSX slots. Pass `ErpHeader.Trigger` to the existing `Combobox.Parts.Trigger` render prop; `ErpHeader.Loading` supplies an accessible loading placeholder with reduced-motion support. Layout and loading placeholders use the existing `astw:` Tailwind utilities, including `animate-pulse` and `motion-reduce:animate-none`; no dedicated CSS is required. Selection, permissions, loading and API requests remain in the app. Existing GlobalHeader, Button and Combobox implementations are unchanged. See `/patterns/erp-header` for a controlled example.

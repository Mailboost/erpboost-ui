import { defineI18nLabels } from "@/hooks/i18n";

export const databaseWorkspaceLabels = defineI18nLabels({
  en: {
    title: "Database",
    tableList: "Table list",
    addTable: "Add table",
    searchTables: "Search tables",
    databaseTables: "Database tables",
    noMatchingTables: "No matching tables",
    workspace: "Database workspace",
    closeTableList: "Close table list",
    openTableList: "Open table list",
    openTables: "Open tables",
    closeTableTab: (props: { name: string }) => `Close ${props.name} tab`,
    diagram: "ER diagram",
    closeDiagram: "Close ER diagram",
    addNewTable: "Add new table",
  },
  ja: {
    title: "データベース",
    tableList: "テーブル一覧",
    addTable: "テーブルを追加",
    searchTables: "テーブルを検索",
    databaseTables: "データベースのテーブル",
    noMatchingTables: "該当するテーブルがありません",
    workspace: "データベース作業領域",
    closeTableList: "テーブル一覧を閉じる",
    openTableList: "テーブル一覧を開く",
    openTables: "開いているテーブル",
    closeTableTab: (props: { name: string }) => `${props.name}のタブを閉じる`,
    diagram: "ER図",
    closeDiagram: "ER図を閉じる",
    addNewTable: "新しいテーブルを追加",
  },
});

export const useDatabaseWorkspaceT = databaseWorkspaceLabels.useT;

import {
  HistoryList,
  HistoryEntry,
  Badge,
  LogViewer,
} from "@mailboost/erpboost-ui";
export function RecordHistoryDemo() {
  return (
    <HistoryList>
      <HistoryEntry
        status={<Badge variant="outline-success">Completed</Badge>}
        dateTime="2026-10-29T12:00:00Z"
        timeLabel="2026/10/29 21:00"
      >
        <details>
          <summary>Result</summary>
          <LogViewer
            text={'{"id":"0001","status":"completed"}'}
            aria-label="Result JSON"
          />
        </details>
      </HistoryEntry>
    </HistoryList>
  );
}

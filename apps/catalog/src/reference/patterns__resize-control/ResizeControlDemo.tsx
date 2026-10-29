import { useState } from "react";
import { ResizeControl } from "@mailboost/erpboost-ui";
export function ResizeControlDemo() {
  const [height, setHeight] = useState(180),
    [width, setWidth] = useState(260);
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <div
        style={{
          height: 360,
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ flex: 1 }}>Editor</div>
        <ResizeControl
          aria-label="Results height"
          orientation="horizontal"
          min={100}
          max={260}
          value={height}
          onValueChange={setHeight}
        />
        <div style={{ height, flexShrink: 0 }}>
          Results <output aria-label="Height">{height}</output>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          height: 180,
          marginTop: 24,
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>Main</div>
        <div
          style={{
            width,
            flexShrink: 0,
            maxWidth: "85%",
            position: "relative",
          }}
        >
          <ResizeControl
            placement="overlay"
            aria-label="Details width"
            orientation="vertical"
            min={100}
            max={300}
            value={width}
            onValueChange={setWidth}
          />
          Details <output aria-label="Width">{width}</output>
        </div>
      </div>
    </div>
  );
}

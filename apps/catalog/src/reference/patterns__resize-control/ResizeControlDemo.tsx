import { useState } from "react";
import { ResizeControl } from "@mailboost/erpboost-ui";
export function ResizeControlDemo() {
  const [height, setHeight] = useState(180),
    [width, setWidth] = useState(260);
  return (
    <div className="astw:w-full astw:min-w-0">
      <div className="astw:h-90 astw:flex astw:flex-col astw:border astw:border-border">
        <div className="astw:flex-1">Editor</div>
        <ResizeControl
          aria-label="Results height"
          orientation="horizontal"
          min={100}
          max={260}
          value={height}
          onValueChange={setHeight}
        />
        <div className="astw:shrink-0" style={{ height }}>
          Results <output aria-label="Height">{height}</output>
        </div>
      </div>
      <div className="astw:flex astw:h-45 astw:mt-6 astw:border astw:border-border">
        <div className="astw:flex-1 astw:min-w-0">Main</div>
        <div
          className="astw:shrink-0 astw:max-w-[85%] astw:relative"
          style={{ width }}
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

import React from "react";
import { ListChildComponentProps } from "react-window";

const RowHeader: React.FC<ListChildComponentProps<any>> = React.memo(
  ({ index, style }) => (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
      }}
    >
      {index}
    </div>
  )
);

export default RowHeader;
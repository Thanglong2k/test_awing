import React from "react";
import { ListChildComponentProps } from "react-window";

// ColumnHeader và RowHeader không đổi
const ColumnHeader: React.FC<ListChildComponentProps<any>> = React.memo(
  ({ index, style }) => (
    <div
      style={{
        ...style,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        fontWeight: "bold",
        paddingBottom: "8px",
      }}
    >
      {index}
    </div>
  )
);

export default ColumnHeader;
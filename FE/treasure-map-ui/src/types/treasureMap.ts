export interface TreasureMapFormData {
  rowCount: number;
  colCount: number;
  p: number;
  matrix: number[][];
}

export interface TreasureMapResponse {
  id: number;
  rowCount: number;
  colCount: number;
  p: number;
  matrixJson: string;
  fuelCost: number;
}

// Kiểu cho lỗi của ma trận (để dễ quản lý lỗi thủ công)
export interface MatrixErrors {
  [rowIndex: number]: {
    [colIndex: number]: string;
  };
  general?: string; // Lỗi tổng quát, ví dụ lỗi p trùng lặp
}

// Kiểu dữ liệu truyền vào Cell component (qua itemData của FixedSizeGrid)
export interface CellData {
  matrix: number[][];
  handleMatrixCellChange: (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => void;
  currentMatrixErrorsRef: React.MutableRefObject<MatrixErrors>; // Ref để đọc lỗi mới nhất
  p: number;
  isSubmitting: boolean;
  isMatrixGenerating: boolean; // Thêm trạng thái này
}

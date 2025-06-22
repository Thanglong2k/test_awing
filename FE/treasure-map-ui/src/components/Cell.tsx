import { MatrixErrors } from "@/types/treasureMap";
import { CELL_PADDING } from "@/utils/constants";
import { TextField, Tooltip } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { GridChildComponentProps } from "react-window";

// Kiểu dữ liệu truyền vào Cell component (qua itemData của FixedSizeGrid)
interface CellData {
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
// Component Cell cho FixedSizeGrid
const Cell: React.FC<GridChildComponentProps<CellData>> = React.memo(
  ({ columnIndex, rowIndex, style, data }) => {
    const {
      matrix,
      handleMatrixCellChange,
      currentMatrixErrorsRef,
      p,
      isSubmitting,
      isMatrixGenerating,
    } = data;

    const initialCellValueFromMatrix = matrix[rowIndex]?.[columnIndex];

    // State cục bộ để TextField không bị mất focus và quản lý giá trị đang gõ
    const [localCellValue, setLocalCellValue] = useState<string>(
      typeof initialCellValueFromMatrix === "number"
        ? initialCellValueFromMatrix.toString()
        : ""
    );

    // State cục bộ để hiển thị lỗi tức thì (localInputError)
    const [localInputError, setLocalInputError] = useState<string | undefined>(
      undefined
    );

    // State để theo dõi xem người dùng có đang gõ vào ô này hay không
    const [isTyping, setIsTyping] = useState(false);

    // Sử dụng useRef để lưu trữ lỗi từ matrixErrorsRef, giúp tránh vòng lặp vô hạn trong useEffect dưới.
    const errorFromMatrixRef =
      currentMatrixErrorsRef.current[rowIndex]?.[columnIndex];
    const prevErrorFromMatrixRef = useRef<string | undefined>(
      errorFromMatrixRef
    );

    // Đồng bộ localCellValue và localInputError khi initialCellValueFromMatrix thay đổi từ bên ngoài (cha)
    // Ví dụ: khi ma trận được tạo mới, hoặc khi validate tổng thể sửa giá trị của ô (ví dụ: 0 -> 1).
    useEffect(() => {
      const newValue =
        typeof initialCellValueFromMatrix === "number"
          ? initialCellValueFromMatrix.toString()
          : "";
      // Chỉ cập nhật local state nếu giá trị từ prop khác với giá trị cục bộ
      // và không phải đang trong quá trình người dùng gõ.
      if (localCellValue !== newValue && !isTyping && !isMatrixGenerating) {
        setLocalCellValue(newValue);
        // Sau khi cập nhật giá trị từ bên ngoài, validate lại cục bộ
        setLocalInputError(validateLocalCell(newValue, p));
      }
    }, [initialCellValueFromMatrix, p, isTyping, isMatrixGenerating]);

    // Lắng nghe sự thay đổi của lỗi từ matrixErrorsRef và cập nhật localInputError.
    // Điều này đảm bảo lỗi tổng thể được hiển thị chính xác khi debounce hoàn tất,
    // nhưng chỉ khi người dùng không còn đang gõ.
    useEffect(() => {
      // Cập nhật localInputError nếu lỗi từ matrixErrorsRef thay đổi
      // VÀ KHÔNG phải người dùng đang gõ (hoặc nếu lỗi tổng thể báo hết lỗi)
      if (errorFromMatrixRef !== prevErrorFromMatrixRef.current && !isTyping) {
        setLocalInputError(errorFromMatrixRef);
      }
      prevErrorFromMatrixRef.current = errorFromMatrixRef;
    }, [errorFromMatrixRef, isTyping]);

    // Hàm validate cục bộ, nhẹ, bao gồm tất cả các quy tắc cho một ô đơn lẻ
    const validateLocalCell = useCallback(
      (value: string, pValue: number): string | undefined => {
        // Cho phép rỗng tạm thời khi người dùng đang xóa hoặc nhập liệu
        if (value === "") {
          return undefined;
        }

        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
          return "Phải là số";
        }
        if (numValue < 1) {
          return "Tối thiểu là 1";
        }
        if (typeof pValue === "number" && !isNaN(pValue) && numValue > pValue) {
          return `Giá trị <= ${pValue}`;
        }
        return undefined; // Không có lỗi
      },
      []
    );

    // Xử lý sự kiện thay đổi giá trị TextField
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalCellValue(newValue); // Cập nhật local state ngay lập tức
        setIsTyping(true); // Đánh dấu là đang gõ

        // Validate cục bộ để hiển thị lỗi ngay lập tức
        const error = validateLocalCell(newValue, p);
        setLocalInputError(error); // Cập nhật lỗi cục bộ tức thì

        // Cập nhật matrix ở cha (để kích hoạt debounce validation toàn cục)
        handleMatrixCellChange(rowIndex, columnIndex, newValue);
      },
      [rowIndex, columnIndex, handleMatrixCellChange, p, validateLocalCell]
    );

    // Xử lý sự kiện blur
    const handleBlur = useCallback(() => {
      setIsTyping(false); // Dừng đánh dấu là đang gõ
      // Khi blur, đảm bảo localInputError được cập nhật với kết quả validate cuối cùng
      // bao gồm cả lỗi tổng thể nếu có sau khi debounce hoàn tất.
      // Tuy nhiên, việc useEffect đã xử lý cập nhật từ ref là đủ.
      // Chỉ cần validate lại local để xử lý các trường hợp biên.
      setLocalInputError(validateLocalCell(localCellValue, p));

      // Nếu có lỗi từ matrixErrorsRef sau khi blur, ưu tiên hiển thị lỗi đó.
      // Đây là điểm quan trọng để debounce error được đồng bộ
      if (currentMatrixErrorsRef.current[rowIndex]?.[columnIndex]) {
        setLocalInputError(
          currentMatrixErrorsRef.current[rowIndex]?.[columnIndex]
        );
      }

      handleMatrixCellChange(rowIndex, columnIndex, localCellValue);
    }, [
      rowIndex,
      columnIndex,
      localCellValue,
      handleMatrixCellChange,
      p,
      validateLocalCell,
      currentMatrixErrorsRef,
    ]);

    // Xử lý sự kiện key down (Enter)
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          setIsTyping(false); // Dừng đánh dấu là đang gõ
          setLocalInputError(validateLocalCell(localCellValue, p));
          if (currentMatrixErrorsRef.current[rowIndex]?.[columnIndex]) {
            setLocalInputError(
              currentMatrixErrorsRef.current[rowIndex]?.[columnIndex]
            );
          }
          handleMatrixCellChange(rowIndex, columnIndex, localCellValue);
        }
      },
      [
        rowIndex,
        columnIndex,
        localCellValue,
        handleMatrixCellChange,
        p,
        validateLocalCell,
        currentMatrixErrorsRef,
      ]
    );

    // Quyết định lỗi cuối cùng để hiển thị trên TextField
    // Ưu tiên localInputError (khi người dùng đang gõ), sau đó là lỗi từ validation tổng thể.
    // Lỗi từ currentMatrixErrorsRef sẽ chỉ hiển thị khi localInputError là undefined
    // (tức là không có lỗi cục bộ hoặc người dùng đã gõ xong).
    const displayError =
      localInputError ||
      currentMatrixErrorsRef.current[rowIndex]?.[columnIndex];

    return (
      <div style={style}>
        {/* Bọc TextField bằng Tooltip nếu có lỗi */}
        <Tooltip
          title={displayError || ""} // Nội dung tooltip là lỗi
          // open={!!displayError && !isTyping} // Chỉ mở tooltip khi có lỗi và người dùng không đang gõ
          placement="top" // Vị trí tooltip, có thể điều chỉnh
          arrow // Hiển thị mũi tên
        >
          <TextField
            type="number"
            size="small"
            value={localCellValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            inputProps={{ min: 1, max: p, step: 1 }}
            error={!!displayError} // Vẫn đánh dấu TextField là lỗi để có màu đỏ
            // helperText={displayError || ""} // Bỏ helperText ở đây
            disabled={isSubmitting || isMatrixGenerating}
            sx={{
              width: "100%",
              height: "100%",
              padding: `${CELL_PADDING}px`,
              boxSizing: "border-box",
              "& .MuiInputBase-root": {
                height: "100%",
                width: "100%",
              },
            }}
          />
        </Tooltip>
      </div>
    );
  },
  // Custom comparison function cho React.memo
  (prevProps, nextProps) => {
    // 1. So sánh các props từ react-window
    if (
      prevProps.columnIndex !== nextProps.columnIndex ||
      prevProps.rowIndex !== nextProps.rowIndex ||
      prevProps.style !== nextProps.style
    ) {
      return false; // Re-render nếu vị trí hoặc style thay đổi
    }

    // 2. So sánh các props từ itemData (trừ matrix và matrixErrorsRef)
    if (
      prevProps.data.p !== nextProps.data.p || // p thay đổi: cần re-render để cập nhật inputProps.max
      prevProps.data.isSubmitting !== nextProps.data.isSubmitting ||
      prevProps.data.isMatrixGenerating !== nextProps.data.isMatrixGenerating // So sánh trạng thái generate
    ) {
      return false;
    }

    // 3. So sánh giá trị của chính ô này trong ma trận
    const prevCellValue =
      prevProps.data.matrix[prevProps.rowIndex]?.[prevProps.columnIndex];
    const nextCellValue =
      nextProps.data.matrix[nextProps.rowIndex]?.[nextProps.columnIndex];
    if (prevCellValue !== nextCellValue) {
      return false; // Re-render nếu giá trị của ô thay đổi
    }

    // 4. So sánh lỗi của chính ô này bằng cách truy cập ref hiện tại (quan trọng cho validation)
    const prevErrorFromRef =
      prevProps.data.currentMatrixErrorsRef.current[prevProps.rowIndex]?.[
        prevProps.columnIndex
      ];
    const nextErrorFromRef =
      nextProps.data.currentMatrixErrorsRef.current[nextProps.rowIndex]?.[
        nextProps.columnIndex
      ];
    if (prevErrorFromRef !== nextErrorFromRef) {
      return false; // Re-render nếu lỗi của ô thay đổi
    }

    // 5. So sánh tham chiếu của matrixErrorsRef.current.general (cho lỗi tổng thể)
    const prevGeneralError =
      prevProps.data.currentMatrixErrorsRef.current.general;
    const nextGeneralError =
      nextProps.data.currentMatrixErrorsRef.current.general;
    if (prevGeneralError !== nextGeneralError) {
      return false; // Re-render nếu lỗi tổng thể thay đổi
    }

    return true;
  }
);

export default Cell;

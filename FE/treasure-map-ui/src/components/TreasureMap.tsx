import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { createTreasureMap } from "@/apis/treasureMapApi";
import type { MatrixErrors, TreasureMapFormData } from "@/types/treasureMap";
import schema from "@/utils/validations/treasureMapSchema";
import "@/styles/TreasureMap.css";
import { useDebouncedCallback } from "use-debounce";

// Imports từ react-window
import { FixedSizeGrid, FixedSizeList } from "react-window";
import Cell from "./Cell";
import { DEFAULT_MATRIX_SIZE, HEADER_SIZE, ITEM_HEIGHT, ITEM_WIDTH, SCROLLBAR_SIZE } from "@/utils/constants";
import ColumnHeader from "./ColumnHeader";
import RowHeader from "./RowHeader";

// Kiểu cho form inputs
type TreasureMapFormInputs = Omit<TreasureMapFormData, "matrix">;
// --- Component Chính: TreasureMapForm ---

export default function TreasureMapForm() {
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<TreasureMapFormInputs>({
    defaultValues: {
      rowCount: DEFAULT_MATRIX_SIZE,
      colCount: DEFAULT_MATRIX_SIZE,
      p: 3,
    },
    resolver: yupResolver(schema),
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const [matrix, setMatrix] = useState<number[][]>(
    Array.from({ length: DEFAULT_MATRIX_SIZE }, () =>
      Array(DEFAULT_MATRIX_SIZE).fill(1)
    )
  );
  const [matrixErrors, setMatrixErrors] = useState<MatrixErrors>({});
  const [result, setResult] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isMatrixGenerating, setIsMatrixGenerating] = useState<boolean>(false); // Trạng thái mới

  const [confirmedRowCount, setConfirmedRowCount] =
    useState<number>(DEFAULT_MATRIX_SIZE);
  const [confirmedColCount, setConfirmedColCount] =
    useState<number>(DEFAULT_MATRIX_SIZE);

  const pAsString = watch("p");
  const p = typeof pAsString === "string" ? parseInt(pAsString, 10) : pAsString;

  const matrixErrorsRef = useRef<MatrixErrors>({});
  useEffect(() => {
    matrixErrorsRef.current = matrixErrors;
    // Buộc FixedSizeGrid cập nhật để các Cell có thể đọc lỗi mới nhất từ ref
    if (gridRef.current) {
      gridRef.current.forceUpdate();
    }
  }, [matrixErrors]);

  const gridRef = useRef<FixedSizeGrid>(null);
  const columnHeaderRef = useRef<FixedSizeList>(null);
  const rowHeaderRef = useRef<FixedSizeList>(null);

  const validateMatrixCustom = useCallback(async (): Promise<boolean> => {
    // Không validate nếu ma trận đang được tạo hoặc kích thước không khớp
    if (
      isMatrixGenerating ||
      confirmedRowCount === 0 ||
      confirmedColCount === 0 ||
      matrix.length !== confirmedRowCount ||
      (matrix.length > 0 && matrix[0]?.length !== confirmedColCount)
    ) {
      // Chỉ xóa lỗi nếu đã có lỗi trước đó hoặc cần reset hoàn toàn
      // (Kiểm tra xem có lỗi tổng quát, hoặc có bất kỳ lỗi ô nào)
      // Cách kiểm tra object có rỗng hay không một cách hiệu quả:
      const hasExistingMatrixErrors =
        Object.keys(matrixErrors).length > 0 &&
        (matrixErrors.general ||
          Object.values(matrixErrors).some((rowErr) => Object.keys(rowErr).length > 0));
      if (hasExistingMatrixErrors) {
        setMatrixErrors({});
      }
      return false;
    }

    let currentMatrixHasErrors = false;
    const newMatrixErrors: MatrixErrors = {}; // **Bắt đầu với đối tượng lỗi rỗng hoàn toàn**

    const pValue = p;
    let pCount = 0;
    const pCells: { row: number; col: number }[] = [];

    matrix.forEach((row, rowIndex) => {
      row.forEach((cellValue, colIndex) => {
        let errorForCell: string | undefined = undefined; // Lưu trữ lỗi cho ô hiện tại

        // Validate từng ô
        if (typeof cellValue !== "number" || isNaN(cellValue)) {
          errorForCell = "Phải là số";
        } else if (cellValue < 1) {
          errorForCell = "Tối thiểu là 1";
        } else if (
          typeof pValue === "number" &&
          !isNaN(pValue) &&
          cellValue > pValue
        ) {
          errorForCell = `Giá trị <= ${pValue}`;
        }

        if (errorForCell) {
          currentMatrixHasErrors = true;
          // **Chỉ khởi tạo newMatrixErrors[rowIndex] nếu nó chưa tồn tại**
          // Điều này đảm bảo chúng ta chỉ thêm các hàng có lỗi
          if (!newMatrixErrors[rowIndex]) {
            newMatrixErrors[rowIndex] = {};
          }
          newMatrixErrors[rowIndex][colIndex] = errorForCell;
        }

        // Kiểm tra giá trị P
        if (
          typeof cellValue === "number" &&
          !isNaN(cellValue) &&
          typeof pValue === "number" &&
          !isNaN(pValue) &&
          cellValue === pValue
        ) {
          pCount++;
          pCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    // Validate số lượng rương p
    if (typeof pValue === "number" && !isNaN(pValue)) {
      if (pCount === 0) {
        newMatrixErrors.general = `Phải có chính xác một ô có giá trị bằng ${pValue}. Hiện tại không có ô nào.`;
        currentMatrixHasErrors = true;
      } else if (pCount > 1) {
        newMatrixErrors.general = `Chỉ được có chính xác một ô có giá trị bằng ${pValue}. Hiện tại có ${pCount} ô.`;
        currentMatrixHasErrors = true;
        pCells.forEach(({ row, col }) => {
          // Đảm bảo newMatrixErrors[row] được khởi tạo nếu ô này có lỗi P trùng lặp
          // và chưa có lỗi nào trong hàng này được thêm vào trước đó.
          if (!newMatrixErrors[row]) {
            newMatrixErrors[row] = {};
          }
          // Chỉ thêm lỗi p trùng lặp nếu ô đó chưa có lỗi khác nghiêm trọng hơn
          // (hoặc nếu ô đó có giá trị P nhưng không phải là vị trí P duy nhất)
          if (!newMatrixErrors[row][col]) {
            newMatrixErrors[row][col] = `Ô này có giá trị ${pValue}, đã có ô khác cùng giá trị.`;
          }
        });
      }
    } else {
      // Nếu pValue không phải là số hợp lệ, lỗi general liên quan đến p có thể không cần xóa ở đây
      // vì yup đã xử lý lỗi này ở cấp form chính. Tuy nhiên, vẫn giữ lại để an toàn.
      // Dòng này chỉ xóa lỗi general nếu nó có nội dung liên quan đến giá trị P
      if (newMatrixErrors.general && newMatrixErrors.general.includes("giá trị bằng")) {
        delete newMatrixErrors.general;
      }
    }

    // Bước này trở nên không cần thiết lắm với cách tiếp cận mới (chỉ thêm lỗi khi có)
    // nhưng vẫn có thể giúp "dọn dẹp" nếu có bất kỳ trường hợp edge nào.
    // Thực tế, nếu newMatrixErrors[rowIndex] không có lỗi, nó đã không được tạo ra từ đầu.
    // Dòng này an toàn để giữ.
    Object.keys(newMatrixErrors).forEach((rowKey) => {
      // Đảm bảo không xử lý khóa 'general' như một rowIndex
      if (rowKey !== "general") {
        const rowIndex = parseInt(rowKey);
        // Kiểm tra nếu đối tượng lỗi hàng rỗng, thì xóa nó đi
        if (
          typeof newMatrixErrors[rowIndex] === "object" &&
          Object.keys(newMatrixErrors[rowIndex]).length === 0
        ) {
          delete newMatrixErrors[rowIndex];
        }
      }
    });

    // So sánh để tránh re-render không cần thiết nếu matrixErrors không thực sự thay đổi
    // Đây là một bước tối ưu hiệu suất quan trọng.
    if (JSON.stringify(matrixErrors) !== JSON.stringify(newMatrixErrors)) {
      setMatrixErrors(newMatrixErrors);
    }

    return currentMatrixHasErrors;
  }, [
    matrix,
    p,
    isMatrixGenerating,
    confirmedRowCount,
    confirmedColCount,
    matrixErrors,
  ]);

  const debouncedValidateMatrixCustom = useDebouncedCallback(
    validateMatrixCustom,
    300
  );

  const handleMatrixCellChange = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      const numValue = parseInt(value, 10);

      setMatrix((prevMatrix) => {
        const newRow = [...prevMatrix[rowIndex]];
        newRow[colIndex] = numValue; // Cập nhật giá trị số
        const newMatrix = [...prevMatrix];
        newMatrix[rowIndex] = newRow;
        return newMatrix;
      });

      // Kích hoạt debounce validation sau khi ma trận thay đổi
      debouncedValidateMatrixCustom();
    },
    [debouncedValidateMatrixCustom]
  );

  const handleGridScroll = useCallback(
    ({ scrollLeft, scrollTop }: { scrollLeft: number; scrollTop: number }) => {
      if (columnHeaderRef.current) {
        columnHeaderRef.current.scrollTo(scrollLeft);
      }
      if (rowHeaderRef.current) {
        rowHeaderRef.current.scrollTo(scrollTop);
      }
    },
    []
  );

  useEffect(() => {
    // Điều kiện để kích hoạt validation khi các props liên quan thay đổi
    if (
      !isMatrixGenerating &&
      confirmedRowCount > 0 &&
      confirmedColCount > 0 &&
      matrix.length === confirmedRowCount &&
      (matrix.length === 0 ||
        (matrix.length > 0 && matrix[0]?.length === confirmedColCount))
    ) {
      debouncedValidateMatrixCustom();
    } else {
      // Hủy debounce validation nếu điều kiện không còn đúng
      debouncedValidateMatrixCustom.cancel();
      // Reset lỗi ma trận nếu không cần validate nữa hoặc có lỗi cần reset
      const hasExistingMatrixErrors =
        Object.keys(matrixErrors).length > 0 &&
        (matrixErrors.general ||
          Object.values(matrixErrors).some((rowErr) => Object.keys(rowErr).length > 0));
      if (hasExistingMatrixErrors) {
        setMatrixErrors({});
      }
    }
    // Cleanup function để hủy debounce khi component unmount hoặc dependencies thay đổi
    return () => {
      debouncedValidateMatrixCustom.cancel();
    };
  }, [
    matrix,
    p,
    isMatrixGenerating,
    confirmedRowCount,
    confirmedColCount,
    debouncedValidateMatrixCustom,
    matrixErrors,
  ]);

  const generateMatrix = async () => {
    setApiError("");
    setResult(null);
    setMatrixErrors({}); // Xóa lỗi ma trận hiện có khi tạo mới
    setIsMatrixGenerating(true); // Bắt đầu quá trình generate

    // Sử dụng setTimeout 0 để cho phép UI cập nhật loading state trước khi block luồng
    setTimeout(async () => {
      let tempNewMatrix: number[][] = [];
      let newConfirmedRowCount = DEFAULT_MATRIX_SIZE;
      let newConfirmedColCount = DEFAULT_MATRIX_SIZE;

      try {
        const currentRowCount = getValues("rowCount");
        const currentColCount = getValues("colCount");

        // Kích hoạt validation cho các trường cơ bản của form (rowCount, colCount, p)
        const isBasicFormValid = await trigger(["rowCount", "colCount", "p"]);
        if (!isBasicFormValid) {
          // Nếu form cơ bản không hợp lệ, đặt lại ma trận về mặc định
          tempNewMatrix = Array.from({ length: DEFAULT_MATRIX_SIZE }, () =>
            Array(DEFAULT_MATRIX_SIZE).fill(1)
          );
          newConfirmedRowCount = DEFAULT_MATRIX_SIZE;
          newConfirmedColCount = DEFAULT_MATRIX_SIZE;
          return;
        }

        const parsedRowCount = parseInt(currentRowCount?.toString() || "0", 10);
        const parsedColCount = parseInt(currentColCount?.toString() || "0", 10);

        if (
          isNaN(parsedRowCount) ||
          isNaN(parsedColCount) ||
          parsedRowCount <= 0 ||
          parsedColCount <= 0
        ) {
          setMatrixErrors({
            general: "Số hàng hoặc số cột không hợp lệ. Vui lòng nhập số dương.",
          });
          tempNewMatrix = Array.from({ length: DEFAULT_MATRIX_SIZE }, () =>
            Array(DEFAULT_MATRIX_SIZE).fill(1)
          );
          newConfirmedRowCount = DEFAULT_MATRIX_SIZE;
          newConfirmedColCount = DEFAULT_MATRIX_SIZE;
          return;
        }

        // Tạo ma trận mới với giá trị mặc định là 1
        tempNewMatrix = Array.from({ length: parsedRowCount }, () =>
          Array.from({ length: parsedColCount }, () => 1)
        );
        newConfirmedRowCount = parsedRowCount;
        newConfirmedColCount = parsedColCount;
      } catch (error) {
        console.error("Lỗi khi tạo ma trận:", error);
        setMatrixErrors({ general: "Đã xảy ra lỗi khi tạo ma trận." });
        tempNewMatrix = Array.from({ length: DEFAULT_MATRIX_SIZE }, () =>
          Array(DEFAULT_MATRIX_SIZE).fill(1)
        );
        newConfirmedRowCount = DEFAULT_MATRIX_SIZE;
        newConfirmedColCount = DEFAULT_MATRIX_SIZE;
      } finally {
        setMatrix(tempNewMatrix);
        setConfirmedRowCount(newConfirmedRowCount);
        setConfirmedColCount(newConfirmedColCount);
        setIsMatrixGenerating(false); // Kết thúc quá trình generate
      }
    }, 0);
  };

  const onSubmit: SubmitHandler<TreasureMapFormInputs> = async (
    data: TreasureMapFormInputs
  ) => {
    if (isSubmitting || isMatrixGenerating) {
      console.log("Đang tạo ma trận hoặc đang submit, không thể thực hiện.");
      return;
    }

    setIsSubmitting(true);
    setApiError("");
    setResult(null);

    try {
      const isBasicFormValid = await trigger(["rowCount", "colCount", "p"]);
      if (!isBasicFormValid) {
        console.log("Basic form validation failed.");
        return;
      }

      // Kiểm tra kích thước ma trận trước khi submit
      if (
        matrix.length !== confirmedRowCount ||
        (matrix.length > 0 && matrix[0]?.length !== confirmedColCount)
      ) {
        setMatrixErrors({
          general:
            "Kích thước ma trận hiện tại không khớp với kích thước đã xác nhận. Vui lòng bấm 'Tạo ma trận' trước khi submit.",
        });
        return;
      }

      // Ép debounce validation chạy ngay lập tức và chờ kết quả
      // Điều này đảm bảo ma trận được validate lần cuối trước khi gửi đi.
      const hasMatrixErrors = await debouncedValidateMatrixCustom.flush();
      if (hasMatrixErrors) {
        console.log("Custom matrix validation failed. Cannot submit.");
        // Có lỗi thì không gửi form
        return;
      }

      const fullFormData: TreasureMapFormData = { ...data, matrix };
      const response = await createTreasureMap(fullFormData);
      setResult(response.fuelCost.toFixed(5));
    } catch (err: any) {
      console.error("API error:", err);
      setApiError(err.message || "Lỗi kết nối hoặc xử lý phía backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldRenderMatrixContent =
    !isMatrixGenerating &&
    confirmedRowCount > 0 &&
    confirmedColCount > 0 &&
    matrix.length === confirmedRowCount &&
    matrix[0]?.length === confirmedColCount;

  const gridContentWidth = Math.min(
    confirmedColCount * ITEM_WIDTH,
    window.innerWidth * 0.9 - HEADER_SIZE - SCROLLBAR_SIZE
  );
  const gridContentHeight = Math.min(
    confirmedRowCount * ITEM_HEIGHT,
    window.innerHeight * 0.7 - HEADER_SIZE - SCROLLBAR_SIZE
  );

  const totalDisplayWidth = gridContentWidth + HEADER_SIZE + SCROLLBAR_SIZE;
  const totalDisplayHeight = gridContentHeight + HEADER_SIZE + SCROLLBAR_SIZE;

  return (
    <Container sx={{ mt: 4 }} className="treasure-map-form">
      <Typography variant="h4" gutterBottom>
        Bản đồ kho báu
      </Typography>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            <Controller
              name="rowCount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Số hàng (n)"
                  error={!!errors.rowCount}
                  helperText={errors.rowCount?.message}
                  size="small"
                  sx={{ width: 150 }}
                  disabled={isMatrixGenerating || isSubmitting}
                />
              )}
            />
            <Controller
              name="colCount"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Số cột (m)"
                  error={!!errors.colCount}
                  helperText={errors.colCount?.message}
                  size="small"
                  sx={{ width: 150 }}
                  disabled={isMatrixGenerating || isSubmitting}
                />
              )}
            />
            <Controller
              name="p"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Số loại rương (p)"
                  error={!!errors.p}
                  helperText={errors.p?.message}
                  size="small"
                  sx={{ width: 150 }}
                  disabled={isMatrixGenerating || isSubmitting}
                />
              )}
            />
            <Box mt={0.5}>
              <Button
                variant="outlined"
                onClick={generateMatrix}
                disabled={isMatrixGenerating || isSubmitting}
              >
                {isMatrixGenerating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Tạo ma trận"
                )}
              </Button>
            </Box>
          </Box>

          {matrixErrors.general && (
            <FormHelperText error sx={{ mb: 2 }}>
              {matrixErrors.general}
            </FormHelperText>
          )}

          <Box
            sx={{
              position: "relative",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              width: totalDisplayWidth,
              height: totalDisplayHeight,
              overflow: "hidden",
            }}
          >
            {isMatrixGenerating && ( // Sử dụng isMatrixGenerating cho overlay
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  width: "100%",
                  bgcolor: "rgba(255, 255, 255, 0.7)",
                  position: "absolute",
                  zIndex: 10,
                  left: 0,
                  top: 0,
                  borderRadius: 1,
                }}
              >
                <CircularProgress size={60} />
              </Box>
            )}

            {shouldRenderMatrixContent && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  width: "100%",
                }}
              >
                <Box
                  sx={{ display: "flex", flexShrink: 0, height: HEADER_SIZE }}
                >
                  <Box
                    sx={{ width: HEADER_SIZE, height: "100%", flexShrink: 0 }}
                  />
                  <FixedSizeList
                    ref={columnHeaderRef}
                    direction="horizontal"
                    itemCount={confirmedColCount}
                    itemSize={ITEM_WIDTH}
                    height={HEADER_SIZE}
                    width={gridContentWidth + SCROLLBAR_SIZE}
                    style={{ overflowX: "hidden" }}
                  >
                    {ColumnHeader}
                  </FixedSizeList>
                </Box>

                <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
                  <FixedSizeList
                    ref={rowHeaderRef}
                    itemCount={confirmedRowCount}
                    itemSize={ITEM_HEIGHT}
                    height={gridContentHeight + SCROLLBAR_SIZE}
                    width={HEADER_SIZE}
                    style={{ overflowY: "hidden" }}
                  >
                    {RowHeader}
                  </FixedSizeList>

                  <FixedSizeGrid
                    ref={gridRef}
                    columnCount={confirmedColCount}
                    columnWidth={ITEM_WIDTH}
                    height={gridContentHeight}
                    rowCount={confirmedRowCount}
                    rowHeight={ITEM_HEIGHT}
                    width={gridContentWidth}
                    itemData={{
                      matrix,
                      handleMatrixCellChange,
                      currentMatrixErrorsRef: matrixErrorsRef,
                      p,
                      isSubmitting,
                      isMatrixGenerating, // Truyền trạng thái mới
                    }}
                    onScroll={handleGridScroll}
                    style={{ overflow: "auto" }}
                  >
                    {Cell}
                  </FixedSizeGrid>
                </Box>
              </Box>
            )}
          </Box>

          <Box mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={isMatrixGenerating || isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Tính lượng nhiên liệu tối thiểu"
              )}
            </Button>
          </Box>

          {result && (
            <Typography variant="h6" mt={2} color="green">
              Lượng nhiên liệu tối thiểu: {result}
            </Typography>
          )}

          {apiError && (
            <Typography variant="body2" mt={2} color="error">
              {apiError}
            </Typography>
          )}
        </form>
      </Paper>
    </Container>
  );
}
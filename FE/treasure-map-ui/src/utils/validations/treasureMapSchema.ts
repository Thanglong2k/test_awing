// src/utils/validations/treasureMapSchema.ts
import * as yup from "yup";
import type { TreasureMapFormData } from "@/types/treasureMap";

// ĐÃ SỬA: Sử dụng TreasureMapFormInputs (loại bỏ 'matrix') cho schema
type TreasureMapFormInputs = Omit<TreasureMapFormData, 'matrix'>;

// Schema này chỉ định nghĩa các trường mà React Hook Form sẽ quản lý và Yup validate
const schema: yup.ObjectSchema<TreasureMapFormInputs> = yup
  .object({
    rowCount: yup
      .number()
      .required("Bắt buộc nhập số hàng")
      .min(1, "Tối thiểu 1")
      .max(500, "Tối đa 500"),
    colCount: yup
      .number()
      .required("Bắt buộc nhập số cột")
      .min(1, "Tối thiểu 1")
      .max(500, "Tối đa 500"),
    p: yup
      .number()
      .required("Bắt buộc nhập số loại rương")
      .min(1, "Tối thiểu là 1")
      .test("max-bound", "p phải nhỏ hơn tổng số ô", function (value) {
        const { rowCount, colCount } = this.parent;
        // Đảm bảo rowCount và colCount là số hợp lệ để tính toán
        if (typeof rowCount !== 'number' || typeof colCount !== 'number' || rowCount <= 0 || colCount <= 0) {
            return true; // Nếu không hợp lệ, bỏ qua test này để không gây lỗi cascade
        }
        return value <= rowCount * colCount || this.createError({ message: "p phải nhỏ hơn tổng số ô" });
      }),
  })
  .required();

export default schema;
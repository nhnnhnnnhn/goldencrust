/**
 * Định dạng số tiền sang định dạng VNĐ với dấu phân cách hàng nghìn
 * @param amount - Số tiền cần định dạng
 * @returns Chuỗi định dạng tiền VNĐ (VD: 3,200,000 VND)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(amount) + ' VND';
}

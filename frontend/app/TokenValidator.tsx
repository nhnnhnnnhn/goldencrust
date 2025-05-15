"use client";

import { useEffect } from 'react';
import { useValidateTokenQuery } from '@/redux/api/validateTokenApi';
import { useAuth } from '@/contexts/auth-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';

// Thành phần này chịu trách nhiệm kiểm tra tính hợp lệ của token
// và tự động đăng xuất nếu token hết hạn
export function TokenValidator() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { refetch, error } = useValidateTokenQuery(undefined, {
    // Chỉ gọi API khi người dùng đã đăng nhập
    skip: !isAuthenticated,
    // Vô hiệu hóa cache để luôn nhận được kết quả mới nhất
    refetchOnMountOrArgChange: true
  });

  useEffect(() => {
    // Chức năng kiểm tra tính hợp lệ của token
    const validateToken = async () => {
      if (isAuthenticated) {
        try {
          const result = await refetch().unwrap();
          if (!result?.valid) {
            console.log('Token không hợp lệ, tự động đăng xuất');
            dispatch(logout());
          }
        } catch (err) {
          console.log('Lỗi xác thực token, tự động đăng xuất', err);
          dispatch(logout());
        }
      }
    };

    // Gọi xác thực ngay khi component được mount
    validateToken();

    // Thiết lập interval để kiểm tra token định kỳ (mỗi 5 phút)
    const intervalId = setInterval(() => {
      validateToken();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, refetch, dispatch]);

  // Component này không render gì cả
  return null;
}

export default TokenValidator;

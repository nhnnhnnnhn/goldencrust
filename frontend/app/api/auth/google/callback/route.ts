import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const fullName = searchParams.get('fullName');
  const role = searchParams.get('role');
  const error = searchParams.get('error');
  const isNewAccount = searchParams.get('isNewAccount') === 'true';
  const googleId = searchParams.get('googleId') || '';
  
  if (error) {
    // Chuyển hướng đến trang login với thông báo lỗi
    return Response.redirect(new URL(`/login?error=google_auth_failed`, request.url));
  }
  
  if (!token || !email || !fullName || !role) {
    // Nếu thiếu thông tin, chuyển hướng về trang login
    return Response.redirect(new URL('/login?error=missing_auth_info', request.url));
  }
  
  if (isNewAccount) {
    // Nếu là tài khoản mới, chuyển hướng đến trang đăng ký để điền thêm thông tin
    const registerUrl = new URL('/register', request.url);
    // Truyền thông tin để điền sẵn vào form
    registerUrl.searchParams.set('google_signup', 'true');
    registerUrl.searchParams.set('email', email);
    registerUrl.searchParams.set('fullName', fullName);
    registerUrl.searchParams.set('token', token);
    registerUrl.searchParams.set('googleId', googleId);
    
    return Response.redirect(registerUrl);
  } else {
    // Nếu là tài khoản đã tồn tại, đăng nhập luôn
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('auth_success', 'true');
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('email', email);
    redirectUrl.searchParams.set('fullName', fullName);
    redirectUrl.searchParams.set('role', role);
    
    // Chuyển hướng đến trang chủ với thông tin xác thực
    return Response.redirect(redirectUrl);
  }
}

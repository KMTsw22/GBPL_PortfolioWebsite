import { redirect } from 'next/navigation';

// Google OAuth 로 인증하므로 별도 비밀번호가 없음.
// 이 경로로 접근하면 프로필로 보내요.
export default function AccountPage() {
  redirect('/profile');
}

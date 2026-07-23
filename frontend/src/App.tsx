import { useEffect } from 'react';
import { AppRouter } from './app/AppRouter';

function App() {
  useEffect(() => {
    // Kiểm tra nếu là phiên làm việc mới (người dùng vừa vào lại web)
    if (!sessionStorage.getItem('session_initialized')) {
      // Xóa tất cả cookies
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      }
      // Đánh dấu phiên làm việc đã khởi tạo để không xóa cookie khi f5 (refresh)
      sessionStorage.setItem('session_initialized', 'true');
    }
  }, []);

  return <AppRouter />;
}

export default App;

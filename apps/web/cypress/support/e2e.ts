// Import commands
import './commands';

// Tự động bỏ qua màn hình Onboarding trước mỗi test
// Đây là cách chuyên nghiệp nhất - set flag vào localStorage
// trước khi trang web được load, nên App sẽ không bao giờ hiện màn hình onboarding.
Cypress.on('window:before:load', (win) => {
  win.localStorage.setItem('jobnow_onboarding_seen', 'true');
});
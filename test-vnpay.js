const fs = require('fs');
fetch('http://localhost:3001/api/vnpay/create-payment-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 50000, userId: 'test' })
}).then(r => r.text()).then(t => {
  fs.writeFileSync('err.txt', t);
  console.log('Error logged to err.txt');
}).catch(console.error);

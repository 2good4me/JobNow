
const crypto = require('crypto');

const hashSecret = 'KYETK5S9KYQUG0EN1TRKE9717289BT10';
const query = {
    vnp_Amount: '500000000',
    vnp_BankCode: 'NCB',
    vnp_BankTranNo: 'VNP15470816',
    vnp_CardType: 'ATM',
    vnp_OrderInfo: 'Nap tien vao vi JobNow (User: jkltjPdvo9YkvQ9XDjt7Z3No3UK2)',
    vnp_PayDate: '20260327154146',
    vnp_ResponseCode: '00',
    vnp_TmnCode: 'RYKLU502',
    vnp_TransactionNo: '15470816',
    vnp_TransactionStatus: '00',
    vnp_TxnRef: 'jkltjPdvo9YkvQ9XDjt7Z3No3UK2_1774600869422'
};

function sortObject(obj) {
    const sorted = {};
    const str = Object.keys(obj).sort();
    for (let i = 0; i < str.length; i++) {
        const key = str[i];
        const val = obj[key];
        if (val === '' || val === null || val === undefined) continue;
        
        sorted[key] = encodeURIComponent(val.toString())
            .replace(/%20/g, "+")
            .replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
    }
    return sorted;
}

const vnp_Params = sortObject(query);
const signData = Object.keys(vnp_Params)
    .map(key => `${key}=${vnp_Params[key]}`)
    .join('&');

const hmac = crypto.createHmac("sha512", hashSecret);
const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 

const providedHash = '319c82adabbcf7b0fe35005d99a3ac72d93118b53bfeff6145b69567d46a022ccc2fec0dbe73a5d22edd703bbee53e472e29b6c906f2f200f2539eca38fe2ebe';

console.log('Sign Data:', signData);
console.log('Calculated Hash:', signed);
console.log('Provided Hash:', providedHash);
console.log('Match:', signed === providedHash);

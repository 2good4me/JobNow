import crypto from 'crypto';

export class VNPayService {
    private tmnCode = 'RYKLU502';
    private hashSecret = 'KYETK5S9KYQUG0EN1TRKE9717289BT10';
    private vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

    public createPaymentUrl(ipAddr: string, amount: number, orderInfo: string, orderId: string, returnUrl: string) {
        let vnp_Params: Record<string, any> = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': this.tmnCode,
            'vnp_Locale': 'vn',
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': orderId,
            'vnp_OrderInfo': orderInfo,
            'vnp_OrderType': 'topup',
            'vnp_Amount': (amount * 100).toString(),
            'vnp_ReturnUrl': returnUrl,
            'vnp_IpAddr': ipAddr || '127.0.0.1',
            'vnp_CreateDate': this.formatDate(new Date())
        };

        // Dùng sortObject (encode values) để ký - đây là cách VNPay yêu cầu
        vnp_Params = this.sortObject(vnp_Params);
        
        let signData = Object.keys(vnp_Params)
            .map(key => `${key}=${vnp_Params[key]}`)
            .join('&');
            
        const hmac = crypto.createHmac('sha512', this.hashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex'); 
        
        vnp_Params['vnp_SecureHash'] = signed;
        
        // Xây dựng URL - dùng giá trị đã encode từ sortObject (không encode thêm)
        let vnpUrl = this.vnpUrl + '?' + Object.keys(vnp_Params)
            .map(key => `${key}=${vnp_Params[key]}`)
            .join('&');
        
        return vnpUrl;
    }

    public verifyIpn(query: Record<string, any>): boolean {
        const vnp_Params = { ...query };
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        const sortedParams = this.sortObject(vnp_Params);
        const signData = Object.keys(sortedParams)
            .map(key => `${key}=${sortedParams[key]}`)
            .join('&');
            
        const hmac = crypto.createHmac('sha512', this.hashSecret);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex'); 
        
        console.log('--- VNPAY VERIFY IPN DEBUG ---');
        console.log('Sign Data:', signData);
        console.log('Provided Hash:', secureHash);
        console.log('Calculated Hash:', signed);
        console.log('Match:', secureHash === signed);
        console.log('------------------------------');

        return secureHash === signed.toLowerCase() || secureHash === signed.toUpperCase();
    }

    // Encode values để ký (giống cách VNPay tạo chữ ký)
    private sortObject(obj: Record<string, any>) {
        const sorted: Record<string, any> = {};
        const str = Object.keys(obj).sort();
        for (let i = 0; i < str.length; i++) {
            const val = obj[str[i]]?.toString() || '';
            if (val === '') continue;
            sorted[str[i]] = encodeURIComponent(val).replace(/%20/g, '+');
        }
        return sorted;
    }

    private formatDate(date: Date) {
        const yyyy = date.getFullYear().toString();
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const dd  = date.getDate().toString().padStart(2, '0');
        const hh = date.getHours().toString().padStart(2, '0');
        const min = date.getMinutes().toString().padStart(2, '0');
        const ss = date.getSeconds().toString().padStart(2, '0');
        return yyyy + mm + dd + hh + min + ss;
    }
}

export const vnpayService = new VNPayService();

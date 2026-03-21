import cv2
import numpy as np
import easyocr
import re

# Khởi tạo mô hình EasyOCR cho tiếng Việt và tiếng Anh.
# Lưu ý: lần đầu chạy mô hình sẽ tốn thời gian tải về (download models).
reader = easyocr.Reader(['vi', 'en'], gpu=False)

def preprocess_image(image_bytes):
    # Đọc ảnh từ byte memory thành mảng numpy cho OpenCV
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Chuyển ảnh sang thang độ xám (Grayscale)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Áp dụng threshold nhẹ hoặc Histogram Equalization để tăng độ nét nếu cần
    # Ở đây chúng ta chỉ resize gấp đôi để hình ảnh rõ ràng hơn với EasyOCR
    width = int(gray.shape[1] * 2)
    height = int(gray.shape[0] * 2)
    dim = (width, height)
    resized = cv2.resize(gray, dim, interpolation=cv2.INTER_LINEAR)

    return resized

def process_cccd(image_bytes):
    """
    Xử lý ảnh CCCD và trích xuất thông tin ID, Họ tên, Ngày Sinh.
    Lưu ý: Hệ thống này dùng EasyOCR có thể có sai số so với AI Cloud.
    """
    img_processed = preprocess_image(image_bytes)

    # Chạy EasyOCR để trích xuất chữ
    results = reader.readtext(img_processed, detail=0, paragraph=False)

    # Ghép tất cả văn bản lấy được thành một đoạn text để dùng Regex
    full_text = " ".join(results)

    # 1. Tìm Số CCCD (12 chữ số)
    # Tìm đoạn nào có đúng 12 số liên tiếp
    id_match = re.search(r'\b\d{12}\b', full_text)
    cccd_number = id_match.group(0) if id_match else None

    # 2. Tìm Ngày Sinh (DD/MM/YYYY)
    dob_match = re.search(r'\b(\d{2}[/-]\d{2}[/-]\d{4})\b', full_text)
    dob = dob_match.group(1) if dob_match else None

    # 3. Tìm Họ Tên bằng cách định vị từ khóa "họ và tên" hoặc "name"
    full_name = None
    for i, line in enumerate(results):
        lower_line = line.lower()
        if "tên" in lower_line or "name" in lower_line or "ho va ten" in lower_line:
            candidate_parts = []
            # Duyệt qua các dòng tiếp theo (thường tên người nằm ở 1-2 dòng ngay sau đó)
            for j in range(i + 1, min(i + 4, len(results))):
                next_lower = results[j].lower()
                # Nếu gặp ngày sinh, giới tính hoặc quốc tịch thì dừng lại
                if any(kw in next_lower for kw in ["sinh", "birth", "date", "giới", "sex", "nam", "nữ"]):
                    break
                # Bỏ qua dòng rác quá ngắn chứa ký tự bất hợp lý hoặc dòng nhãn tiếng Anh
                if len(results[j].strip()) < 2 or "socialist" in next_lower or "republic" in next_lower:
                    continue
                # Chấp nhận dòng này là một phần của tên
                candidate_parts.append(results[j].strip())
                
            if candidate_parts:
                full_name = " ".join(candidate_parts)
                # Sửa các lỗi OCR phổ biến do phông chữ in hoa trên CCCD (ví dụ: l (chữ L thường), 1, | bị nhầm từ chữ I in hoa)
                full_name = full_name.replace('l', 'I').replace('1', 'I').replace('0', 'O')
                full_name = full_name.upper()
                # Xóa các ký tự đặc biệt do OCR nhận diện nhầm, giữ lại chữ và số (ví dụ lỡ nhận nhầm TRUN6)
                full_name = re.sub(r'[^\w\sĐđÀ-Ỹà-ỹ]', '', full_name)
                # Dọn dẹp khoảng trắng dư
                full_name = re.sub(r'\s+', ' ', full_name).strip()
                break

    # Nếu không tìm thấy qua cấu trúc mẫu, dùng Fallback bằng Regex
    if not full_name or len(full_name.split()) < 2:
        vn_upper = "A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴỶỸ"
        pattern = r'\b[' + vn_upper + r']+(?: [' + vn_upper + r']+){1,}\b'
        name_matches = re.findall(pattern, full_text)
        
        invalid_names = [
            "CỘNG HÒA", "XÃ HỘI", "CHỦ NGHĨA", "VIỆT NAM", "ĐỘC LẬP", "TỰ DO", "HẠNH PHÚC", 
            "CĂN CƯỚC", "CÔNG DÂN", "SOCIALIST", "REPUBLIC", "OF", "VIET", "NAM", 
            "INDEPENDENCE", "FREEDOM", "HAPPINESS", "CITIZEN", "IDENTITY", "CARD", "MINISTRY", "PUBLIC"
        ]
        
        for name in name_matches:
            is_invalid = any(invalid in name for invalid in invalid_names)
            if not is_invalid and len(name.split()) >= 2:
                full_name = name
                break
            
    return {
        "cccd_number": cccd_number,
        "full_name": full_name,
        "dob": dob,
        "raw_text": results  # Trả về raw text để dev/user có thể kiểm tra nếu regex bị sai
    }

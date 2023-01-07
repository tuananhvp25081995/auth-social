import qrcode from 'qrcode';
import { authenticator } from 'otplib';

/** Tạo mã OTP token */
export const generateOTPToken = (username: string, serviceName: string, secret: string): string => {
  return authenticator.keyuri(username, serviceName, secret);
};
/** Kiểm tra mã OTP token có hợp lệ hay không
 * Có 2 method "verify" hoặc "check", các bạn có thể thử dùng một trong 2 tùy thích.
 */
export const verifyOTPToken = (token: string, secret: string): boolean => {
  return authenticator.verify({ token, secret });
};

/** Tạo QR code từ mã OTP để gửi về cho user sử dụng app quét mã */
export const generateQRCode = async (otpAuth: string) => {
  try {
    const QRCodeImageUrl = await qrcode.toDataURL(otpAuth);
    return `<img src='${QRCodeImageUrl}' alt='qr-code-img-centbox' />`;
  } catch (error) {
    console.log('Could not generate QR code', error);
    return false;
  }
};

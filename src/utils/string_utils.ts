export class StringUtils {
  public makeThumbImageFileName(str: String): string {
    return (
      str.substring(0, str.lastIndexOf('.')) +
      '_thumb' +
      str.substring(str.lastIndexOf('.'), str.length)
    );
  }

  public intToDigitString(digit: number, digitLength: number): string {
    return digit.toString().padStart(digitLength, '0');
  }
}

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

  makeid(length: number): string {
    var result = '';
    // var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }


}

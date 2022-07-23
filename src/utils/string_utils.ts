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



  public getDictionary() {
    return validateDictionary("ABCDEFGHIJKLMNOPQRSTUVWXYZ");

    function validateDictionary(dictionary) {
        for (let i = 0; i < dictionary.length; i++) {
            if(dictionary.indexOf(dictionary[i]) !== dictionary.lastIndexOf(dictionary[i])) {
                console.log('Error: The dictionary in use has at least one repeating symbol:', dictionary[i]);
                return undefined
            }
        }
        return dictionary
    }
}
public numberToEncodedLetter(number) {
  //Takes any number and converts it into a base (dictionary length) letter combo. 0 corresponds to an empty string.
  //It converts any numerical entry into a positive integer.
  if (isNaN(number)) {return undefined}
  number = Math.abs(Math.floor(number));

  const dictionary = this.getDictionary();
  let index = number % dictionary.length;
  let quotient = number / dictionary.length;
  let result;
  
  if (number <= dictionary.length) {return numToLetter(number)}  //Number is within single digit bounds of our encoding letter alphabet

  if (quotient >= 1) {
      //This number was bigger than our dictionary, recursively perform this function until we're done
      if (index === 0) {quotient--}   //Accounts for the edge case of the last letter in the dictionary string
      result =this. numberToEncodedLetter(quotient)
  }

  if (index === 0) {index = dictionary.length}   //Accounts for the edge case of the final letter; avoids getting an empty string
  
  return result + numToLetter(index)

  function numToLetter(number) {
      //Takes a letter between 0 and max letter length and returns the corresponding letter
      if (number > dictionary.length || number < 0) {return undefined}
      if (number === 0) {
          return ''
      } else {
          return dictionary.slice(number - 1, number)
      }
  }
}

}

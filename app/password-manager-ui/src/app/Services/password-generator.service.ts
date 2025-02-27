import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordGeneratorService {

  private specialChars = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'; // using OWASP list of special characters in passwords: https://owasp.org/www-community/password-special-characters
  private alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private nums = '0123456789';

  constructor() { }

  getRandomNumber(upperBound: number){
    return Math.floor(Math.random() * upperBound);
  }

  // Randomly select what type of character to add and append a random selection of that character to the generated password
  pickCharacter(curLen: number, curPass: string){

    let char = '';
    const numPicked = this.getRandomNumber(4);
    const jointLetters = this.alphabet + this.nums;
    // 0 - lc standard, 1 - uc standard, 2 - special char
    if (numPicked === 0){
      const chosenChar = this.getRandomNumber(this.alphabet.length);
      char = jointLetters[chosenChar].toLowerCase();
    }else if(numPicked === 1){
      const chosenChar = this.getRandomNumber(this.alphabet.length);
      char = jointLetters[chosenChar].toUpperCase();
    }else if(numPicked === 2){
      const chosenChar = this.getRandomNumber(this.specialChars.length);
      char = this.specialChars[chosenChar];
    }else if(numPicked === 3){
      const chosenChar = this.getRandomNumber(this.nums.length);
      char = this.nums[chosenChar];
    }

    return char;
  }

  pickRandomNumber(){
    const n = this.getRandomNumber(this.nums.length);
    return this.nums[n];
  }

  pickRandomSpecial(){
    const n = this.getRandomNumber(this.specialChars.length);
    return this.specialChars[n];
  }

  public generatePassword(length: number = 12, minimumNums: number = 2, minimumSpecial: number = 1){
    let curPass = "";

    // generate mandatory elements for secure password, at least 1 number and 1 special character
    for (let i = 0; i < minimumNums; i++){
      curPass += this.pickRandomNumber();
    }
    for (let i = 0; i < minimumSpecial; i++){
      curPass += this.pickRandomSpecial();
    }

    // generate password
    const sizeOfPassword = length - curPass.length;
    for (let i = 0; i < sizeOfPassword; i++){
      var char = this.pickCharacter(curPass.length, curPass);
      curPass += char;
    }

    // shuffle password using the Fisher-Yates Shuffle Algorithm so that it is more random
    let split = curPass.split('');
    for (let i = split.length - 1; i > 0; i--){
      const atChar = split[i];
      const targNum = this.getRandomNumber(i);
      const targ = split[targNum];
      split[i] = targ;
      split[targNum] = atChar;
    }

    curPass = split.join('');

    return curPass;
  }
}

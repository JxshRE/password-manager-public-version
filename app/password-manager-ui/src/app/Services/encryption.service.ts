import { Injectable } from '@angular/core';
import * as crypto from "crypto-js";
import { PasswordInfo } from '../models/password-info.model';
import { Observable, from, map, of } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private iters = 100000
  private digest = 'sha512'
  constructor() { }

  // This method creates a key using PBKDF2 key derivation based on the values passed
  // A key size of 256/32 is a 256 bit key: https://cryptojs.gitbook.io/docs/#pbkdf2 
  createKey(toEncrypt: string, salt: string) : string{
    return crypto.PBKDF2(toEncrypt, salt, { keySize: 256 / 32, iterations: this.iters, hasher: crypto.algo.SHA256 }).toString();
  }

  // This method creates a key using PBKDF2 key derivation based on the values passed (asynchronous)
  async createKeyAsync(toEncrypt: string, salt: string) : Promise<string>{
    return crypto.PBKDF2(toEncrypt, salt, { keySize: 256 / 32, iterations: this.iters, hasher: crypto.algo.SHA256 }).toString();
  }

  // This method is used to get the encryption key based on the user email and their password
  getEncryptionKey(email: string, password: string): string{
    let hash = crypto.SHA256(email).toString();

    let key = this.createKey(password, hash);
    
    return key;
  }

  async getEncryptionKeyAsync(password: string, email: string): Promise<string>{
    let hash = crypto.SHA256(email).toString();

    let key = this.createKey(password, hash);
    
    return key;
  }

  // This method is used to get the key that is stored on the server for authenticating the user
  // This is essentially a key derived from the password which is salted using the encryption key
  // This means that the server doesn't actually store the master password but instead a key derived from it
  async getStoredKey(email: string, password: string): Promise<string>{
    let hash = crypto.SHA256(password).toString();
    let secKey = await this.getEncryptionKeyAsync(password, email);
    const mainKey = await this.createKeyAsync(hash, secKey);
    return mainKey;
  }

  // This method encrypts a string using the encryption key. This uses AES encryption
  encryptStringWithKey(key: string, toEncrypt: string): string{
    var formatted = crypto.enc.Utf8.parse(toEncrypt);
    var res = crypto.AES.encrypt(formatted, key);
    return res.toString();
  }

  // This method decrypts a string using the encryption key. This uses AES encryption
  decryptStringWithKey(key: string, toDecrypt: string){
    var res = crypto.AES.decrypt(toDecrypt, key);
    try{
      return res.toString(crypto.enc.Utf8);
    }catch{
      return res.toString();
    }
  }

  // This method encrypts a password entry with the encryption key 
  encryptPassword(key: string, password: PasswordInfo){
    const newPw = new PasswordInfo();
    newPw.passwordId = password.passwordId,
    newPw.passwordGuid = password.passwordGuid,
    newPw.password = this.encryptStringWithKey(key, password.password);
    newPw.title = this.encryptStringWithKey(key, password.title);
    newPw.username = this.encryptStringWithKey(key, password.username);
    newPw.notes = password.notes != null ? this.encryptStringWithKey(key, password.notes) : undefined;
    return newPw;
  }

  // This method decrypts a password entry using the encryption key
  decryptPassword(key: string, password: PasswordInfo){
    password.password = this.decryptStringWithKey(key, password.password);
    password.title = this.decryptStringWithKey(key, password.title);
    password.username = this.decryptStringWithKey(key, password.username);
    password.notes = password.notes != null ? this.decryptStringWithKey(key, password.notes) : undefined;
    return password;
  }
}

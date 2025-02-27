# Password Manager
This was the password manager I created as part of my degree.

Some config has been removed for the public version. 

### Quick Overview
During the final year of my computer science course at university (graduated in 2024), I chose to create a password manager for my individual project.

I decided to create this as a web app as it allowed me to improve on my full stack web development skills. 

I utilised various encryption techniques throughout the project to ensure that the passwords added to the application are only ever unencrypted on the client. To implement this, I utilised encryption techniques like key derivation, AES Encryption as well as hashing. The encryption methods can be found within [encryption.service.ts](https://github.com/JxshRE/password-manager-public-version/blob/main/app/password-manager-ui/src/app/Services/encryption.service.ts). I utilised PBKDF2 for the key derivation (100,000 iterations) which was based on the user's primary password and utilised their hashed email as a salt. Two separate keys would be created, one would be a stored key which would be derived from their hashed password using their encryption key as a salt. The other would be the encryption key which was derived as previously stated. The stored key would only ever be used for server side auth and would never be used to encrypt the users data in order to make it more secure. 

I also created a password generator which would pseudo randomly pick out a character type, the character that matches this type and would repeat this until the string length matched the user specified length. It would then utilise the Fisher-Yates Shuffle Algorithm for additional randomness in the final password to which it would then output to the user via the UI. 

As part of the project, I also added two step authentication to extend on the security aspect of the project, this would utilise google authenticator with the help of the [GoogleAuthenticator](https://www.nuget.org/packages/GoogleAuthenticator/3.3.0-beta1) Nuget package, to which the API would send the generated QR code and key to the client for use.

Finally, the standard API functionalities were added for storing user passwords, the data it would store in regards to this would be the encrypted data that would be sent from the client, no encryption or decryption of the passwords is done on the API. The client is the one that handles the plain text data. 

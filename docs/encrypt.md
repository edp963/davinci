## How to use encryption
* 1.Set up encryption.type For AES (symmetric encryption) or RSA (asymmetric encryption) from application.yml,The default is OFF
* 2.Open the sourcepasswordencryptutils file to find initrsakey and initaeskey according to application.yml The encryption method of the file configuration performs the initialization key
* 3.The file containing the secret key will be placed in the userfiles/AES/private.txt or userfiles/RSA/private.txt and userfiles/RSA/public.txt



  
package edp.davinci.core.utils;

import com.sun.org.apache.xml.internal.security.utils.Base64;
import edp.core.exception.ServerException;
import edp.davinci.core.common.Constants;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

import javax.annotation.PostConstruct;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.charset.Charset;
import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

@Component
public class SourcePasswordEncryptUtils {

    @Value("${file.userfiles-path}")
    public String fileBasePath;

    @Value("${encryption.type}")
    public String type;

    @Value("${encryption.maxEncryptSize}")
    public int maxEncryptSize;

    /**
     * Base path
     */
    private static String BASE_PATH;

    /**
     * Encrypt type
     */
    private static String ENCRYPT_TYPE;

    /**
     * Max encrypt size
     */
    private static int MAX_ENCRYPT_SIZE;

    /**
     * RSA encryption algorithm
     */
    public static final String ALGORITHM_RSA = "RSA";

    /**
     * RSA encrypted private key file
     */
    public static final String RSA_PRIVATE = "/RSA/private.txt";

    /**
     * RSA encrypted public key file
     */
    public static final String RSA_PUBLIC = "/RSA/public.txt";

    /**
     * AES encryption algorithm
     */
    public static final String ALGORITHM_AES = "AES";

    /**
     * AES encrypted private key file
     */
    public static final String AES_PRIVATE = "/AES/private.txt";

    /**
     * Coding method
     */
    public static final String CODE_TYPE = "UTF-8";

    /**
     * Fill type
     */
    public static final String AES_TYPE = "AES/ECB/PKCS5Padding";

    /**
     * Key length
     */
    public static final int KEY_LENGTH = 128;

    @PostConstruct
    public void getEnvironment(){
        BASE_PATH = this.fileBasePath;
        ENCRYPT_TYPE = this.type;
        MAX_ENCRYPT_SIZE = this.maxEncryptSize;
    }

    public static String encrypt(String contents) {
        if (ENCRYPT_TYPE.equals(ALGORITHM_AES)){
            // AES encryption
            return AESEncrypt(contents, BASE_PATH);
        }else if (ENCRYPT_TYPE.equals(ALGORITHM_RSA)){
            // RSA encryption
            try{
                Key publicKey = loadPublicKeyFromFile(BASE_PATH);
                return RSAEncrypt(contents, publicKey, MAX_ENCRYPT_SIZE);
            }catch (Exception e){
                e.printStackTrace();
                throw new ServerException(e.getMessage());
            }
        }
        return contents;
    }

    public static String decrypt(String contents) {
        if (ENCRYPT_TYPE.equals(ALGORITHM_AES)){
            // AES decryption
            return AESDecrypt(contents, BASE_PATH);
        }else if (ENCRYPT_TYPE.equals(ALGORITHM_RSA)){
            // RSA decryption
            try{
                Key privateKey = loadPrivateKeyFromFile(BASE_PATH);
                return RSADecrypt(contents, privateKey, MAX_ENCRYPT_SIZE);
            }catch (Exception e){
                e.printStackTrace();
                throw new ServerException(e.getMessage());
            }
        }
        return contents;
    }

    /**
     * RSA loads the public key from a file
     *
     * @param basePath : file path
     * @return : public key
     * @throws Exception
     */
    private static PublicKey loadPublicKeyFromFile(String basePath) throws Exception {
        String keyString = FileUtils.readFileToString(new File(basePath + RSA_PUBLIC), Charset.forName("UTF-8"));
        return loadPublicKeyFromString(ALGORITHM_RSA, keyString);
    }

    /**
     * RSA loads the public key from a file
     *
     * @param algorithm
     * @param keyString
     * @return
     * @throws Exception
     */
    private static PublicKey loadPublicKeyFromString(String algorithm, String keyString) throws Exception {
        byte[] decode = Base64.decode(keyString);
        KeyFactory keyFactory = KeyFactory.getInstance(algorithm);
        X509EncodedKeySpec keyspec = new X509EncodedKeySpec(decode);
        return keyFactory.generatePublic(keyspec);
    }

    /**
     * RSA loads the private key from a file
     *
     * @param basePath : file path
     * @return : private key
     * @throws Exception
     */
    private static PrivateKey loadPrivateKeyFromFile(String basePath) throws Exception {
        String keyString = FileUtils.readFileToString(new File(basePath + RSA_PRIVATE), Charset.forName("UTF-8"));
        return loadPrivateKeyFromString(ALGORITHM_RSA, keyString);
    }

    /**
     * RSA loads the private key from a file
     *
     * @param algorithm
     * @param keyString
     * @return
     * @throws Exception
     */
    private static PrivateKey loadPrivateKeyFromString(String algorithm, String keyString) throws Exception {
        byte[] decode = Base64.decode(keyString);
        KeyFactory keyFactory = KeyFactory.getInstance(algorithm);
        PKCS8EncodedKeySpec keyspec = new PKCS8EncodedKeySpec(decode);
        return keyFactory.generatePrivate(keyspec);
    }

    /**
     * RSA encrypts data using key
     *
     * @param input          : original text
     * @param key            : key
     * @param maxEncryptSize : Maximum encryption length (need to be adjusted according to the actual situation)
     * @return : ciphertext
     * @throws Exception
     */
    private static String RSAEncrypt(String input, Key key, int maxEncryptSize) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM_RSA);
        cipher.init(Cipher.ENCRYPT_MODE, key);
        byte[] data = input.getBytes();
        int total = data.length;
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        decodeByte(maxEncryptSize, cipher, data, total, baos);
        return Base64.encode(baos.toByteArray());
    }

    /**
     * RSA decrypts data
     *
     * @param encrypted      : ciphertext
     * @param key            : key
     * @param maxDecryptSize : Maximum encryption length (need to be adjusted according to the actual situation)
     * @return : original text
     * @throws Exception
     */
    private static String RSADecrypt(String encrypted, Key key, int maxDecryptSize) throws Exception {
        Cipher cipher = Cipher.getInstance(ALGORITHM_RSA);
        cipher.init(Cipher.DECRYPT_MODE, key);
        byte[] data = Base64.decode(encrypted);
        int total = data.length;
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        decodeByte(maxDecryptSize, cipher, data, total, baos);
        return baos.toString();
    }

    private static void decodeByte(int maxSize, Cipher cipher, byte[] data, int total, ByteArrayOutputStream baos) throws Exception {
        int offset = 0;
        byte[] buffer;
        while (total - offset > 0) {
            if (total - offset >= maxSize) {
                buffer = cipher.doFinal(data, offset, maxSize);
                offset += maxSize;
            } else {
                buffer = cipher.doFinal(data, offset, total - offset);
                offset = total;
            }
            baos.write(buffer);
        }
    }

    /**
     * AES encryption
     * @param cleartext
     * @param basePath
     * @return
     */
    public static String AESEncrypt(String cleartext, String basePath) {
        try {
            KeyGenerator kgen = KeyGenerator.getInstance(ALGORITHM_AES);
            String keyString = FileUtils.readFileToString(new File(basePath + AES_PRIVATE), Charset.forName("UTF-8"));
            kgen.init(KEY_LENGTH, new SecureRandom(keyString.getBytes()));
            SecretKey secretKey = kgen.generateKey();
            byte[] enCodeFormat = secretKey.getEncoded();
            SecretKeySpec key = new SecretKeySpec(enCodeFormat, ALGORITHM_AES);
            Cipher cipher = Cipher.getInstance(AES_TYPE);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encryptedData = cipher.doFinal(cleartext.getBytes(CODE_TYPE));
            return new BASE64Encoder().encode(encryptedData);
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    /**
     * AES decryption
     * @param encrypted
     * @param basePath
     * @return
     */
    public static String AESDecrypt(String encrypted, String basePath) {
        try {
            byte[] byteMi = new BASE64Decoder().decodeBuffer(encrypted);
            KeyGenerator kgen = KeyGenerator.getInstance(ALGORITHM_AES);
            String keyString = FileUtils.readFileToString(new File(basePath + AES_PRIVATE), Charset.forName("UTF-8"));
            kgen.init(KEY_LENGTH, new SecureRandom(keyString.getBytes()));
            SecretKey secretKey = kgen.generateKey();
            byte[] enCodeFormat = secretKey.getEncoded();
            SecretKeySpec key = new SecretKeySpec(enCodeFormat, ALGORITHM_AES);
            Cipher cipher = Cipher.getInstance(AES_TYPE);
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decryptedData = cipher.doFinal(byteMi);
            return new String(decryptedData, CODE_TYPE);
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    /**
     * Private key used to generate RSA encryption algorithm
     *
     * @param basePath : base path
     * @throws Exception
     */
    private static void initRSAKey(String basePath) throws Exception {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(ALGORITHM_RSA);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        PublicKey publicKey = keyPair.getPublic();
        PrivateKey privateKey = keyPair.getPrivate();
        byte[] publicKeyEncoded = publicKey.getEncoded();
        byte[] privateKeyEncoded = privateKey.getEncoded();
        String publicKeyString = Base64.encode(publicKeyEncoded);
        String privateKeyString = Base64.encode(privateKeyEncoded);
        FileUtils.writeStringToFile(new File(basePath + RSA_PUBLIC), publicKeyString, Charset.forName("UTF-8"));
        FileUtils.writeStringToFile(new File(basePath + RSA_PRIVATE), privateKeyString, Charset.forName("UTF-8"));

    }

    /**
     * Private key used to generate AES encryption algorithm
     * @param basePath
     * @return
     * @throws Exception
     */
    public static void initAESKey(String basePath) throws Exception {
        KeyGenerator kgen = KeyGenerator.getInstance(ALGORITHM_AES);
        kgen.init(KEY_LENGTH);
        SecretKey skey = kgen.generateKey();
        FileUtils.writeStringToFile(new File(basePath + AES_PRIVATE), org.apache.commons.codec.binary.Base64.encodeBase64String(skey.getEncoded()), Charset.forName("UTF-8"));
    }

}

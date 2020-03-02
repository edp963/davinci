package edp.davinci.service.kafka;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Properties;

@Slf4j
public class KafkaProperties extends Properties {

    private Properties properties;

    private static final String JAAS_TEMPLATE =
            "KafkaClient { \n" +
            "         com.sun.security.auth.module.Krb5LoginModule required \n" +
            "         useKeyTab=true \n" +
            "         storeKey=true \n" +
            "         keyTab=\"%1$s\"\n" +
            "         serviceName=\"kafka\"\n" +
            "         principal=\"%2$s\";\n" +
            "};";

    public KafkaProperties(){
        properties = new Properties();
    }

    public KafkaProperties self(){
        return this;
    }

    public KafkaProperties put(String key , String value) {
        if (properties == null) {
            properties = new Properties();
        }

        properties.put(key, value);
        return self();
    }

    public Properties getProperties() {
        return properties;
    }

    public static KafkaProperties initConsumer(){
        return new KafkaProperties()
                .put(ConsumerConfig.GROUP_ID_CONFIG, "DavinciStatistic")
                .put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer")
                .put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringDeserializer")
                .put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false")
                .put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, "1000")
                .put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, "SASL_PLAINTEXT")
                .put("sasl.kerberos.service.name", "kafka");

    }

    public static KafkaProperties initProducer(){
        return new KafkaProperties()
                .put(ProducerConfig.ACKS_CONFIG, "all")
                .put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringSerializer")
                .put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.StringSerializer")
                .put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, "SASL_PLAINTEXT")
                .put("sasl.kerberos.service.name", "kafka");
    }

    //生成jaas.conf临时文件
    public static void configureJAAS(String keyTab, String principal) {
        String content = String.format(JAAS_TEMPLATE, keyTab, principal);
        File jaasConf = null;
        PrintWriter writer = null;
        try {
            jaasConf  = File.createTempFile("jaas", ".conf");
            writer = new PrintWriter(jaasConf);
            writer.println(content);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (writer != null) {
                writer.close();
            }
            jaasConf.deleteOnExit();
        }
        System.setProperty("java.security.auth.login.config", jaasConf.getAbsolutePath());
    }

}

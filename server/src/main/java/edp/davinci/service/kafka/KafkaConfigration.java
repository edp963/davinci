package edp.davinci.service.kafka;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.Producer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.annotation.PostConstruct;

@Configuration
@Slf4j
public class KafkaConfigration {

    protected Producer<String, String> producer;

    private String servers;

    @Autowired
    public Environment environment;

    @PostConstruct
    public void initialize() {
        String statistic_open = environment.getProperty("statistic.enable");
        if(StringUtils.isBlank(statistic_open) || "false".equalsIgnoreCase(statistic_open)){
            return;
        }

        servers = environment.getProperty("statistic.kafka.bootstrap.servers");
        if(StringUtils.isBlank(servers)){
            return;
        }
        log.info("kafka.bootstrap.servers : {}", servers);

        String krb5 = environment.getProperty("statistic.java.security.krb5.conf");
        String keytab = environment.getProperty("statistic.java.security.keytab");
        String principal = environment.getProperty("statistic.java.security.principal");

        System.setProperty("java.security.krb5.conf", krb5);
        KafkaProperties.configureJAAS(keytab, principal);
        System.setProperty("javax.security.auth.useSubjectCredsOnly", "false");

        initProducer();
    }

    public void initProducer(){
        if(producer != null){
            this.producer.flush();
            this.producer.close();
        }

        KafkaProperties producerProps = KafkaProperties.initProducer();
        producerProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, servers);

        producer = new KafkaProducer<>(producerProps.getProperties());
    }

}

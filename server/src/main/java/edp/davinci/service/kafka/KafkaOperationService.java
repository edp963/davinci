package edp.davinci.service.kafka;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class KafkaOperationService extends KafkaConfigration {

    public void send(String topic, String msg) {
        try {
            doSend(topic, msg);

        }catch (Exception e){
            log.error("Send msg to kafka error . topic = {}, msg = {} ", topic, msg, e);
            super.initProducer();

            //重试
            for(int i=1; i<=2; i++){
                log.info("Send msg to kafka retry {} time . topic = {}, msg = {} ", i, topic, msg);
                try {
                    doSend(topic, msg);
                    break;
                }catch (Exception ex){
                    log.error("Send msg to kafka retry {} time . topic = {}, msg = {} ", i, topic, msg, ex);
                }finally {
                    super.initProducer();
                }
            }
        }
    }

    private void doSend(String topic, String msg){
        if(this.producer == null){
            throw new RuntimeException("Producer of kafka is null .");
        }else{
            this.producer.send(new ProducerRecord<>(topic, msg));
        }
    }

}

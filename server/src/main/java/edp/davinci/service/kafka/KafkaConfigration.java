package edp.davinci.service.kafka;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.Producer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.annotation.PostConstruct;
import java.util.Properties;

@Configuration
@Slf4j
public class KafkaConfigration {

    protected Producer<String, String> producer;

    @Autowired
    public Environment environment;

    @PostConstruct
    public void initialize() {
        if(null != producer){
            this.producer.flush();
            this.producer.close();
        }

        String statistic_open = environment.getProperty("statistic.enable");
        if(StringUtils.isBlank(statistic_open) || "false".equalsIgnoreCase(statistic_open)){
            return;
        }

        String servers = environment.getProperty("statistic.kafka.bootstrap.servers");
        if(StringUtils.isBlank(servers)){
            return;
        }

        Properties properties = new Properties();
        properties.put("bootstrap.servers", servers);
        //acks指定必须有多少个分区副本接收消息，生产者才认为消息写入成功，用户检测数据丢失的可能性
        //acks=0：生产者在成功写入消息之前不会等待任何来自服务器的响应。无法监控数据是否发送成功，但可以以网络能够支持的最大速度发送消息，达到很高的吞吐量。
        //acks=1：只要集群的首领节点收到消息，生产者就会收到来自服务器的成功响应。
        //acks=all：只有所有参与复制的节点全部收到消息时，生产者才会收到来自服务器的成功响应。这种模式是最安全的，
        properties.put("acks", "all");
        //retries：生产者从服务器收到的错误有可能是临时性的错误的次数
        properties.put("retries", 0);
        //batch.size：该参数指定了一个批次可以使用的内存大小，按照字节数计算（而不是消息个数)。
        properties.put("batch.size", 16384);
        //linger.ms：该参数指定了生产者在发送批次之前等待更多消息加入批次的时间，增加延迟，提高吞吐量
        properties.put("linger.ms", 1);
        //buffer.memory该参数用来设置生产者内存缓冲区的大小，生产者用它缓冲要发送到服务器的消息。
        properties.put("buffer.memory", 33554432);
        //compression.type:数据压缩格式，有snappy、gzip和lz4，snappy算法比较均衡，gzip会消耗更高的cpu，但压缩比更高
        //key和value的序列化
        properties.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        properties.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        //client.id：该参数可以是任意的字符串，服务器会用它来识别消息的来源。
        //max.in.flight.requests.per.connection：生产者在收到服务器晌应之前可以发送多少个消息。越大越占用内存，但会提高吞吐量
        //timeout.ms：指定了broker等待同步副本返回消息确认的时间
        //request.timeout.ms：生产者在发送数据后等待服务器返回响应的时间
        //metadata.fetch.timeout.ms：生产者在获取元数据（比如目标分区的首领是谁）时等待服务器返回响应的时间。
        // max.block.ms：该参数指定了在调用 send（）方法或使用 partitionsFor（）方法获取元数据时生产者阻塞时间
        // max.request.size：该参数用于控制生产者发送的请求大小。
        //receive.buffer.bytes和send.buffer.bytes：指定了 TCP socket 接收和发送数据包的缓冲区大小，默认值为-1
        properties.put(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, "SASL_PLAINTEXT");
        properties.put("sasl.kerberos.service.name", "kafka");

        producer = new KafkaProducer<>(properties);
    }

}

package edp.davinci.service.elastic;

import com.alibaba.fastjson.JSON;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.TransportAddress;
import org.elasticsearch.transport.client.PreBuiltTransportClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.lang.reflect.Constructor;
import java.net.InetAddress;

@Configuration
@Slf4j
public class ElasticConfigration {

    protected TransportClient client;

    @Autowired
    public Environment environment;

    @PostConstruct
    public void initialize() throws Exception {
        String statistic_open = environment.getProperty("statistic.enable");
        if(StringUtils.isBlank(statistic_open) || "false".equalsIgnoreCase(statistic_open)){
            return;
        }

        String elastic_urls = environment.getProperty("statistic.elastic_urls");
        if(StringUtils.isBlank(elastic_urls)){
            return;
        }

        Settings settings = Settings.builder()
                .put("client.transport.sniff", false)
                .put("client.transport.ignore_cluster_name", true)
                .build();

        Class transportaddress;
        try{
            transportaddress = Class.forName("org.elasticsearch.common.transport.InetSocketTransportAddress");
        }catch (ClassNotFoundException e){
            transportaddress = Class.forName("org.elasticsearch.common.transport.TransportAddress");
        }
        Constructor constructor = transportaddress.getConstructor(InetAddress.class, int.class);

        // 初始化地址
        String[] addressArr = elastic_urls.split(",");
        TransportAddress[] transportAddresses = new TransportAddress[addressArr.length];
        for(int i=0 ; i<transportAddresses.length; i++){
            transportAddresses[i] = (TransportAddress) constructor.newInstance(InetAddress.getByName(addressArr[i].split(":")[0]),
                    Integer.parseInt(addressArr[i].split(":")[1]));
        }

        PreBuiltTransportClient preBuiltTransportClient = new PreBuiltTransportClient(settings);
        this.client = preBuiltTransportClient.addTransportAddresses(transportAddresses);

        log.info("ElasticsearchClient connect success [{}].", JSON.toJSON(this.client.transportAddresses()));
    }

    @PreDestroy
    public void destroy() {
        if (client != null) {
            client.close();
        }
    }

}

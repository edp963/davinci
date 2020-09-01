package edp.davinci.service.impl;

import com.alibaba.fastjson.JSON;
import edp.core.model.QueryColumn;
import edp.core.model.TableInfo;
import edp.core.utils.SqlUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.utils.SourcePasswordEncryptUtils;
import edp.davinci.service.StatisticService;
import edp.davinci.service.elastic.ElasticOperationService;
import edp.davinci.service.kafka.KafkaOperationService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import javax.annotation.PostConstruct;
import java.lang.reflect.Method;
import java.util.*;

@Service("statisticService")
@Slf4j
public class StatisticServiceImpl implements StatisticService {

    @Autowired
    private Environment environment;

    @Autowired
    private ElasticOperationService elasticOperationService;

    @Autowired
    private KafkaOperationService kafkaOperationService;

    @Autowired
    private SqlUtils sqlUtils;

    boolean statisticOpen = false;  //是否开启埋点统计

    @PostConstruct
    public void init(){
        String statistic_open = environment.getProperty("statistic.enable");
        if("true".equalsIgnoreCase(statistic_open)){
            this.statisticOpen = true;
        }
    }

    @Override
    public <T> void insert(List<T> infoList, Class clz){
        if(!statisticOpen) {
            return;
        }

        String tableName = getTableName4Info(clz);

        String elastic_urls = environment.getProperty("statistic.elastic_urls");
        if(StringUtils.isNotBlank(elastic_urls)) {
            String elasticIndexPrefix = environment.getProperty("statistic.elastic_index_prefix");
            String index = StringUtils.isBlank(elasticIndexPrefix) ? tableName : elasticIndexPrefix + "_" + tableName;
            elasticOperationService.batchInsert(index, index, infoList);
            return;
        }

        String mysqlUrl = environment.getProperty("statistic.mysql_url");
        if(StringUtils.isNotBlank(mysqlUrl)) {
            String mysqlUsername = environment.getProperty("statistic.mysql_username");
            String mysqlPassword = environment.getProperty("statistic.mysql_password");
            // Password encryption
            String encrypt = SourcePasswordEncryptUtils.encrypt(mysqlPassword);
            this.sqlUtils = this.sqlUtils.init(mysqlUrl, mysqlUsername, encrypt, null, null, false);

            List<Map<String, Object>> values = entityConvertIntoMap(infoList);
            Set<QueryColumn> headers = getHeaders(mysqlUrl, tableName);
            String sql = getInsertSql(clz, headers);

            sqlUtils.executeBatch(sql, headers, values);
            return;
        }

        String kafkaServers = environment.getProperty("statistic.kafka.bootstrap.servers");
        if(StringUtils.isNotBlank(kafkaServers)) {
            String topic = environment.getProperty("statistic.kafka.topic");
            kafkaOperationService.send(topic, JSON.toJSONString(infoList));
            return;
        }

        mysqlUrl = environment.getProperty("spring.datasource.url");
        String mysqlUsername = environment.getProperty("spring.datasource.username");
        String mysqlPassword = environment.getProperty("spring.datasource.password");
        // Password encryption
        String encrypt = SourcePasswordEncryptUtils.encrypt(mysqlPassword);
        this.sqlUtils = this.sqlUtils.init(mysqlUrl, mysqlUsername, encrypt, null, null, false);

        List<Map<String, Object>> values = entityConvertIntoMap(infoList);
        Set<QueryColumn> headers = getHeaders(mysqlUrl, tableName);
        String sql = getInsertSql(clz, headers);

        sqlUtils.executeBatch(sql, headers, values);
    }

    public Set<QueryColumn> getHeaders(String url, String tableName){
        String dbName = url.substring(0, url.indexOf("?"));
        dbName = dbName.substring(dbName.lastIndexOf("/")+1, dbName.length());

        TableInfo tableInfo = sqlUtils.getTableInfo(dbName, tableName);

        return new HashSet<>(tableInfo.getColumns());
    }

    private String getTableName4Info(Class clz){
        String className = clz.getSimpleName();
        String tableName = humpToUnderline(className.substring(0, className.indexOf("Info")));
        return tableName;
    }

    private String getInsertSql(Class clz, Set<QueryColumn> headers){
        String tableName = getTableName4Info(clz);

        STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
        ST st = stg.getInstanceOf("insertData");
        st.add("tableName", tableName);
        st.add("columns", headers);
        String sql = st.render();

        return sql;
    }

    public static String humpToUnderline(String para){
        StringBuilder sb = new StringBuilder(para);
        boolean firstNumberUpper = true;
        int temp=0;//定位
        for(int i=1;i<para.length();i++){
            if(Character.isUpperCase(para.charAt(i))){
                sb.insert(i+temp, "_");
                temp+=1;
            }
            if(firstNumberUpper && Character.isDigit(para.charAt(i))){
                sb.insert(i+temp, "_");
                temp+=1;
                firstNumberUpper = false;
            }
        }
        return sb.toString().toLowerCase();
    }

    public static <T> List<Map<String, Object>> entityConvertIntoMap(List<T> list){
        List<Map<String, Object>> l = new LinkedList<>();
        try {
            for(T t : list){
                Map<String, Object> map = new HashMap<>();
                Method[] methods = t.getClass().getMethods();
                for (Method method : methods) {
                    if (method.getName().startsWith("get")) {
                        String name = method.getName().substring(3);
                        name = name.substring(0, 1).toLowerCase() + name.substring(1);
                        Object value = method.invoke(t);
                        if(value instanceof List){
                            value = value.toString();
                        }
                        map.put(name,value);
                    }
                }
                l.add(map);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return l;
    }


}

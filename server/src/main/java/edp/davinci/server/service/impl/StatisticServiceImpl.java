package edp.davinci.server.service.impl;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.core.dao.entity.User;
import edp.davinci.data.pojo.SourceConfig;
import edp.davinci.data.provider.JdbcDataProvider;
import edp.davinci.data.util.JdbcSourceUtils;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.component.elastic.ElasticOperationService;
import edp.davinci.server.component.kafka.KafkaOperationService;
import edp.davinci.server.model.QueryColumn;
import edp.davinci.server.model.TableInfo;
import edp.davinci.server.service.StatisticService;
import edp.davinci.server.util.DataUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import javax.annotation.PostConstruct;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

@Service("statisticService")
public class StatisticServiceImpl implements StatisticService {

    @Autowired
    private Environment environment;

    @Autowired
    private ElasticOperationService elasticOperationService;

    @Autowired
    private KafkaOperationService kafkaOperationService;

    @Autowired
    private DataUtils sqlUtils;

    boolean statisticOpen = false; // 是否开启埋点统计

    @PostConstruct
    public void init() {
        String statistic_open = environment.getProperty("statistic.enable");
        if ("true".equalsIgnoreCase(statistic_open)) {
            this.statisticOpen = true;
        }
    }

    @Override
    @Transactional
    public <T> void insert(List<T> infoList, Class clz, User user) {

        if (!statisticOpen) {
            return;
        }

        String tableName = getTableNameFromClass(clz);

        String elasticUrls = environment.getProperty("statistic.elastic_urls");
        if (StringUtils.isNotBlank(elasticUrls)) {
            String elasticIndexPrefix = environment.getProperty("statistic.elastic_index_prefix");
            String index = StringUtils.isBlank(elasticIndexPrefix) ? tableName : elasticIndexPrefix + "_" + tableName;
            elasticOperationService.batchInsert(index, index, infoList);
            return;
        }

        String kafkaServers = environment.getProperty("statistic.kafka.bootstrap.servers");
        if (StringUtils.isNotBlank(kafkaServers)) {
            String topic = environment.getProperty("statistic.kafka.topic");
            kafkaOperationService.send(topic, JSONUtils.toString(infoList));
            return;
        }

        String mysqlUrl = environment.getProperty("statistic.mysql_url");
        String mysqlUsername = environment.getProperty("statistic.mysql_username");
        String mysqlPassword = environment.getProperty("statistic.mysql_password");

        if (StringUtils.isBlank(mysqlUrl)) {
            mysqlUrl = environment.getProperty("spring.datasource.url");
            mysqlUsername = environment.getProperty("spring.datasource.username");
            mysqlPassword = environment.getProperty("spring.datasource.password");
        }

        SourceConfig config = SourceConfig
                                    .builder()
                                    .url(mysqlUrl)
                                    .username(mysqlUsername)
                                    .password(mysqlPassword)
                                    .database("mysql")
                                    .name("statistic")
                                    .build();
        Source source = new Source();
        source.setConfig(JSONUtils.toString(config));
        source.setType(JdbcDataProvider.type);

        List<QueryColumn> headers = getHeaders(source, tableName, user);
        List<Map<String, Object>> values = entityConvertIntoMap(infoList);

        DataUtils.batchUpdate(source, getInsertSql(clz, headers), headers, values);
    }

    public List<QueryColumn> getHeaders(Source source, String tableName, User user) {
        String url = JdbcSourceUtils.getUrl(source.getConfig());
        String dbName = url.substring(0, url.indexOf("?"));
        dbName = dbName.substring(dbName.lastIndexOf("/") + 1, dbName.length());
        TableInfo tableInfo = DataUtils.getTableInfo(source, dbName, tableName, user);
        return tableInfo.getColumns();
    }

    private String getTableNameFromClass(Class clz) {
        return humpToUnderline(clz.getSimpleName());
    }

    private String getInsertSql(Class clz, List<QueryColumn> headers) {
        String tableName = getTableNameFromClass(clz);
        STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
        ST st = stg.getInstanceOf("insert");
        st.add("tableName", tableName);
        st.add("columns", headers);
        return st.render();
    }

    public static String humpToUnderline(String para) {
        StringBuilder sb = new StringBuilder(para);
        boolean firstNumberUpper = true;
        int temp = 0;// 定位
        for (int i = 1; i < para.length(); i++) {
            if (Character.isUpperCase(para.charAt(i))) {
                sb.insert(i + temp, "_");
                temp += 1;
            }
            if (firstNumberUpper && Character.isDigit(para.charAt(i))) {
                sb.insert(i + temp, "_");
                temp += 1;
                firstNumberUpper = false;
            }
        }
        return sb.toString().toLowerCase();
    }

    public static <T> List<Map<String, Object>> entityConvertIntoMap(List<T> list) {
        List<Map<String, Object>> l = new LinkedList<>();
        try {
            for (T t : list) {
                Map<String, Object> map = new HashMap<>();
                Method[] methods = t.getClass().getMethods();
                for (Method method : methods) {
                    if (method.getName().startsWith("get")) {
                        String name = method.getName().substring(3);
                        name = name.substring(0, 1).toLowerCase() + name.substring(1);
                        Object value = method.invoke(t);
                        if (value instanceof List) {
                            value = value.toString();
                        }
                        map.put(name, value);
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
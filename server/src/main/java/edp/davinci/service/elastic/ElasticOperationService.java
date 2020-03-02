package edp.davinci.service.elastic;

import edp.core.exception.ServerException;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.action.bulk.BulkRequestBuilder;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.List;

import static org.elasticsearch.common.xcontent.XContentFactory.jsonBuilder;

@Component
@Slf4j
public class ElasticOperationService extends ElasticConfigration {

    public void batchInsert(String index, String type, List<?> objects) {
        
        try{

            BulkRequestBuilder bulkRequest = client.prepareBulk();

            for(Object object : objects){
                XContentBuilder builder = jsonBuilder().startObject();
                String[] fileNames = getFiledName(object);
                for(String fileName : fileNames){
                    Object value = getFieldValueByName(fileName, object);
                    builder.field(fileName, value);
                }
                builder.endObject();
                bulkRequest.add(client.prepareIndex(index, type).setSource(builder));
            }

            BulkResponse bulkResponse = bulkRequest.get();
            if (bulkResponse.hasFailures()) {
                // process failures by iterating through each bulk response item
                log.error("ElasticOperation batchInsert failed. {}", bulkResponse.toString());
            }

        }catch (Exception e){
            log.error("ElasticOperation batchInsert error. ", e);
            throw new ServerException(e.getMessage());
        }
    }

    private static String[] getFiledName(Object o) {
        Field[] fields = o.getClass().getDeclaredFields();
        String[] fieldNames = new String[fields.length];
        for (int i = 0; i < fields.length; i++) {
            fieldNames[i] = fields[i].getName();
        }
        return fieldNames;
    }

    private static Object getFieldValueByName(String fieldName, Object o) {
        try {
            String firstLetter = fieldName.substring(0, 1).toUpperCase();
            String getter = "get" + firstLetter + fieldName.substring(1);
            Method method = o.getClass().getMethod(getter, new Class[]{});
            Object value = method.invoke(o, new Object[]{});
            return value;
        } catch (Exception e) {
            // ignore
        }
        return null;
    }
}

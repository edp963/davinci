package edp.davinci.dto.logDto;

import com.alibaba.fastjson.annotation.JSONField;
import com.alibaba.fastjson.annotation.JSONType;
import com.google.common.collect.MapDifference;
import com.google.common.collect.Maps;
import edp.davinci.core.enums.OperateTypeEnum;
import edp.davinci.core.enums.TableTypeEnum;
import lombok.Data;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.cglib.beans.BeanMap;

import java.lang.reflect.Array;
import java.util.*;

/**
 * @Author : bogeli
 * @Description :
 * @Date : Created in 2020/5/9
 */
@Data
@JSONType(orders = {"tableType","pkId","fields"})
public class OperationLogDetail {
    private String tableType;
    private Long pkId;
    private List<TableField> fields;

    private OperationLogDetail() {
    }

    private OperationLogDetail(Builder builder) {
        this.tableType = builder.tableTypeEnum.getTableType();
        this.pkId = builder.pkId;
        this.fields = builder.getTableFields();
    }

    public static Builder getBuilder() {
        return new Builder();
    }

    public static class Builder {
        private static final String ID = "id";
        private Long pkId;
        private TableTypeEnum tableTypeEnum;
        private OperateTypeEnum operateTypeEnum;
        private Map<String, Object> oldBeanMap;
        private Map<String, Object> newBeanMap;


        public Builder tableTypeEnum(TableTypeEnum tableTypeEnum) {
            this.tableTypeEnum = tableTypeEnum;
            return this;
        }

        public Builder operateTypeEnum(OperateTypeEnum operateTypeEnum) {
            this.operateTypeEnum = operateTypeEnum;
            return this;
        }

        public <T> Builder oldBean(T bean) {
            this.oldBeanMap = toMap(bean);
            return this;
        }

        public <T> Builder newBean(T bean) {
            this.newBeanMap = toMap(bean);
            return this;
        }


        public OperationLogDetail build() {
            return new OperationLogDetail(this);
        }


        private List<TableField> getTableFields() {
            List<TableField> tablefields = new ArrayList<>();
            switch (operateTypeEnum) {
                case INSERT:
                    newBeanMap.forEach((k, v) -> tablefields.add(new TableField(k, "", v)));
                    break;
                case UPDATE:
                    removeUnmodified(oldBeanMap, newBeanMap);
                    Set<String> keys = new HashSet<>();
                    keys.addAll(oldBeanMap.keySet());
                    keys.addAll(newBeanMap.keySet());
                    for (String key : keys) {
                        Object newValue = newBeanMap.get(key) == null ? "" : newBeanMap.get(key);
                        Object oldValue = oldBeanMap.get(key) == null ? "" : oldBeanMap.get(key);
                        tablefields.add(new TableField(key, oldValue, newValue));
                    }
                    break;
                case DELETE:
                    oldBeanMap.forEach((k, v) -> tablefields.add(new TableField(k, v, "")));
                    break;
                default:
                    break;
            }
            return tablefields;
        }

        private void removeUnmodified(Map<String, Object> oldBeanMap, Map<String, Object> newBeanMap) {
            if (!oldBeanMap.isEmpty() && !newBeanMap.isEmpty()) {
                MapDifference<String, Object> mapDifference = Maps.difference(oldBeanMap, newBeanMap);
                Set<String> unmodifiedKeys = mapDifference.entriesInCommon().keySet();
                oldBeanMap.entrySet().removeIf(entry -> unmodifiedKeys.contains(entry.getKey()));
                newBeanMap.entrySet().removeIf(entry -> unmodifiedKeys.contains(entry.getKey()));
            }
        }


        private <T> Map<String, Object> toMap(T bean) {
            Map<String, Object> map = new HashMap<>();
            Set<String> ignoreKeys = IgnoreFieldEnum.getFields();
            if (bean != null) {
                BeanMap beanMap = BeanMap.create(bean);
                setPkId(beanMap);
                for (Object key : beanMap.keySet()) {
                    String strKey = key + "";
                    if (!ignoreKeys.contains(strKey)) {
                        if (!isEmpty(beanMap.get(key))) {
                            map.put(strKey, beanMap.get(key));
                        }
                    }
                }
            }
            return map;
        }

        private void setPkId(BeanMap beanMap) {
            if (pkId == null) {
                if (beanMap.get(ID) != null) {
                    pkId = (Long) beanMap.get(ID);
                }
            }
        }

        private boolean isEmpty(Object obj) {
            if (obj == null) {
                return true;
            }
            if ((obj instanceof Collection)) {
                return CollectionUtils.isEmpty((Collection) obj);
            }
            if ((obj instanceof String)) {
                return StringUtils.isBlank((String) obj);
            }
            if (obj.getClass().isArray()) {
                return Array.getLength(obj) == 0;
            }
            return false;
        }

    }


    private enum IgnoreFieldEnum {
        ID("id"),
        PASSWORD("password"),
        CREATEBY("createBy"),
        UPDATEBY("updateBy"),
        CREATETIME("createTime"),
        UPDATETIME("updateTime"),;
        private String field;

        IgnoreFieldEnum(String field) {
            this.field = field;
        }

        public String getField() {
            return field;
        }

        public static Set<String> getFields() {
            Set<String> fields = new HashSet<>();
            for (IgnoreFieldEnum ignoreFieldEnum : IgnoreFieldEnum.values()) {
                fields.add(ignoreFieldEnum.getField());
            }
            return fields;
        }
    }

}

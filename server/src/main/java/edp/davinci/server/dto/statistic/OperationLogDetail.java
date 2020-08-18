package edp.davinci.server.dto.statistic;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.google.common.collect.MapDifference;
import com.google.common.collect.Maps;
import edp.davinci.server.enums.OperateTypeEnum;
import edp.davinci.server.enums.TableTypeEnum;
import lombok.Data;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.cglib.beans.BeanMap;

import java.lang.reflect.Array;
import java.util.*;

@Data
@JsonPropertyOrder(value= {"tableType","pkId","fields"})
public class OperationLogDetail {
	private String tableType;
	private Long pkId;
	private List<TableCol> cols;

	private OperationLogDetail() {
	}

	private OperationLogDetail(Builder builder) {
		this.tableType = builder.tableTypeEnum.getTableType();
		this.pkId = builder.pkId;
		this.cols = builder.getTableCols();
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


		private List<TableCol> getTableCols() {
			List<TableCol> tableCols = new ArrayList<>();
			switch (operateTypeEnum) {
				case INSERT:
					newBeanMap.forEach((k, v) -> tableCols.add(new TableCol(k, "", v)));
					break;
				case UPDATE:
					removeUnmodified(oldBeanMap, newBeanMap);
					Set<String> keys = new HashSet<>();
					keys.addAll(oldBeanMap.keySet());
					keys.addAll(newBeanMap.keySet());
					for (String key : keys) {
						Object newVal = newBeanMap.get(key) == null ? "" : newBeanMap.get(key);
						Object oldVal = oldBeanMap.get(key) == null ? "" : oldBeanMap.get(key);
						tableCols.add(new TableCol(key, oldVal, newVal));
					}
					break;
				case DELETE:
					oldBeanMap.forEach((k, v) -> tableCols.add(new TableCol(k, v, "")));
					break;
				default:
					break;
			}
			return tableCols;
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
			Set<String> ignoreCols = IgnoreColEnum.getCols();
			if (bean != null) {
				BeanMap beanMap = BeanMap.create(bean);
				setPkId(beanMap);
				for (Object key : beanMap.keySet()) {
					String keyStr = key + "";
					if (!ignoreCols.contains(keyStr)) {
						if (!isEmpty(beanMap.get(key))) {
							map.put(keyStr, beanMap.get(key));
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


	private enum IgnoreColEnum {
		ID("id"),
		PASSWORD("password"),
		CREATEBY("createBy"),
		UPDATEBY("updateBy"),
		CREATETIME("createTime"),
		UPDATETIME("updateTime"),;
		private String col;

		IgnoreColEnum(String col) {
			this.col = col;
		}

		public String getCol() {
			return col;
		}

		public static Set<String> getCols() {
			Set<String> cols = new HashSet<>();
			for (IgnoreColEnum ignoreColEnum : IgnoreColEnum.values()) {
				cols.add(ignoreColEnum.getCol());
			}
			return cols;
		}
	}

}

package edp.davinci.server.util;

import edp.davinci.commons.util.JSONUtils;
import edp.davinci.core.dao.entity.User;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dto.statistic.OperationLog;
import edp.davinci.server.dto.statistic.OperationLogDetail;
import edp.davinci.server.enums.OperateTypeEnum;
import edp.davinci.server.enums.TableTypeEnum;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class OptLogUtils {


	public static <T> String insert(TableTypeEnum tableTypeEnum, T newBean) {
		return formatLog(OperateTypeEnum.INSERT, tableTypeEnum, null, newBean);
	}

	public static <T> String insertBatch(TableTypeEnum tableTypeEnum, List<T> newBeans) {
		return formatLogBatch(OperateTypeEnum.INSERT, tableTypeEnum, null, newBeans);
	}

	public static <T> String delete(TableTypeEnum tableTypeEnum, T oldBean) {
		return formatLog(OperateTypeEnum.DELETE, tableTypeEnum, oldBean, null);
	}

	public static <T> String deleteBatch(TableTypeEnum tableTypeEnum, List<T> oldBeans) {
		return formatLogBatch(OperateTypeEnum.DELETE, tableTypeEnum, oldBeans, null);
	}

	public static <T> String update(TableTypeEnum tableTypeEnum, T oldBean, T newBean) {
		return formatLog(OperateTypeEnum.UPDATE, tableTypeEnum, oldBean, newBean);
	}

	public static <T> String updateBatch(TableTypeEnum tableTypeEnum, List<T> oldBeans, List<T> newBeans) {
		return formatLogBatch(OperateTypeEnum.UPDATE, tableTypeEnum, oldBeans, newBeans);
	}


	private static <T> String formatLog(OperateTypeEnum operationTypeEnum, TableTypeEnum tableTypeEnum, T oldBean, T newBean) {
		OperationLog operationLog = new OperationLog(operationTypeEnum, getOperatorId());
		operationLog.addOperationLogDetail(getOperationLogDetail(operationTypeEnum, tableTypeEnum, oldBean, newBean));
		return JSONUtils.toString(operationLog);
	}


	private static <T> String formatLogBatch(OperateTypeEnum operationTypeEnum, TableTypeEnum tableTypeEnum, List<T> oldBeans, List<T> newBeans) {
		OperationLog operationLog = new OperationLog(operationTypeEnum, getOperatorId());
		switch (operationTypeEnum) {
			case INSERT:
				for (T bean : newBeans) {
					operationLog.addOperationLogDetail(getOperationLogDetail(OperateTypeEnum.INSERT, tableTypeEnum, null, bean));
				}
				break;
			case DELETE:
				for (T bean : oldBeans) {
					operationLog.addOperationLogDetail(getOperationLogDetail(OperateTypeEnum.DELETE, tableTypeEnum, bean, null));
				}
				break;
			case UPDATE:
				List<T> beans = new ArrayList<>();
				beans.addAll(oldBeans);
				beans.addAll(newBeans);
				Map<String, List<T>> groupById = beans.stream().collect(Collectors.groupingBy(bean -> {
					try {
						return bean.getClass().getMethod("getId").invoke(bean).toString();
					} catch (Exception e) {
						return null;
					}
				}, LinkedHashMap::new, Collectors.toList()));
				groupById.forEach((key, list) -> {
					if (list.size() == 2) {
						operationLog.addOperationLogDetail((getOperationLogDetail(operationTypeEnum, tableTypeEnum, list.get(0), list.get(1))));
					}
				});
				break;
			default:
				break;
		}
		return JSONUtils.toString(operationLog);
	}

	private static <T> OperationLogDetail getOperationLogDetail(OperateTypeEnum operationTypeEnum, TableTypeEnum tableTypeEnum, T oldBean, T newBean) {
		return OperationLogDetail.getBuilder()
				.operateTypeEnum(operationTypeEnum)
				.tableTypeEnum(tableTypeEnum)
				.oldBean(oldBean)
				.newBean(newBean)
				.build();
	}

	private static Long getOperatorId() {
		ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
		HttpServletRequest request = attributes.getRequest();
		User user = (User) request.getAttribute(Constants.CURRENT_USER);
		return user.getId();
	}


}
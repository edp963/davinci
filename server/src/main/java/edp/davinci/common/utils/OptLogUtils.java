package edp.davinci.common.utils;

import com.alibaba.fastjson.JSON;
import edp.core.consts.Consts;
import edp.davinci.core.enums.OperateTypeEnum;
import edp.davinci.core.enums.TableTypeEnum;
import edp.davinci.dto.logDto.OperationLog;
import edp.davinci.dto.logDto.OperationLogDetail;
import edp.davinci.model.User;
import org.slf4j.Logger;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @Author : bogeli
 * @Description :
 * @Date : Created in 2020/4/23
 */
public class OptLogUtils {


    public static <T> void insert(TableTypeEnum tableTypeEnum, T newBean, Logger customLogger) {
        customLogger.info(formatLog(OperateTypeEnum.INSERT, tableTypeEnum, null, newBean));
    }

    public static <T> void insertBatch(TableTypeEnum tableTypeEnum, List<T> newBeans, Logger customLogger) {
        customLogger.info(formatLogBatch(OperateTypeEnum.INSERT, tableTypeEnum, null, newBeans));
    }

    public static <T> void delete(TableTypeEnum tableTypeEnum, T oldBean, Logger customLogger) {
        customLogger.info(formatLog(OperateTypeEnum.DELETE, tableTypeEnum, oldBean, null));
    }

    public static <T> void deleteBatch(TableTypeEnum tableTypeEnum, List<T> oldBeans, Logger customLogger) {
        customLogger.info(formatLogBatch(OperateTypeEnum.DELETE, tableTypeEnum, oldBeans, null));
    }


    public static <T> void update(TableTypeEnum tableTypeEnum, T oldBean, T newBean, Logger customLogger) {
        customLogger.info(formatLog(OperateTypeEnum.UPDATE, tableTypeEnum, oldBean, newBean));
    }

    public static <T> void updateBatch(TableTypeEnum tableTypeEnum, List<T> oldBeans, List<T> newBeans, Logger customLogger) {
        customLogger.info(formatLogBatch(OperateTypeEnum.UPDATE, tableTypeEnum, oldBeans, newBeans));
    }


    private static <T> String formatLog(OperateTypeEnum operationTypeEnum, TableTypeEnum tableTypeEnum, T oldBean, T newBean) {
        OperationLog operationLog = new OperationLog(operationTypeEnum, getOperatorId());
        operationLog.addOperationLogDetail(getOperationLogDetail(operationTypeEnum, tableTypeEnum, oldBean, newBean));
        return JSON.toJSONString(operationLog);
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
        return JSON.toJSONString(operationLog);
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
        User user = (User) request.getAttribute(Consts.CURRENT_USER);
        return user.getId();
    }


}

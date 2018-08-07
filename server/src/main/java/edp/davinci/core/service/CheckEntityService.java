package edp.davinci.core.service;

/**
 * 验证资源是否存在接口，资源接口必须实现
 */
public interface CheckEntityService {

    boolean isExist(String name, Long id, Long scopeId);
}

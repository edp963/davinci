package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.CheckEntityEnum;

import javax.servlet.http.HttpServletRequest;

public interface CheckService {

    ResultMap checkSource(String name, String entity, Long id, Long scopId, HttpServletRequest request);

    ResultMap checkSource(String name, Long id,CheckEntityEnum checkEntityEnum, Long scopId, HttpServletRequest request);
}

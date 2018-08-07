package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.widgetDto.WidgetCreate;
import edp.davinci.dto.widgetDto.WidgetUpdate;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;

public interface WidgetService extends CheckEntityService {
    ResultMap getWidgets(Long projectId, User user, HttpServletRequest request);

    ResultMap createWidget(WidgetCreate widgetCreate, User user, HttpServletRequest request);

    ResultMap updateWidget(WidgetUpdate widgetUpdate, User user, HttpServletRequest request);

    ResultMap deleteWidget(Long id, User user, HttpServletRequest request);

    ResultMap shareWidget(Long id, User user, String username, HttpServletRequest request);
}

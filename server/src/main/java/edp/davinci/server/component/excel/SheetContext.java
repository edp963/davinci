/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
 *  ==
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *        http://www.apache.org/licenses/LICENSE-2.0
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *  >>
 *
 */

package edp.davinci.server.component.excel;

import edp.davinci.core.dao.entity.User;
import edp.davinci.server.dto.view.WidgetQueryParam;
import edp.davinci.server.model.ExcelHeader;
import edp.davinci.server.model.QueryColumn;
import edp.davinci.server.util.DataUtils;
import lombok.Builder;
import lombok.Data;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;

import java.io.Serializable;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 18:21
 * To change this template use File | Settings | File Templates.
 */
@Data
@Builder
public class SheetContext implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private List<QueryColumn> queryColumns;
    private List<String> excludeColumns;
    private Sheet sheet;
    private Workbook workbook;
    private Boolean contain;
    private Boolean isTable;
    private List<ExcelHeader> excelHeaders;
    private Long dashboardId;
    private Long widgetId;
    private String name;
    private int sheetNo;
    private MsgWrapper wrapper;
    private int resultLimit;
    private String taskKey;
    private Logger customLogger;
    private String queryModel;
    private Long viewId;
    private WidgetQueryParam executeParam;
    private User user;
}

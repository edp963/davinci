/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.common.job.ScheduleService;
import edp.core.exception.ServerException;
import edp.core.utils.DateUtils;
import edp.core.utils.FileUtils;
import edp.core.utils.MailUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.enums.CronJobMediaType;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.dao.*;
import edp.davinci.dto.cronJobDto.CronJobConfig;
import edp.davinci.dto.cronJobDto.CronJobContent;
import edp.davinci.dto.viewDto.Aggregator;
import edp.davinci.dto.viewDto.Order;
import edp.davinci.dto.viewDto.Param;
import edp.davinci.dto.viewDto.ViewExecuteParam;
import edp.davinci.dto.widgetDto.WidgetWithRelationDashboardId;
import edp.davinci.model.*;
import edp.davinci.service.ViewService;
import edp.davinci.service.WidgetService;
import jdk.nashorn.api.scripting.ScriptObjectMirror;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.File;
import java.io.InputStreamReader;
import java.io.LineNumberReader;
import java.net.URLDecoder;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@SuppressWarnings("AlibabaThreadPoolCreation")
@Slf4j
@Service("emailScheduleService")
public class EmailScheduleServiceImpl extends CommonService implements ScheduleService {

    @Autowired
    private CronJobMapper cronJobMapper;

    @Autowired
    private MailUtils mailUtils;

    @Value("${file.phantomJs-path}")
    private String phantomJsFile;

    @Value("${phantomjs_home}")
    private String phantomJsHome;

    @Value("${file.userfiles-path}")
    private String fileBasePath;

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Autowired
    private DisplayMapper displayMapper;

    @Autowired
    private ViewService viewService;

    @Autowired
    private WidgetService widgetService;


    private volatile boolean imageExit = false;

    private static final String portal = "PORTAL";

    /**
     * outlook最大图片显示高度为1728px
     */
    private final int imageMaxHeight = 1720;

    private final String baseUrl = File.separator + "tempFiles" + File.separator + DateUtils.getNowDateYYYYMM();

    @Override
    public void execute(long jobId) throws Exception {
        CronJob cronJob = cronJobMapper.getById(jobId);
        if (null != cronJob && !StringUtils.isEmpty(cronJob.getConfig())) {
            CronJobConfig cronJobConfig = JSONObject.parseObject(cronJob.getConfig(), CronJobConfig.class);
            if (null != cronJobConfig && !StringUtils.isEmpty(cronJobConfig.getType())) {
                Map<String, Object> content = new HashMap<>();
                User user = userMapper.selectByEmail(cronJobConfig.getTo());
                String username = cronJobConfig.getTo().split("@")[0];
                if (null != user) {
                    username = StringUtils.isEmpty(user.getName()) ? user.getUsername() : user.getName();
                }
                content.put("username", username);

                List<File> attachments = null;
                if (cronJobConfig.getType().equals(CronJobMediaType.IMAGE.getType())) {
                    attachments = generateImages(cronJobConfig, cronJob.getCreateBy());
                } else if (cronJobConfig.getType().equals(CronJobMediaType.EXCEL.getType())) {
                    attachments = generateExcels(cronJobConfig, user);
                } else if (cronJobConfig.getType().equals(CronJobMediaType.IMAGEANDEXCEL.getType())) {
                    attachments = new ArrayList<>();
                    attachments.addAll(generateImages(cronJobConfig, cronJob.getCreateBy()));
                    attachments.addAll(generateExcels(cronJobConfig, user));
                }

                String[] cc = null, bcc = null;
                if (!StringUtils.isEmpty(cronJobConfig.getCc())) {
                    cc = cronJobConfig.getCc().split(";");
                }

                if (!StringUtils.isEmpty(cronJobConfig.getBcc())) {
                    bcc = cronJobConfig.getBcc().split(";");
                }

                mailUtils.sendTemplateAttachmentsEmail(
                        cronJobConfig.getSubject(),
                        cronJobConfig.getTo(),
                        cc,
                        bcc,
                        Constants.SCHEDULE_MAIL_TEMPLATE,
                        content,
                        attachments);
            }
        }
    }


    /**
     * 根据job配置截取图片
     *
     * @param cronJobConfig
     * @param userId
     * @return
     * @throws Exception
     */
    private List<File> generateImages(CronJobConfig cronJobConfig, Long userId) throws Exception {
        List<File> files = new ArrayList<>();
        for (CronJobContent cronJobContent : cronJobConfig.getContentList()) {
            String imageName = UUID.randomUUID() + ".png";
            String imageUrl = baseUrl + File.separator + imageName;
            String imagePath = fileBasePath + imageUrl;
            File file = new File(fileBasePath + baseUrl);
            if (!file.exists()) {
                file.mkdirs();
            }

            imagePath = imagePath.replaceAll(File.separator + "{2,}", File.separator);

            String url = getContentUrl(userId, cronJobContent.getContentType(), cronJobContent.getId());
            boolean bol = phantomRender(url, imagePath);
            if (bol) {
                File image = new File(imagePath);
                files.add(image);
            }
        }
        return files;
    }

    /**
     * phantom打开连接并截图
     *
     * @param url
     * @param imgPath
     * @return
     * @throws Exception
     */
    private boolean phantomRender(String url, String imgPath) throws Exception {
        boolean result = false;
        if (!StringUtils.isEmpty(phantomJsHome) && !StringUtils.isEmpty(phantomJsFile)) {
            String rendJsPath = URLDecoder.decode(phantomJsFile, "UTF-8");
            String cmd = buildCmd(phantomJsHome, rendJsPath, url, imgPath);
            log.info("phantom command : {}", cmd);
            Process process = Runtime.getRuntime().exec(cmd);
            InputStreamReader isr = new InputStreamReader(process.getInputStream());
            LineNumberReader input = new LineNumberReader(isr);
            String line = input.readLine();
            while (null != line) {
                log.info(line);
                line = input.readLine();
            }
            log.info("Finished command: {}", cmd);
            process.destroy();
            result = checkFileExists(imgPath);
        }
        return result;
    }

    /**
     * 生成运行命令
     *
     * @param args
     * @return
     */
    private String buildCmd(String... args) {
        StringBuilder sb = new StringBuilder();
        for (String exp : args) {
            sb.append(exp).append(" ");
        }
        return sb.toString().trim();
    }

    /**
     * 检查文件
     *
     * @param filePath
     * @return
     */
    private boolean checkFileExists(String filePath) {
        boolean result = false;
        Future<Boolean> future = (Future<Boolean>) executorService.submit(() -> {
            while (!imageExit && !new File(filePath).exists()) {
                Thread.sleep(1000);
            }
            return true;
        });

        try {
            result = future.get(10 * 60 * 1000, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }
        return result;
    }


    /**
     * 根据job配置生成excel ，多个excel压缩至zip包
     *
     * @param cronJobConfig
     * @return
     * @throws Exception
     */
    private List<File> generateExcels(CronJobConfig cronJobConfig, User user) throws Exception {
        List<File> files = new ArrayList<>();
        for (CronJobContent cronJobContent : cronJobConfig.getContentList()) {
            if (CheckEntityEnum.DASHBOARD.getSource().equalsIgnoreCase(cronJobContent.getContentType().trim())
                    || portal.equalsIgnoreCase(cronJobContent.getContentType().trim())) {
                Dashboard dashboard = dashboardMapper.getById(cronJobContent.getId());
                if (dashboard != null) {
                    ScriptEngine engine = getScriptEngine();
                    Map<Long, ViewExecuteParam> executeParamMap = new HashMap<>();
                    Set<WidgetWithRelationDashboardId> set = widgetMapper.getByDashboard(dashboard.getId());
                    Set<Widget> widgets = new HashSet<>();
                    if (null != set && set.size() > 0) {
                        set.forEach(w -> {
                            Widget widget = new Widget();
                            BeanUtils.copyProperties(w, widget);
                            widgets.add(widget);
                            executeParamMap.put(w.getId(), getViewExecuteParam((engine), dashboard.getConfig(), widget.getConfig(), w.getRelationId()));
                        });
                    }
                    if (widgets != null && widgets.size() > 0) {
                        String filePath = fileBasePath + baseUrl + File.separator + dashboard.getName() + "-" + UUID.randomUUID() + FileTypeEnum.XLSX.getFormat();

                        filePath = filePath.replaceAll(File.separator + "{2,}", File.separator);

                        File file = widgetService.writeExcel(widgets, executeParamMap, filePath, user, false);
                        files.add(file);
                    }
                }
            } else if (CheckEntityEnum.DISPLAY.getSource().equalsIgnoreCase(cronJobContent.getContentType().trim())) {
                Display display = displayMapper.getById(cronJobContent.getId());
                if (display != null) {
                    Set<Widget> widgets = widgetMapper.getByDisplayId(display.getId());
                    if (widgets != null && widgets.size() > 0) {
                        String filePath = fileBasePath + baseUrl + File.separator + display.getName() + "-" + UUID.randomUUID() + FileTypeEnum.XLSX.getFormat();
                        filePath = filePath.replaceAll(File.separator + "{2,}", File.separator);
                        File file = widgetService.writeExcel(widgets, null, filePath, user, false);
                        files.add(file);
                    }
                }
            }
        }

        //多个文件压缩至zip包
        if (null != files && files.size() > 1) {
            File zipFile = new File(fileBasePath + baseUrl + File.separator + UUID.randomUUID() + ".zip");
            FileUtils.zipFile(files, zipFile);
            files.clear();
            files.add(zipFile);
        }
        return files;
    }


    private static ScriptEngine getScriptEngine() throws Exception {
        ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
        ClassLoader classLoader = EmailScheduleServiceImpl.class.getClassLoader();
        engine.eval(new InputStreamReader(classLoader.getResourceAsStream(Constants.EXECUTE_PARAM_FORMAT_JS)));
        return engine;
    }

    public static void main(String[] args) throws Exception {
        ScriptEngine engine = getScriptEngine();
        String dashboardconfig = "{\"filters\":[{\"relatedViews\":{\"305\":{\"key\":\"to_day\",\"name\":\"to_day\",\"isVariable\":true,\"items\":[418]}},\"dateFormat\":\"YYYY-MM-DD\",\"key\":\"E233F4E4\",\"name\":\"日期\",\"type\":\"date\",\"width\":0,\"dynamicDefaultValue\":\"yesterday\",\"operator\":\"=\"},{\"relatedViews\":{\"305\":{\"key\":\"month_var\",\"name\":\"month_var\",\"isVariable\":true,\"items\":[418]}},\"dateFormat\":\"YYYY-MM\",\"key\":\"E553B0E1\",\"name\":\"月份\",\"type\":\"date\",\"width\":0,\"dynamicDefaultValue\":\"month\",\"operator\":\"=\"}]}\n";
        String widgetConfig = "{\"data\":[],\"cols\":[{\"name\":\"zone\",\"type\":\"category\",\"visualType\":\"string\",\"config\":true,\"field\":{\"alias\":\"大区\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"default\"},\"from\":\"cols\"},{\"name\":\"office_name\",\"type\":\"category\",\"visualType\":\"string\",\"config\":true,\"field\":{\"alias\":\"营业部\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"default\"},\"from\":\"cols\"}],\"rows\":[],\"metrics\":[{\"name\":\"apply_num@davinci@53CCAE42\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"申请#\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"default\"},\"from\":\"metrics\"},{\"name\":\"loan_amount@davinci@49327A7A\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"放款￥\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"numeric\",\"numeric\":{\"decimalPlaces\":2,\"unit\":\"无\",\"useThousandSeparator\":true}},\"from\":\"metrics\"},{\"name\":\"rn@davinci@D482A707\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"申请#\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"default\"},\"from\":\"metrics\"},{\"name\":\"loan_rn@davinci@1510D578\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"放款￥\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"numeric\",\"numeric\":{\"decimalPlaces\":2,\"unit\":\"无\",\"useThousandSeparator\":true}},\"from\":\"metrics\"},{\"name\":\"apply_num3@davinci@055D4BB6\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"申请#\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"default\"},\"from\":\"metrics\"},{\"name\":\"loan_amount3@davinci@B6C0C9EE\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"放款￥\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"numeric\",\"numeric\":{\"decimalPlaces\":2,\"unit\":\"无\",\"useThousandSeparator\":true}},\"from\":\"metrics\"},{\"name\":\"rn3@davinci@5E500819\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"申请#\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"default\"},\"from\":\"metrics\"},{\"name\":\"loan_rn3@davinci@C85FD31B\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"放款￥\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"numeric\",\"numeric\":{\"decimalPlaces\":2,\"unit\":\"无\",\"useThousandSeparator\":true}},\"from\":\"metrics\"},{\"name\":\"apply_num2@davinci@22F8B846\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"申请#\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"default\"},\"from\":\"metrics\"},{\"name\":\"loan_amount2@davinci@3DB9F888\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"放款￥\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"numeric\",\"numeric\":{\"decimalPlaces\":2,\"unit\":\"无\",\"useThousandSeparator\":true}},\"from\":\"metrics\"},{\"name\":\"rn2@davinci@8E13B2A9\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"申请#\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"default\"},\"from\":\"metrics\"},{\"name\":\"loan_rn2@davinci@631999CF\",\"type\":\"value\",\"visualType\":\"number\",\"agg\":\"sum\",\"config\":true,\"chart\":{\"id\":1,\"name\":\"table\",\"title\":\"表格\",\"icon\":\"icon-table\",\"coordinate\":\"other\",\"requireDimetions\":[0,9999],\"requireMetrics\":[0,9999],\"data\":{\"cols\":{\"title\":\"列\",\"type\":\"category\"},\"rows\":{\"title\":\"行\",\"type\":\"category\"},\"metrics\":{\"title\":\"指标\",\"type\":\"value\"},\"filters\":{\"title\":\"筛选\",\"type\":\"all\"}},\"style\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":true,\"withPaging\":true,\"pageSize\":\"20\",\"withNoAggregators\":false},\"spec\":{}}},\"field\":{\"alias\":\"放款￥\",\"useExpression\":false,\"desc\":\"\"},\"format\":{\"formatType\":\"numeric\",\"numeric\":{\"decimalPlaces\":2,\"unit\":\"无\",\"useThousandSeparator\":true}},\"from\":\"metrics\"}],\"filters\":[],\"chartStyles\":{\"table\":{\"fontFamily\":\"PingFang SC\",\"fontSize\":\"12\",\"color\":\"#666\",\"lineStyle\":\"solid\",\"lineColor\":\"#D9D9D9\",\"headerBackgroundColor\":\"#f7f7f7\",\"headerConfig\":[{\"key\":\"3KaVv\",\"headerName\":\"zone\",\"alias\":\"zone[大区]\",\"visualType\":\"string\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":null},{\"key\":\"9p5vw\",\"headerName\":\"office_name\",\"alias\":\"office_name[营业部]\",\"visualType\":\"string\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":null},{\"key\":\"rYXOZ\",\"headerName\":\"整体\",\"alias\":null,\"visualType\":null,\"isGroup\":true,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":[{\"key\":\"eBM1m\",\"headerName\":\"今天\",\"alias\":null,\"visualType\":null,\"isGroup\":true,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":[{\"key\":\"mQ0Kq\",\"headerName\":\"apply_num@davinci@53CCAE42\",\"alias\":\"[总计]apply_num[申请#]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null},{\"key\":\"7cx1E\",\"headerName\":\"loan_amount@davinci@49327A7A\",\"alias\":\"[总计]loan_amount[放款￥]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null}]},{\"key\":\"la6vG\",\"headerName\":\"MTD截止今日\",\"alias\":null,\"visualType\":null,\"isGroup\":true,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":[{\"key\":\"oHMAP\",\"headerName\":\"rn@davinci@D482A707\",\"alias\":\"[总计]rn[申请#]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null},{\"key\":\"DACEp\",\"headerName\":\"loan_rn@davinci@1510D578\",\"alias\":\"[总计]loan_rn[放款￥]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null}]}]},{\"key\":\"3JxxQ\",\"headerName\":\"三期\",\"alias\":null,\"visualType\":null,\"isGroup\":true,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":[{\"key\":\"Vnhga\",\"headerName\":\"今日\",\"alias\":null,\"visualType\":null,\"isGroup\":true,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":[{\"key\":\"UNxB3\",\"headerName\":\"apply_num3@davinci@055D4BB6\",\"alias\":\"[总计]apply_num3[申请#]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null},{\"key\":\"PRfZj\",\"headerName\":\"loan_amount3@davinci@B6C0C9EE\",\"alias\":\"[总计]loan_amount3[放款￥]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null}]},{\"key\":\"cH9kp\",\"headerName\":\"MTD截止今日\",\"alias\":null,\"visualType\":null,\"isGroup\":true,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":[{\"key\":\"gV0lw\",\"headerName\":\"rn3@davinci@5E500819\",\"alias\":\"[总计]rn3[申请#]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null},{\"key\":\"lBrdz\",\"headerName\":\"loan_rn3@davinci@C85FD31B\",\"alias\":\"[总计]loan_rn3[放款￥]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null}]}]},{\"key\":\"6GqSo\",\"headerName\":\"分期\",\"alias\":null,\"visualType\":null,\"isGroup\":true,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":[{\"key\":\"KqpLM\",\"headerName\":\"今日\",\"alias\":null,\"visualType\":null,\"isGroup\":true,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":[{\"key\":\"BhJu5\",\"headerName\":\"apply_num2@davinci@22F8B846\",\"alias\":\"[总计]apply_num2[申请#]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null},{\"key\":\"PyZZy\",\"headerName\":\"loan_amount2@davinci@3DB9F888\",\"alias\":\"[总计]loan_amount2[放款￥]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null}]},{\"key\":\"g1NUZ\",\"headerName\":\"MTD截止今日\",\"alias\":null,\"visualType\":null,\"isGroup\":true,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"center\"},\"children\":[{\"key\":\"wAu5d\",\"headerName\":\"rn2@davinci@8E13B2A9\",\"alias\":\"[总计]rn2[申请#]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null},{\"key\":\"lv4d8\",\"headerName\":\"loan_rn2@davinci@631999CF\",\"alias\":\"[总计]loan_rn2[放款￥]\",\"visualType\":\"number\",\"isGroup\":false,\"style\":{\"fontSize\":\"12\",\"fontFamily\":\"PingFang SC\",\"fontWeight\":\"normal\",\"fontColor\":\"#666\",\"fontStyle\":\"normal\",\"backgroundColor\":\"#f7f7f7\",\"justifyContent\":\"flex-start\"},\"children\":null}]}]}],\"columnsConfig\":[],\"leftFixedColumns\":[],\"rightFixedColumns\":[],\"headerFixed\":true,\"autoMergeCell\":false,\"withPaging\":false,\"pageSize\":\"20\",\"withNoAggregators\":true},\"spec\":{}},\"selectedChart\":1,\"pagination\":{\"pageNo\":0,\"pageSize\":0,\"withPaging\":false,\"totalCount\":0},\"renderType\":\"clear\",\"orders\":[],\"mode\":\"chart\",\"model\":{\"zone\":{\"sqlType\":\"VARCHAR\",\"visualType\":\"string\",\"modelType\":\"category\"},\"office_name\":{\"sqlType\":\"VARCHAR\",\"visualType\":\"string\",\"modelType\":\"category\"},\"apply_num\":{\"sqlType\":\"BIGINT\",\"visualType\":\"number\",\"modelType\":\"value\"},\"loan_amount\":{\"sqlType\":\"DOUBLE\",\"visualType\":\"number\",\"modelType\":\"value\"},\"rn\":{\"sqlType\":\"BIGINT\",\"visualType\":\"number\",\"modelType\":\"value\"},\"loan_rn\":{\"sqlType\":\"DOUBLE\",\"visualType\":\"number\",\"modelType\":\"value\"},\"apply_num3\":{\"sqlType\":\"BIGINT\",\"visualType\":\"number\",\"modelType\":\"value\"},\"loan_amount3\":{\"sqlType\":\"DOUBLE\",\"visualType\":\"number\",\"modelType\":\"value\"},\"rn3\":{\"sqlType\":\"BIGINT\",\"visualType\":\"number\",\"modelType\":\"value\"},\"loan_rn3\":{\"sqlType\":\"DOUBLE\",\"visualType\":\"number\",\"modelType\":\"value\"},\"apply_num2\":{\"sqlType\":\"BIGINT\",\"visualType\":\"number\",\"modelType\":\"value\"},\"loan_amount2\":{\"sqlType\":\"DOUBLE\",\"visualType\":\"number\",\"modelType\":\"value\"},\"rn2\":{\"sqlType\":\"BIGINT\",\"visualType\":\"number\",\"modelType\":\"value\"},\"loan_rn2\":{\"sqlType\":\"DOUBLE\",\"visualType\":\"number\",\"modelType\":\"value\"},\"n\":{\"sqlType\":\"VARCHAR\",\"visualType\":\"string\",\"modelType\":\"value\"}},\"controls\":[],\"computed\":[],\"cache\":false,\"expired\":300}\n";
        ViewExecuteParam viewExecuteParam = getViewExecuteParam(engine, dashboardconfig, widgetConfig, 418L);

        System.out.println(JSONObject.toJSONString(viewExecuteParam));
    }

    private static ViewExecuteParam getViewExecuteParam(ScriptEngine engine, String dashboardConfig, String widgetConfig, Long releationId) {
        try {
            Invocable invocable = (Invocable) engine;
            Object obj = invocable.invokeFunction("getDashboardItemExecuteParam", dashboardConfig, widgetConfig, releationId);

            if (obj instanceof ScriptObjectMirror) {
                ScriptObjectMirror vsom = (ScriptObjectMirror) obj;
                List<String> groups = new ArrayList<>();
                List<Aggregator> aggregators = new ArrayList<>();
                List<Order> orders = new ArrayList<>();
                List<String> filters = new ArrayList<>();
                Boolean cache = false;
                Boolean nativeQuery = false;

                Long expired = 0L;
                List<Param> params = new ArrayList<>();
                for (String key : vsom.keySet()) {
                    switch (key) {
                        case "groups":
                            ScriptObjectMirror groupMirror = (ScriptObjectMirror) vsom.get(key);
                            if (groupMirror.isArray()) {
                                Collection<Object> values = groupMirror.values();
                                values.forEach(v -> groups.add(String.valueOf(v)));
                            }
                            break;
                        case "aggregators":
                            ScriptObjectMirror aggregatorsMirror = (ScriptObjectMirror) vsom.get(key);
                            if (aggregatorsMirror.isArray()) {
                                Collection<Object> values = aggregatorsMirror.values();
                                values.forEach(v -> {
                                    ScriptObjectMirror agg = (ScriptObjectMirror) v;
                                    Aggregator aggregator = new Aggregator(String.valueOf(agg.get("column")), String.valueOf(agg.get("func")));
                                    aggregators.add(aggregator);
                                });
                            }
                            break;
                        case "orders":
                            ScriptObjectMirror ordersMirror = (ScriptObjectMirror) vsom.get(key);
                            if (ordersMirror.isArray()) {
                                Collection<Object> values = ordersMirror.values();
                                values.forEach(v -> {
                                    ScriptObjectMirror agg = (ScriptObjectMirror) v;
                                    Order order = new Order(String.valueOf(agg.get("column")), String.valueOf(agg.get("direction")));
                                    orders.add(order);
                                });
                            }
                            break;
                        case "filters":
                            ScriptObjectMirror filterMirror = (ScriptObjectMirror) vsom.get(key);
                            if (filterMirror.isArray()) {
                                Collection<Object> values = filterMirror.values();
                                values.forEach(v -> filters.add(String.valueOf(v)));
                            }
                            break;
                        case "cache":
                            cache = (Boolean) vsom.get(key);
                            break;
                        case "expired":
                            expired = Long.parseLong(String.valueOf(vsom.get(key)));
                            break;
                        case "params":
                            ScriptObjectMirror paramsMirror = (ScriptObjectMirror) vsom.get(key);
                            if (paramsMirror.isArray()) {
                                Collection<Object> values = paramsMirror.values();
                                values.forEach(v -> {
                                    ScriptObjectMirror agg = (ScriptObjectMirror) v;
                                    Param param = new Param(String.valueOf(agg.get("name")), String.valueOf(agg.get("value")));
                                    params.add(param);
                                });
                            }
                            break;
                        case "nativeQuery":
                            nativeQuery = (Boolean) vsom.get(key);
                            break;
                    }
                }

                return new ViewExecuteParam(groups, aggregators, orders, filters, params, cache, expired, nativeQuery);
            }

        } catch (ScriptException e) {
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
        return null;
    }

}

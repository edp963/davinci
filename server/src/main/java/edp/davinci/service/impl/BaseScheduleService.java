package edp.davinci.service.impl;

import edp.core.utils.CollectionUtils;
import edp.core.utils.DateUtils;
import edp.core.utils.ServerUtils;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.dao.DashboardMapper;
import edp.davinci.dao.DisplaySlideMapper;
import edp.davinci.dto.cronJobDto.CronJobConfig;
import edp.davinci.dto.cronJobDto.CronJobContent;
import edp.davinci.dto.dashboardDto.DashboardTree;
import edp.davinci.model.Dashboard;
import edp.davinci.model.DisplaySlide;
import edp.davinci.service.ShareService;
import edp.davinci.service.screenshot.ImageContent;
import edp.davinci.service.screenshot.ScreenshotUtil;
import edp.davinci.service.share.ShareDataPermission;
import edp.davinci.service.share.ShareFactor;
import edp.davinci.service.share.ShareMode;
import edp.davinci.service.share.ShareType;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.AT_SYMBOL;

public class BaseScheduleService {

    @Autowired
    private String TOKEN_SECRET;

    @Autowired
    protected DashboardMapper dashboardMapper;

    @Autowired
    protected ScreenshotUtil screenshotUtil;

    @Autowired
    protected DisplaySlideMapper displaySlideMapper;

    @Autowired
    private ShareService shareService;

    @Autowired
    private ServerUtils serverUtils;

    protected static final Logger scheduleLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SCHEDULE.getName());

    protected static final String PORTAL = "PORTAL";

    protected static final String DISPLAY = "DISPLAY";

    protected static final String DASHBOARD = "DASHBOARD";

    protected static final String WIDGET = "WIDGET";

    /**
     * 根据job配置截取图片
     *
     * @param jobId
     * @param cronJobConfig
     * @param userId
     * @return
     * @throws Exception
     */
    public List<ImageContent> generateImages(long jobId, CronJobConfig cronJobConfig, Long userId) throws Exception {

        scheduleLogger.info("CronJob({}) fetching images contents", jobId);

        List<ImageContent> imageContents = new ArrayList<>();

        Map<String, Integer> vizOrderMap = new HashMap<>();
        Map<Long, Map<Long, Integer>> displayPageMap = new HashMap<>();

        List<CronJobContent> jobContentList = getCronJobContents(cronJobConfig, vizOrderMap, displayPageMap);

        if (CollectionUtils.isEmpty(jobContentList)) {
            scheduleLogger.warn("CronJob({}) share entity is empty", jobId);
            return null;
        }

        for (CronJobContent cronJobContent : jobContentList) {
            int order = 0;
            if (cronJobContent.getContentType().equalsIgnoreCase(DISPLAY)) {
                if (vizOrderMap.containsKey(DISPLAY + AT_SYMBOL + cronJobContent.getId())) {
                    order = vizOrderMap.get(DISPLAY + AT_SYMBOL + cronJobContent.getId());
                }

                if (!CollectionUtils.isEmpty(displayPageMap)) {
                    Map<Long, Integer> slidePageMap = displayPageMap.get(cronJobContent.getId());
                    if (CollectionUtils.isEmpty(cronJobContent.getItems())) {
                        int finalOrder = order;
                        slidePageMap.forEach((slide, page) -> {
                            String url = getContentUrl(userId, cronJobContent.getContentType(), cronJobContent.getId(), page);
                            imageContents.add(new ImageContent(finalOrder + page, cronJobContent.getId(), cronJobContent.getContentType(), url));
                        });
                    } else {
                        for (Long slideId : cronJobContent.getItems()) {
                            if (slidePageMap.containsKey(slideId)) {
                                int page = slidePageMap.get(slideId);
                                String url = getContentUrl(userId, cronJobContent.getContentType(), cronJobContent.getId(), page);
                                imageContents.add(new ImageContent(order + page, cronJobContent.getId(), cronJobContent.getContentType(), url));
                            }
                        }
                    }
                }
            } else {
                if (vizOrderMap.containsKey(DASHBOARD + AT_SYMBOL + cronJobContent.getId())) {
                    order = vizOrderMap.get(DASHBOARD + AT_SYMBOL + cronJobContent.getId());
                }
                String url = getContentUrl(userId, cronJobContent.getContentType(), cronJobContent.getId(), -1);
                imageContents.add(new ImageContent(order, cronJobContent.getId(), cronJobContent.getContentType(), url));
            }
        }

        if (!CollectionUtils.isEmpty(imageContents)) {
            screenshotUtil.screenshot(jobId, imageContents, cronJobConfig.getImageWidth());
        }

        scheduleLogger.info("CronJob({}) fetched images contents, count:{}", jobId, imageContents.size());
        return imageContents;
    }

    protected List<CronJobContent> getCronJobContents(CronJobConfig cronJobConfig, Map<String, Integer> orderMap,
                                                    Map<Long, Map<Long, Integer>> displayPageMap) {
        List<CronJobContent> jobContentList = new ArrayList<>();
        Map<String, Integer> orderWeightMap = new HashMap<>();
        Set<Long> dashboardIds = new HashSet<>();
        Set<Long> checkedPortalIds = new HashSet<>();
        Set<Long> refPortalIds = new HashSet<>();
        Set<Long> checkedDisplayIds = new HashSet<>();

        for (int i = 0; i < cronJobConfig.getContentList().size(); i++) {
            int orderWeight = i * 1000;
            CronJobContent cronJobContent = cronJobConfig.getContentList().get(i);
            if (cronJobContent.getContentType().equalsIgnoreCase(DISPLAY)) {
                checkedDisplayIds.add(cronJobContent.getId());
                orderWeightMap.put(DISPLAY + AT_SYMBOL + cronJobContent.getId(), orderWeight);
                jobContentList.add(cronJobContent);
                orderMap.put(DISPLAY + AT_SYMBOL + cronJobContent.getId(), orderWeight);
            } else {
                orderWeightMap.put(PORTAL + AT_SYMBOL + cronJobContent.getId(), orderWeight);
                if (CollectionUtils.isEmpty(cronJobContent.getItems())) {
                    checkedPortalIds.add(cronJobContent.getId());
                } else {
                    List<Long> items = cronJobContent.getItems();
                    dashboardIds.addAll(items);
                }
            }
        }

        // dashboard
        Set<Dashboard> dashboards = new HashSet<>();
        if (!CollectionUtils.isEmpty(dashboardIds)) {
            Set<Dashboard> checkDashboards = dashboardMapper.queryDashboardsByIds(dashboardIds);
            if (!CollectionUtils.isEmpty(checkDashboards)) {
                dashboards.addAll(checkDashboards);
            }
        }

        if (!CollectionUtils.isEmpty(checkedPortalIds)) {
            Set<Dashboard> checkoutPortalDashboards = dashboardMapper.queryByPortals(checkedPortalIds);
            if (!CollectionUtils.isEmpty(checkoutPortalDashboards)) {
                dashboards.addAll(checkoutPortalDashboards);
            }
        }

        if (!CollectionUtils.isEmpty(dashboards)) {
            for (Dashboard dashboard : dashboards) {
                if (dashboard != null && dashboard.getType() == 1) {
                    jobContentList.add(new CronJobContent(DASHBOARD, dashboard.getId()));
                    refPortalIds.add(dashboard.getDashboardPortalId());
                }
            }
        }

        if (!CollectionUtils.isEmpty(refPortalIds)) {
            Set<Dashboard> refPortalAllDashboards = dashboardMapper.queryByPortals(refPortalIds);
            Map<Long, List<Dashboard>> portalDashboardsMap = refPortalAllDashboards.stream().collect(Collectors.groupingBy(Dashboard::getDashboardPortalId));
            portalDashboardsMap.forEach((pId, ds) -> {
                DashboardTree tree = new DashboardTree(pId, 0);
                buildDashboardTree(tree, ds);
                List<DashboardTree> list = tree.traversalLeaf();
                if (!CollectionUtils.isEmpty(list)) {
                    for (int i = 0; i < list.size(); i++) {
                        DashboardTree node = list.get(i);
                        if (!orderMap.containsKey(DASHBOARD + AT_SYMBOL + node.getId())) {
                            orderMap.put(DASHBOARD + AT_SYMBOL + node.getId(), i + orderWeightMap.get(PORTAL + AT_SYMBOL + pId));
                        }
                    }
                }
            });
        }

        //display
        List<DisplaySlide> displaySlides = displaySlideMapper.queryByDisplayIds(checkedDisplayIds);
        if (!CollectionUtils.isEmpty(displaySlides)) {
            Map<Long, List<DisplaySlide>> displaySlidesMap = displaySlides.stream().collect(Collectors.groupingBy(DisplaySlide::getDisplayId));
            displaySlidesMap.forEach((displayId, slides) -> {
                Map<Long, Integer> slidePageMap = new HashMap<>();
                slides.sort(Comparator.comparing(DisplaySlide::getIndex));
                for (int i = 0; i < slides.size(); i++) {
                    slidePageMap.put(slides.get(i).getId(), i + 1);
                }
                displayPageMap.put(displayId, slidePageMap);
            });
        }
        return jobContentList;
    }

    private void buildDashboardTree(DashboardTree root, List<Dashboard> dashboards) {
        if (CollectionUtils.isEmpty(dashboards)) {
            return;
        }
        Map<Long, Set<Dashboard>> dashboardsMap = new HashMap<>();
        List<DashboardTree> rootChildren = new ArrayList<>();
        for (Dashboard dashboard : dashboards) {
            if (dashboard.getParentId() > 0L && !dashboard.getParentId().equals(dashboard.getId())) {
                Set<Dashboard> set;
                if (dashboardsMap.containsKey(dashboard.getParentId())) {
                    set = dashboardsMap.get(dashboard.getParentId());
                } else {
                    set = new HashSet<>();
                }
                set.add(dashboard);
                dashboardsMap.put(dashboard.getParentId(), set);
            } else {
                rootChildren.add(new DashboardTree(dashboard.getId(), dashboard.getIndex()));
            }
        }

        rootChildren.sort(Comparator.comparing(DashboardTree::getIndex));
        root.setChilds(rootChildren);

        for (DashboardTree child : rootChildren) {
            child.setChilds(getChildren(dashboardsMap, child));
        }
    }

    private List<DashboardTree> getChildren(Map<Long, Set<Dashboard>> dashboardsMap, DashboardTree node) {
        if (CollectionUtils.isEmpty(dashboardsMap)) {
            return null;
        }
        Set<Dashboard> children = dashboardsMap.get(node.getId());
        if (CollectionUtils.isEmpty(children)) {
            return null;
        }
        List<DashboardTree> list = new ArrayList<>();
        for (Dashboard dashboard : children) {
            DashboardTree treeNode = new DashboardTree(dashboard.getId(), dashboard.getIndex());
            treeNode.setChilds(getChildren(dashboardsMap, treeNode));
            list.add(treeNode);
        }
        list.sort(Comparator.comparing(DashboardTree::getIndex));
        return list;
    }

    private String getContentUrl(Long userId, String contentType, Long contentId, int index) {

        ShareFactor shareFactor = ShareFactor.Builder
                .shareFactor()
                .withMode(ShareMode.NORMAL)
                .withEntityId(contentId)
                .withSharerId(userId)
                .withExpired(DateUtils.add(DateUtils.currentDate(), Calendar.DATE, 1))
                .withPermission(ShareDataPermission.SHARER)
                .build();

        String page = null;
        switch (contentType.toUpperCase()) {
            case WIDGET:
                shareFactor.setType(ShareType.WIDGET);
                break;
            case DISPLAY:
                shareFactor.setType(ShareType.DISPLAY);
                page = "&p=" + index;
                break;
            default:
                shareFactor.setType(ShareType.DASHBOARD);
                break;
        }

        String shareToken = shareFactor.toShareResult(TOKEN_SECRET).getToken();
        StringBuilder sb = new StringBuilder();
        sb.append(serverUtils.getLocalHost())
                .append("/share.html")
                .append("?shareToken=")
                .append(shareToken);
        sb.append(StringUtils.isEmpty(page) ? "" : page);
        sb.append("#/share/").append(WIDGET.equalsIgnoreCase(contentType) || PORTAL.equalsIgnoreCase(contentType) ? DASHBOARD.toLowerCase() : contentType);
        return sb.toString();
    }
}

package edp.davinci.core.dao.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class RelRoleProjectExample {
    protected String orderByClause;

    protected boolean distinct;

    protected List<Criteria> oredCriteria;

    public RelRoleProjectExample() {
        oredCriteria = new ArrayList<Criteria>();
    }

    public void setOrderByClause(String orderByClause) {
        this.orderByClause = orderByClause;
    }

    public String getOrderByClause() {
        return orderByClause;
    }

    public void setDistinct(boolean distinct) {
        this.distinct = distinct;
    }

    public boolean isDistinct() {
        return distinct;
    }

    public List<Criteria> getOredCriteria() {
        return oredCriteria;
    }

    public void or(Criteria criteria) {
        oredCriteria.add(criteria);
    }

    public Criteria or() {
        Criteria criteria = createCriteriaInternal();
        oredCriteria.add(criteria);
        return criteria;
    }

    public Criteria createCriteria() {
        Criteria criteria = createCriteriaInternal();
        if (oredCriteria.size() == 0) {
            oredCriteria.add(criteria);
        }
        return criteria;
    }

    protected Criteria createCriteriaInternal() {
        Criteria criteria = new Criteria();
        return criteria;
    }

    public void clear() {
        oredCriteria.clear();
        orderByClause = null;
        distinct = false;
    }

    protected abstract static class GeneratedCriteria {
        protected List<Criterion> criteria;

        protected GeneratedCriteria() {
            super();
            criteria = new ArrayList<Criterion>();
        }

        public boolean isValid() {
            return criteria.size() > 0;
        }

        public List<Criterion> getAllCriteria() {
            return criteria;
        }

        public List<Criterion> getCriteria() {
            return criteria;
        }

        protected void addCriterion(String condition) {
            if (condition == null) {
                throw new RuntimeException("Value for condition cannot be null");
            }
            criteria.add(new Criterion(condition));
        }

        protected void addCriterion(String condition, Object value, String property) {
            if (value == null) {
                throw new RuntimeException("Value for " + property + " cannot be null");
            }
            criteria.add(new Criterion(condition, value));
        }

        protected void addCriterion(String condition, Object value1, Object value2, String property) {
            if (value1 == null || value2 == null) {
                throw new RuntimeException("Between values for " + property + " cannot be null");
            }
            criteria.add(new Criterion(condition, value1, value2));
        }

        public Criteria andIdIsNull() {
            addCriterion("id is null");
            return (Criteria) this;
        }

        public Criteria andIdIsNotNull() {
            addCriterion("id is not null");
            return (Criteria) this;
        }

        public Criteria andIdEqualTo(Long value) {
            addCriterion("id =", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdNotEqualTo(Long value) {
            addCriterion("id <>", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdGreaterThan(Long value) {
            addCriterion("id >", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdGreaterThanOrEqualTo(Long value) {
            addCriterion("id >=", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdLessThan(Long value) {
            addCriterion("id <", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdLessThanOrEqualTo(Long value) {
            addCriterion("id <=", value, "id");
            return (Criteria) this;
        }

        public Criteria andIdIn(List<Long> values) {
            addCriterion("id in", values, "id");
            return (Criteria) this;
        }

        public Criteria andIdNotIn(List<Long> values) {
            addCriterion("id not in", values, "id");
            return (Criteria) this;
        }

        public Criteria andIdBetween(Long value1, Long value2) {
            addCriterion("id between", value1, value2, "id");
            return (Criteria) this;
        }

        public Criteria andIdNotBetween(Long value1, Long value2) {
            addCriterion("id not between", value1, value2, "id");
            return (Criteria) this;
        }

        public Criteria andProjectIdIsNull() {
            addCriterion("project_id is null");
            return (Criteria) this;
        }

        public Criteria andProjectIdIsNotNull() {
            addCriterion("project_id is not null");
            return (Criteria) this;
        }

        public Criteria andProjectIdEqualTo(Long value) {
            addCriterion("project_id =", value, "projectId");
            return (Criteria) this;
        }

        public Criteria andProjectIdNotEqualTo(Long value) {
            addCriterion("project_id <>", value, "projectId");
            return (Criteria) this;
        }

        public Criteria andProjectIdGreaterThan(Long value) {
            addCriterion("project_id >", value, "projectId");
            return (Criteria) this;
        }

        public Criteria andProjectIdGreaterThanOrEqualTo(Long value) {
            addCriterion("project_id >=", value, "projectId");
            return (Criteria) this;
        }

        public Criteria andProjectIdLessThan(Long value) {
            addCriterion("project_id <", value, "projectId");
            return (Criteria) this;
        }

        public Criteria andProjectIdLessThanOrEqualTo(Long value) {
            addCriterion("project_id <=", value, "projectId");
            return (Criteria) this;
        }

        public Criteria andProjectIdIn(List<Long> values) {
            addCriterion("project_id in", values, "projectId");
            return (Criteria) this;
        }

        public Criteria andProjectIdNotIn(List<Long> values) {
            addCriterion("project_id not in", values, "projectId");
            return (Criteria) this;
        }

        public Criteria andProjectIdBetween(Long value1, Long value2) {
            addCriterion("project_id between", value1, value2, "projectId");
            return (Criteria) this;
        }

        public Criteria andProjectIdNotBetween(Long value1, Long value2) {
            addCriterion("project_id not between", value1, value2, "projectId");
            return (Criteria) this;
        }

        public Criteria andRoleIdIsNull() {
            addCriterion("role_id is null");
            return (Criteria) this;
        }

        public Criteria andRoleIdIsNotNull() {
            addCriterion("role_id is not null");
            return (Criteria) this;
        }

        public Criteria andRoleIdEqualTo(Long value) {
            addCriterion("role_id =", value, "roleId");
            return (Criteria) this;
        }

        public Criteria andRoleIdNotEqualTo(Long value) {
            addCriterion("role_id <>", value, "roleId");
            return (Criteria) this;
        }

        public Criteria andRoleIdGreaterThan(Long value) {
            addCriterion("role_id >", value, "roleId");
            return (Criteria) this;
        }

        public Criteria andRoleIdGreaterThanOrEqualTo(Long value) {
            addCriterion("role_id >=", value, "roleId");
            return (Criteria) this;
        }

        public Criteria andRoleIdLessThan(Long value) {
            addCriterion("role_id <", value, "roleId");
            return (Criteria) this;
        }

        public Criteria andRoleIdLessThanOrEqualTo(Long value) {
            addCriterion("role_id <=", value, "roleId");
            return (Criteria) this;
        }

        public Criteria andRoleIdIn(List<Long> values) {
            addCriterion("role_id in", values, "roleId");
            return (Criteria) this;
        }

        public Criteria andRoleIdNotIn(List<Long> values) {
            addCriterion("role_id not in", values, "roleId");
            return (Criteria) this;
        }

        public Criteria andRoleIdBetween(Long value1, Long value2) {
            addCriterion("role_id between", value1, value2, "roleId");
            return (Criteria) this;
        }

        public Criteria andRoleIdNotBetween(Long value1, Long value2) {
            addCriterion("role_id not between", value1, value2, "roleId");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionIsNull() {
            addCriterion("source_permission is null");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionIsNotNull() {
            addCriterion("source_permission is not null");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionEqualTo(Short value) {
            addCriterion("source_permission =", value, "sourcePermission");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionNotEqualTo(Short value) {
            addCriterion("source_permission <>", value, "sourcePermission");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionGreaterThan(Short value) {
            addCriterion("source_permission >", value, "sourcePermission");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionGreaterThanOrEqualTo(Short value) {
            addCriterion("source_permission >=", value, "sourcePermission");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionLessThan(Short value) {
            addCriterion("source_permission <", value, "sourcePermission");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionLessThanOrEqualTo(Short value) {
            addCriterion("source_permission <=", value, "sourcePermission");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionIn(List<Short> values) {
            addCriterion("source_permission in", values, "sourcePermission");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionNotIn(List<Short> values) {
            addCriterion("source_permission not in", values, "sourcePermission");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionBetween(Short value1, Short value2) {
            addCriterion("source_permission between", value1, value2, "sourcePermission");
            return (Criteria) this;
        }

        public Criteria andSourcePermissionNotBetween(Short value1, Short value2) {
            addCriterion("source_permission not between", value1, value2, "sourcePermission");
            return (Criteria) this;
        }

        public Criteria andViewPermissionIsNull() {
            addCriterion("view_permission is null");
            return (Criteria) this;
        }

        public Criteria andViewPermissionIsNotNull() {
            addCriterion("view_permission is not null");
            return (Criteria) this;
        }

        public Criteria andViewPermissionEqualTo(Short value) {
            addCriterion("view_permission =", value, "viewPermission");
            return (Criteria) this;
        }

        public Criteria andViewPermissionNotEqualTo(Short value) {
            addCriterion("view_permission <>", value, "viewPermission");
            return (Criteria) this;
        }

        public Criteria andViewPermissionGreaterThan(Short value) {
            addCriterion("view_permission >", value, "viewPermission");
            return (Criteria) this;
        }

        public Criteria andViewPermissionGreaterThanOrEqualTo(Short value) {
            addCriterion("view_permission >=", value, "viewPermission");
            return (Criteria) this;
        }

        public Criteria andViewPermissionLessThan(Short value) {
            addCriterion("view_permission <", value, "viewPermission");
            return (Criteria) this;
        }

        public Criteria andViewPermissionLessThanOrEqualTo(Short value) {
            addCriterion("view_permission <=", value, "viewPermission");
            return (Criteria) this;
        }

        public Criteria andViewPermissionIn(List<Short> values) {
            addCriterion("view_permission in", values, "viewPermission");
            return (Criteria) this;
        }

        public Criteria andViewPermissionNotIn(List<Short> values) {
            addCriterion("view_permission not in", values, "viewPermission");
            return (Criteria) this;
        }

        public Criteria andViewPermissionBetween(Short value1, Short value2) {
            addCriterion("view_permission between", value1, value2, "viewPermission");
            return (Criteria) this;
        }

        public Criteria andViewPermissionNotBetween(Short value1, Short value2) {
            addCriterion("view_permission not between", value1, value2, "viewPermission");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionIsNull() {
            addCriterion("widget_permission is null");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionIsNotNull() {
            addCriterion("widget_permission is not null");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionEqualTo(Short value) {
            addCriterion("widget_permission =", value, "widgetPermission");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionNotEqualTo(Short value) {
            addCriterion("widget_permission <>", value, "widgetPermission");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionGreaterThan(Short value) {
            addCriterion("widget_permission >", value, "widgetPermission");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionGreaterThanOrEqualTo(Short value) {
            addCriterion("widget_permission >=", value, "widgetPermission");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionLessThan(Short value) {
            addCriterion("widget_permission <", value, "widgetPermission");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionLessThanOrEqualTo(Short value) {
            addCriterion("widget_permission <=", value, "widgetPermission");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionIn(List<Short> values) {
            addCriterion("widget_permission in", values, "widgetPermission");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionNotIn(List<Short> values) {
            addCriterion("widget_permission not in", values, "widgetPermission");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionBetween(Short value1, Short value2) {
            addCriterion("widget_permission between", value1, value2, "widgetPermission");
            return (Criteria) this;
        }

        public Criteria andWidgetPermissionNotBetween(Short value1, Short value2) {
            addCriterion("widget_permission not between", value1, value2, "widgetPermission");
            return (Criteria) this;
        }

        public Criteria andVizPermissionIsNull() {
            addCriterion("viz_permission is null");
            return (Criteria) this;
        }

        public Criteria andVizPermissionIsNotNull() {
            addCriterion("viz_permission is not null");
            return (Criteria) this;
        }

        public Criteria andVizPermissionEqualTo(Short value) {
            addCriterion("viz_permission =", value, "vizPermission");
            return (Criteria) this;
        }

        public Criteria andVizPermissionNotEqualTo(Short value) {
            addCriterion("viz_permission <>", value, "vizPermission");
            return (Criteria) this;
        }

        public Criteria andVizPermissionGreaterThan(Short value) {
            addCriterion("viz_permission >", value, "vizPermission");
            return (Criteria) this;
        }

        public Criteria andVizPermissionGreaterThanOrEqualTo(Short value) {
            addCriterion("viz_permission >=", value, "vizPermission");
            return (Criteria) this;
        }

        public Criteria andVizPermissionLessThan(Short value) {
            addCriterion("viz_permission <", value, "vizPermission");
            return (Criteria) this;
        }

        public Criteria andVizPermissionLessThanOrEqualTo(Short value) {
            addCriterion("viz_permission <=", value, "vizPermission");
            return (Criteria) this;
        }

        public Criteria andVizPermissionIn(List<Short> values) {
            addCriterion("viz_permission in", values, "vizPermission");
            return (Criteria) this;
        }

        public Criteria andVizPermissionNotIn(List<Short> values) {
            addCriterion("viz_permission not in", values, "vizPermission");
            return (Criteria) this;
        }

        public Criteria andVizPermissionBetween(Short value1, Short value2) {
            addCriterion("viz_permission between", value1, value2, "vizPermission");
            return (Criteria) this;
        }

        public Criteria andVizPermissionNotBetween(Short value1, Short value2) {
            addCriterion("viz_permission not between", value1, value2, "vizPermission");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionIsNull() {
            addCriterion("schedule_permission is null");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionIsNotNull() {
            addCriterion("schedule_permission is not null");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionEqualTo(Short value) {
            addCriterion("schedule_permission =", value, "schedulePermission");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionNotEqualTo(Short value) {
            addCriterion("schedule_permission <>", value, "schedulePermission");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionGreaterThan(Short value) {
            addCriterion("schedule_permission >", value, "schedulePermission");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionGreaterThanOrEqualTo(Short value) {
            addCriterion("schedule_permission >=", value, "schedulePermission");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionLessThan(Short value) {
            addCriterion("schedule_permission <", value, "schedulePermission");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionLessThanOrEqualTo(Short value) {
            addCriterion("schedule_permission <=", value, "schedulePermission");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionIn(List<Short> values) {
            addCriterion("schedule_permission in", values, "schedulePermission");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionNotIn(List<Short> values) {
            addCriterion("schedule_permission not in", values, "schedulePermission");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionBetween(Short value1, Short value2) {
            addCriterion("schedule_permission between", value1, value2, "schedulePermission");
            return (Criteria) this;
        }

        public Criteria andSchedulePermissionNotBetween(Short value1, Short value2) {
            addCriterion("schedule_permission not between", value1, value2, "schedulePermission");
            return (Criteria) this;
        }

        public Criteria andSharePermissionIsNull() {
            addCriterion("share_permission is null");
            return (Criteria) this;
        }

        public Criteria andSharePermissionIsNotNull() {
            addCriterion("share_permission is not null");
            return (Criteria) this;
        }

        public Criteria andSharePermissionEqualTo(Boolean value) {
            addCriterion("share_permission =", value, "sharePermission");
            return (Criteria) this;
        }

        public Criteria andSharePermissionNotEqualTo(Boolean value) {
            addCriterion("share_permission <>", value, "sharePermission");
            return (Criteria) this;
        }

        public Criteria andSharePermissionGreaterThan(Boolean value) {
            addCriterion("share_permission >", value, "sharePermission");
            return (Criteria) this;
        }

        public Criteria andSharePermissionGreaterThanOrEqualTo(Boolean value) {
            addCriterion("share_permission >=", value, "sharePermission");
            return (Criteria) this;
        }

        public Criteria andSharePermissionLessThan(Boolean value) {
            addCriterion("share_permission <", value, "sharePermission");
            return (Criteria) this;
        }

        public Criteria andSharePermissionLessThanOrEqualTo(Boolean value) {
            addCriterion("share_permission <=", value, "sharePermission");
            return (Criteria) this;
        }

        public Criteria andSharePermissionIn(List<Boolean> values) {
            addCriterion("share_permission in", values, "sharePermission");
            return (Criteria) this;
        }

        public Criteria andSharePermissionNotIn(List<Boolean> values) {
            addCriterion("share_permission not in", values, "sharePermission");
            return (Criteria) this;
        }

        public Criteria andSharePermissionBetween(Boolean value1, Boolean value2) {
            addCriterion("share_permission between", value1, value2, "sharePermission");
            return (Criteria) this;
        }

        public Criteria andSharePermissionNotBetween(Boolean value1, Boolean value2) {
            addCriterion("share_permission not between", value1, value2, "sharePermission");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionIsNull() {
            addCriterion("download_permission is null");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionIsNotNull() {
            addCriterion("download_permission is not null");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionEqualTo(Boolean value) {
            addCriterion("download_permission =", value, "downloadPermission");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionNotEqualTo(Boolean value) {
            addCriterion("download_permission <>", value, "downloadPermission");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionGreaterThan(Boolean value) {
            addCriterion("download_permission >", value, "downloadPermission");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionGreaterThanOrEqualTo(Boolean value) {
            addCriterion("download_permission >=", value, "downloadPermission");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionLessThan(Boolean value) {
            addCriterion("download_permission <", value, "downloadPermission");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionLessThanOrEqualTo(Boolean value) {
            addCriterion("download_permission <=", value, "downloadPermission");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionIn(List<Boolean> values) {
            addCriterion("download_permission in", values, "downloadPermission");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionNotIn(List<Boolean> values) {
            addCriterion("download_permission not in", values, "downloadPermission");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionBetween(Boolean value1, Boolean value2) {
            addCriterion("download_permission between", value1, value2, "downloadPermission");
            return (Criteria) this;
        }

        public Criteria andDownloadPermissionNotBetween(Boolean value1, Boolean value2) {
            addCriterion("download_permission not between", value1, value2, "downloadPermission");
            return (Criteria) this;
        }

        public Criteria andCreateByIsNull() {
            addCriterion("create_by is null");
            return (Criteria) this;
        }

        public Criteria andCreateByIsNotNull() {
            addCriterion("create_by is not null");
            return (Criteria) this;
        }

        public Criteria andCreateByEqualTo(Long value) {
            addCriterion("create_by =", value, "createBy");
            return (Criteria) this;
        }

        public Criteria andCreateByNotEqualTo(Long value) {
            addCriterion("create_by <>", value, "createBy");
            return (Criteria) this;
        }

        public Criteria andCreateByGreaterThan(Long value) {
            addCriterion("create_by >", value, "createBy");
            return (Criteria) this;
        }

        public Criteria andCreateByGreaterThanOrEqualTo(Long value) {
            addCriterion("create_by >=", value, "createBy");
            return (Criteria) this;
        }

        public Criteria andCreateByLessThan(Long value) {
            addCriterion("create_by <", value, "createBy");
            return (Criteria) this;
        }

        public Criteria andCreateByLessThanOrEqualTo(Long value) {
            addCriterion("create_by <=", value, "createBy");
            return (Criteria) this;
        }

        public Criteria andCreateByIn(List<Long> values) {
            addCriterion("create_by in", values, "createBy");
            return (Criteria) this;
        }

        public Criteria andCreateByNotIn(List<Long> values) {
            addCriterion("create_by not in", values, "createBy");
            return (Criteria) this;
        }

        public Criteria andCreateByBetween(Long value1, Long value2) {
            addCriterion("create_by between", value1, value2, "createBy");
            return (Criteria) this;
        }

        public Criteria andCreateByNotBetween(Long value1, Long value2) {
            addCriterion("create_by not between", value1, value2, "createBy");
            return (Criteria) this;
        }

        public Criteria andCreateTimeIsNull() {
            addCriterion("create_time is null");
            return (Criteria) this;
        }

        public Criteria andCreateTimeIsNotNull() {
            addCriterion("create_time is not null");
            return (Criteria) this;
        }

        public Criteria andCreateTimeEqualTo(Date value) {
            addCriterion("create_time =", value, "createTime");
            return (Criteria) this;
        }

        public Criteria andCreateTimeNotEqualTo(Date value) {
            addCriterion("create_time <>", value, "createTime");
            return (Criteria) this;
        }

        public Criteria andCreateTimeGreaterThan(Date value) {
            addCriterion("create_time >", value, "createTime");
            return (Criteria) this;
        }

        public Criteria andCreateTimeGreaterThanOrEqualTo(Date value) {
            addCriterion("create_time >=", value, "createTime");
            return (Criteria) this;
        }

        public Criteria andCreateTimeLessThan(Date value) {
            addCriterion("create_time <", value, "createTime");
            return (Criteria) this;
        }

        public Criteria andCreateTimeLessThanOrEqualTo(Date value) {
            addCriterion("create_time <=", value, "createTime");
            return (Criteria) this;
        }

        public Criteria andCreateTimeIn(List<Date> values) {
            addCriterion("create_time in", values, "createTime");
            return (Criteria) this;
        }

        public Criteria andCreateTimeNotIn(List<Date> values) {
            addCriterion("create_time not in", values, "createTime");
            return (Criteria) this;
        }

        public Criteria andCreateTimeBetween(Date value1, Date value2) {
            addCriterion("create_time between", value1, value2, "createTime");
            return (Criteria) this;
        }

        public Criteria andCreateTimeNotBetween(Date value1, Date value2) {
            addCriterion("create_time not between", value1, value2, "createTime");
            return (Criteria) this;
        }

        public Criteria andUpdateByIsNull() {
            addCriterion("update_by is null");
            return (Criteria) this;
        }

        public Criteria andUpdateByIsNotNull() {
            addCriterion("update_by is not null");
            return (Criteria) this;
        }

        public Criteria andUpdateByEqualTo(Long value) {
            addCriterion("update_by =", value, "updateBy");
            return (Criteria) this;
        }

        public Criteria andUpdateByNotEqualTo(Long value) {
            addCriterion("update_by <>", value, "updateBy");
            return (Criteria) this;
        }

        public Criteria andUpdateByGreaterThan(Long value) {
            addCriterion("update_by >", value, "updateBy");
            return (Criteria) this;
        }

        public Criteria andUpdateByGreaterThanOrEqualTo(Long value) {
            addCriterion("update_by >=", value, "updateBy");
            return (Criteria) this;
        }

        public Criteria andUpdateByLessThan(Long value) {
            addCriterion("update_by <", value, "updateBy");
            return (Criteria) this;
        }

        public Criteria andUpdateByLessThanOrEqualTo(Long value) {
            addCriterion("update_by <=", value, "updateBy");
            return (Criteria) this;
        }

        public Criteria andUpdateByIn(List<Long> values) {
            addCriterion("update_by in", values, "updateBy");
            return (Criteria) this;
        }

        public Criteria andUpdateByNotIn(List<Long> values) {
            addCriterion("update_by not in", values, "updateBy");
            return (Criteria) this;
        }

        public Criteria andUpdateByBetween(Long value1, Long value2) {
            addCriterion("update_by between", value1, value2, "updateBy");
            return (Criteria) this;
        }

        public Criteria andUpdateByNotBetween(Long value1, Long value2) {
            addCriterion("update_by not between", value1, value2, "updateBy");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeIsNull() {
            addCriterion("update_time is null");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeIsNotNull() {
            addCriterion("update_time is not null");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeEqualTo(Date value) {
            addCriterion("update_time =", value, "updateTime");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeNotEqualTo(Date value) {
            addCriterion("update_time <>", value, "updateTime");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeGreaterThan(Date value) {
            addCriterion("update_time >", value, "updateTime");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeGreaterThanOrEqualTo(Date value) {
            addCriterion("update_time >=", value, "updateTime");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeLessThan(Date value) {
            addCriterion("update_time <", value, "updateTime");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeLessThanOrEqualTo(Date value) {
            addCriterion("update_time <=", value, "updateTime");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeIn(List<Date> values) {
            addCriterion("update_time in", values, "updateTime");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeNotIn(List<Date> values) {
            addCriterion("update_time not in", values, "updateTime");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeBetween(Date value1, Date value2) {
            addCriterion("update_time between", value1, value2, "updateTime");
            return (Criteria) this;
        }

        public Criteria andUpdateTimeNotBetween(Date value1, Date value2) {
            addCriterion("update_time not between", value1, value2, "updateTime");
            return (Criteria) this;
        }
    }

    public static class Criteria extends GeneratedCriteria {

        protected Criteria() {
            super();
        }
    }

    public static class Criterion {
        private String condition;

        private Object value;

        private Object secondValue;

        private boolean noValue;

        private boolean singleValue;

        private boolean betweenValue;

        private boolean listValue;

        private String typeHandler;

        public String getCondition() {
            return condition;
        }

        public Object getValue() {
            return value;
        }

        public Object getSecondValue() {
            return secondValue;
        }

        public boolean isNoValue() {
            return noValue;
        }

        public boolean isSingleValue() {
            return singleValue;
        }

        public boolean isBetweenValue() {
            return betweenValue;
        }

        public boolean isListValue() {
            return listValue;
        }

        public String getTypeHandler() {
            return typeHandler;
        }

        protected Criterion(String condition) {
            super();
            this.condition = condition;
            this.typeHandler = null;
            this.noValue = true;
        }

        protected Criterion(String condition, Object value, String typeHandler) {
            super();
            this.condition = condition;
            this.value = value;
            this.typeHandler = typeHandler;
            if (value instanceof List<?>) {
                this.listValue = true;
            } else {
                this.singleValue = true;
            }
        }

        protected Criterion(String condition, Object value) {
            this(condition, value, null);
        }

        protected Criterion(String condition, Object value, Object secondValue, String typeHandler) {
            super();
            this.condition = condition;
            this.value = value;
            this.secondValue = secondValue;
            this.typeHandler = typeHandler;
            this.betweenValue = true;
        }

        protected Criterion(String condition, Object value, Object secondValue) {
            this(condition, value, secondValue, null);
        }
    }
}
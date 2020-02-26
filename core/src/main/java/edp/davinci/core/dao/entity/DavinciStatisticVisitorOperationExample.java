package edp.davinci.core.dao.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class DavinciStatisticVisitorOperationExample {
    protected String orderByClause;

    protected boolean distinct;

    protected List<Criteria> oredCriteria;

    public DavinciStatisticVisitorOperationExample() {
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

        public Criteria andUserIdIsNull() {
            addCriterion("user_id is null");
            return (Criteria) this;
        }

        public Criteria andUserIdIsNotNull() {
            addCriterion("user_id is not null");
            return (Criteria) this;
        }

        public Criteria andUserIdEqualTo(Long value) {
            addCriterion("user_id =", value, "userId");
            return (Criteria) this;
        }

        public Criteria andUserIdNotEqualTo(Long value) {
            addCriterion("user_id <>", value, "userId");
            return (Criteria) this;
        }

        public Criteria andUserIdGreaterThan(Long value) {
            addCriterion("user_id >", value, "userId");
            return (Criteria) this;
        }

        public Criteria andUserIdGreaterThanOrEqualTo(Long value) {
            addCriterion("user_id >=", value, "userId");
            return (Criteria) this;
        }

        public Criteria andUserIdLessThan(Long value) {
            addCriterion("user_id <", value, "userId");
            return (Criteria) this;
        }

        public Criteria andUserIdLessThanOrEqualTo(Long value) {
            addCriterion("user_id <=", value, "userId");
            return (Criteria) this;
        }

        public Criteria andUserIdIn(List<Long> values) {
            addCriterion("user_id in", values, "userId");
            return (Criteria) this;
        }

        public Criteria andUserIdNotIn(List<Long> values) {
            addCriterion("user_id not in", values, "userId");
            return (Criteria) this;
        }

        public Criteria andUserIdBetween(Long value1, Long value2) {
            addCriterion("user_id between", value1, value2, "userId");
            return (Criteria) this;
        }

        public Criteria andUserIdNotBetween(Long value1, Long value2) {
            addCriterion("user_id not between", value1, value2, "userId");
            return (Criteria) this;
        }

        public Criteria andEmailIsNull() {
            addCriterion("email is null");
            return (Criteria) this;
        }

        public Criteria andEmailIsNotNull() {
            addCriterion("email is not null");
            return (Criteria) this;
        }

        public Criteria andEmailEqualTo(String value) {
            addCriterion("email =", value, "email");
            return (Criteria) this;
        }

        public Criteria andEmailNotEqualTo(String value) {
            addCriterion("email <>", value, "email");
            return (Criteria) this;
        }

        public Criteria andEmailGreaterThan(String value) {
            addCriterion("email >", value, "email");
            return (Criteria) this;
        }

        public Criteria andEmailGreaterThanOrEqualTo(String value) {
            addCriterion("email >=", value, "email");
            return (Criteria) this;
        }

        public Criteria andEmailLessThan(String value) {
            addCriterion("email <", value, "email");
            return (Criteria) this;
        }

        public Criteria andEmailLessThanOrEqualTo(String value) {
            addCriterion("email <=", value, "email");
            return (Criteria) this;
        }

        public Criteria andEmailLike(String value) {
            addCriterion("email like", value, "email");
            return (Criteria) this;
        }

        public Criteria andEmailNotLike(String value) {
            addCriterion("email not like", value, "email");
            return (Criteria) this;
        }

        public Criteria andEmailIn(List<String> values) {
            addCriterion("email in", values, "email");
            return (Criteria) this;
        }

        public Criteria andEmailNotIn(List<String> values) {
            addCriterion("email not in", values, "email");
            return (Criteria) this;
        }

        public Criteria andEmailBetween(String value1, String value2) {
            addCriterion("email between", value1, value2, "email");
            return (Criteria) this;
        }

        public Criteria andEmailNotBetween(String value1, String value2) {
            addCriterion("email not between", value1, value2, "email");
            return (Criteria) this;
        }

        public Criteria andActionIsNull() {
            addCriterion("`action` is null");
            return (Criteria) this;
        }

        public Criteria andActionIsNotNull() {
            addCriterion("`action` is not null");
            return (Criteria) this;
        }

        public Criteria andActionEqualTo(String value) {
            addCriterion("`action` =", value, "action");
            return (Criteria) this;
        }

        public Criteria andActionNotEqualTo(String value) {
            addCriterion("`action` <>", value, "action");
            return (Criteria) this;
        }

        public Criteria andActionGreaterThan(String value) {
            addCriterion("`action` >", value, "action");
            return (Criteria) this;
        }

        public Criteria andActionGreaterThanOrEqualTo(String value) {
            addCriterion("`action` >=", value, "action");
            return (Criteria) this;
        }

        public Criteria andActionLessThan(String value) {
            addCriterion("`action` <", value, "action");
            return (Criteria) this;
        }

        public Criteria andActionLessThanOrEqualTo(String value) {
            addCriterion("`action` <=", value, "action");
            return (Criteria) this;
        }

        public Criteria andActionLike(String value) {
            addCriterion("`action` like", value, "action");
            return (Criteria) this;
        }

        public Criteria andActionNotLike(String value) {
            addCriterion("`action` not like", value, "action");
            return (Criteria) this;
        }

        public Criteria andActionIn(List<String> values) {
            addCriterion("`action` in", values, "action");
            return (Criteria) this;
        }

        public Criteria andActionNotIn(List<String> values) {
            addCriterion("`action` not in", values, "action");
            return (Criteria) this;
        }

        public Criteria andActionBetween(String value1, String value2) {
            addCriterion("`action` between", value1, value2, "action");
            return (Criteria) this;
        }

        public Criteria andActionNotBetween(String value1, String value2) {
            addCriterion("`action` not between", value1, value2, "action");
            return (Criteria) this;
        }

        public Criteria andOrgIdIsNull() {
            addCriterion("org_id is null");
            return (Criteria) this;
        }

        public Criteria andOrgIdIsNotNull() {
            addCriterion("org_id is not null");
            return (Criteria) this;
        }

        public Criteria andOrgIdEqualTo(Long value) {
            addCriterion("org_id =", value, "orgId");
            return (Criteria) this;
        }

        public Criteria andOrgIdNotEqualTo(Long value) {
            addCriterion("org_id <>", value, "orgId");
            return (Criteria) this;
        }

        public Criteria andOrgIdGreaterThan(Long value) {
            addCriterion("org_id >", value, "orgId");
            return (Criteria) this;
        }

        public Criteria andOrgIdGreaterThanOrEqualTo(Long value) {
            addCriterion("org_id >=", value, "orgId");
            return (Criteria) this;
        }

        public Criteria andOrgIdLessThan(Long value) {
            addCriterion("org_id <", value, "orgId");
            return (Criteria) this;
        }

        public Criteria andOrgIdLessThanOrEqualTo(Long value) {
            addCriterion("org_id <=", value, "orgId");
            return (Criteria) this;
        }

        public Criteria andOrgIdIn(List<Long> values) {
            addCriterion("org_id in", values, "orgId");
            return (Criteria) this;
        }

        public Criteria andOrgIdNotIn(List<Long> values) {
            addCriterion("org_id not in", values, "orgId");
            return (Criteria) this;
        }

        public Criteria andOrgIdBetween(Long value1, Long value2) {
            addCriterion("org_id between", value1, value2, "orgId");
            return (Criteria) this;
        }

        public Criteria andOrgIdNotBetween(Long value1, Long value2) {
            addCriterion("org_id not between", value1, value2, "orgId");
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

        public Criteria andProjectNameIsNull() {
            addCriterion("project_name is null");
            return (Criteria) this;
        }

        public Criteria andProjectNameIsNotNull() {
            addCriterion("project_name is not null");
            return (Criteria) this;
        }

        public Criteria andProjectNameEqualTo(String value) {
            addCriterion("project_name =", value, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameNotEqualTo(String value) {
            addCriterion("project_name <>", value, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameGreaterThan(String value) {
            addCriterion("project_name >", value, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameGreaterThanOrEqualTo(String value) {
            addCriterion("project_name >=", value, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameLessThan(String value) {
            addCriterion("project_name <", value, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameLessThanOrEqualTo(String value) {
            addCriterion("project_name <=", value, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameLike(String value) {
            addCriterion("project_name like", value, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameNotLike(String value) {
            addCriterion("project_name not like", value, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameIn(List<String> values) {
            addCriterion("project_name in", values, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameNotIn(List<String> values) {
            addCriterion("project_name not in", values, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameBetween(String value1, String value2) {
            addCriterion("project_name between", value1, value2, "projectName");
            return (Criteria) this;
        }

        public Criteria andProjectNameNotBetween(String value1, String value2) {
            addCriterion("project_name not between", value1, value2, "projectName");
            return (Criteria) this;
        }

        public Criteria andVizTypeIsNull() {
            addCriterion("viz_type is null");
            return (Criteria) this;
        }

        public Criteria andVizTypeIsNotNull() {
            addCriterion("viz_type is not null");
            return (Criteria) this;
        }

        public Criteria andVizTypeEqualTo(String value) {
            addCriterion("viz_type =", value, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeNotEqualTo(String value) {
            addCriterion("viz_type <>", value, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeGreaterThan(String value) {
            addCriterion("viz_type >", value, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeGreaterThanOrEqualTo(String value) {
            addCriterion("viz_type >=", value, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeLessThan(String value) {
            addCriterion("viz_type <", value, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeLessThanOrEqualTo(String value) {
            addCriterion("viz_type <=", value, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeLike(String value) {
            addCriterion("viz_type like", value, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeNotLike(String value) {
            addCriterion("viz_type not like", value, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeIn(List<String> values) {
            addCriterion("viz_type in", values, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeNotIn(List<String> values) {
            addCriterion("viz_type not in", values, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeBetween(String value1, String value2) {
            addCriterion("viz_type between", value1, value2, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizTypeNotBetween(String value1, String value2) {
            addCriterion("viz_type not between", value1, value2, "vizType");
            return (Criteria) this;
        }

        public Criteria andVizIdIsNull() {
            addCriterion("viz_id is null");
            return (Criteria) this;
        }

        public Criteria andVizIdIsNotNull() {
            addCriterion("viz_id is not null");
            return (Criteria) this;
        }

        public Criteria andVizIdEqualTo(Long value) {
            addCriterion("viz_id =", value, "vizId");
            return (Criteria) this;
        }

        public Criteria andVizIdNotEqualTo(Long value) {
            addCriterion("viz_id <>", value, "vizId");
            return (Criteria) this;
        }

        public Criteria andVizIdGreaterThan(Long value) {
            addCriterion("viz_id >", value, "vizId");
            return (Criteria) this;
        }

        public Criteria andVizIdGreaterThanOrEqualTo(Long value) {
            addCriterion("viz_id >=", value, "vizId");
            return (Criteria) this;
        }

        public Criteria andVizIdLessThan(Long value) {
            addCriterion("viz_id <", value, "vizId");
            return (Criteria) this;
        }

        public Criteria andVizIdLessThanOrEqualTo(Long value) {
            addCriterion("viz_id <=", value, "vizId");
            return (Criteria) this;
        }

        public Criteria andVizIdIn(List<Long> values) {
            addCriterion("viz_id in", values, "vizId");
            return (Criteria) this;
        }

        public Criteria andVizIdNotIn(List<Long> values) {
            addCriterion("viz_id not in", values, "vizId");
            return (Criteria) this;
        }

        public Criteria andVizIdBetween(Long value1, Long value2) {
            addCriterion("viz_id between", value1, value2, "vizId");
            return (Criteria) this;
        }

        public Criteria andVizIdNotBetween(Long value1, Long value2) {
            addCriterion("viz_id not between", value1, value2, "vizId");
            return (Criteria) this;
        }

        public Criteria andVizNameIsNull() {
            addCriterion("viz_name is null");
            return (Criteria) this;
        }

        public Criteria andVizNameIsNotNull() {
            addCriterion("viz_name is not null");
            return (Criteria) this;
        }

        public Criteria andVizNameEqualTo(String value) {
            addCriterion("viz_name =", value, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameNotEqualTo(String value) {
            addCriterion("viz_name <>", value, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameGreaterThan(String value) {
            addCriterion("viz_name >", value, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameGreaterThanOrEqualTo(String value) {
            addCriterion("viz_name >=", value, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameLessThan(String value) {
            addCriterion("viz_name <", value, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameLessThanOrEqualTo(String value) {
            addCriterion("viz_name <=", value, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameLike(String value) {
            addCriterion("viz_name like", value, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameNotLike(String value) {
            addCriterion("viz_name not like", value, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameIn(List<String> values) {
            addCriterion("viz_name in", values, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameNotIn(List<String> values) {
            addCriterion("viz_name not in", values, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameBetween(String value1, String value2) {
            addCriterion("viz_name between", value1, value2, "vizName");
            return (Criteria) this;
        }

        public Criteria andVizNameNotBetween(String value1, String value2) {
            addCriterion("viz_name not between", value1, value2, "vizName");
            return (Criteria) this;
        }

        public Criteria andSubVizIdIsNull() {
            addCriterion("sub_viz_id is null");
            return (Criteria) this;
        }

        public Criteria andSubVizIdIsNotNull() {
            addCriterion("sub_viz_id is not null");
            return (Criteria) this;
        }

        public Criteria andSubVizIdEqualTo(Long value) {
            addCriterion("sub_viz_id =", value, "subVizId");
            return (Criteria) this;
        }

        public Criteria andSubVizIdNotEqualTo(Long value) {
            addCriterion("sub_viz_id <>", value, "subVizId");
            return (Criteria) this;
        }

        public Criteria andSubVizIdGreaterThan(Long value) {
            addCriterion("sub_viz_id >", value, "subVizId");
            return (Criteria) this;
        }

        public Criteria andSubVizIdGreaterThanOrEqualTo(Long value) {
            addCriterion("sub_viz_id >=", value, "subVizId");
            return (Criteria) this;
        }

        public Criteria andSubVizIdLessThan(Long value) {
            addCriterion("sub_viz_id <", value, "subVizId");
            return (Criteria) this;
        }

        public Criteria andSubVizIdLessThanOrEqualTo(Long value) {
            addCriterion("sub_viz_id <=", value, "subVizId");
            return (Criteria) this;
        }

        public Criteria andSubVizIdIn(List<Long> values) {
            addCriterion("sub_viz_id in", values, "subVizId");
            return (Criteria) this;
        }

        public Criteria andSubVizIdNotIn(List<Long> values) {
            addCriterion("sub_viz_id not in", values, "subVizId");
            return (Criteria) this;
        }

        public Criteria andSubVizIdBetween(Long value1, Long value2) {
            addCriterion("sub_viz_id between", value1, value2, "subVizId");
            return (Criteria) this;
        }

        public Criteria andSubVizIdNotBetween(Long value1, Long value2) {
            addCriterion("sub_viz_id not between", value1, value2, "subVizId");
            return (Criteria) this;
        }

        public Criteria andSubVizNameIsNull() {
            addCriterion("sub_viz_name is null");
            return (Criteria) this;
        }

        public Criteria andSubVizNameIsNotNull() {
            addCriterion("sub_viz_name is not null");
            return (Criteria) this;
        }

        public Criteria andSubVizNameEqualTo(String value) {
            addCriterion("sub_viz_name =", value, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameNotEqualTo(String value) {
            addCriterion("sub_viz_name <>", value, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameGreaterThan(String value) {
            addCriterion("sub_viz_name >", value, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameGreaterThanOrEqualTo(String value) {
            addCriterion("sub_viz_name >=", value, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameLessThan(String value) {
            addCriterion("sub_viz_name <", value, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameLessThanOrEqualTo(String value) {
            addCriterion("sub_viz_name <=", value, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameLike(String value) {
            addCriterion("sub_viz_name like", value, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameNotLike(String value) {
            addCriterion("sub_viz_name not like", value, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameIn(List<String> values) {
            addCriterion("sub_viz_name in", values, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameNotIn(List<String> values) {
            addCriterion("sub_viz_name not in", values, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameBetween(String value1, String value2) {
            addCriterion("sub_viz_name between", value1, value2, "subVizName");
            return (Criteria) this;
        }

        public Criteria andSubVizNameNotBetween(String value1, String value2) {
            addCriterion("sub_viz_name not between", value1, value2, "subVizName");
            return (Criteria) this;
        }

        public Criteria andWidgetIdIsNull() {
            addCriterion("widget_id is null");
            return (Criteria) this;
        }

        public Criteria andWidgetIdIsNotNull() {
            addCriterion("widget_id is not null");
            return (Criteria) this;
        }

        public Criteria andWidgetIdEqualTo(Long value) {
            addCriterion("widget_id =", value, "widgetId");
            return (Criteria) this;
        }

        public Criteria andWidgetIdNotEqualTo(Long value) {
            addCriterion("widget_id <>", value, "widgetId");
            return (Criteria) this;
        }

        public Criteria andWidgetIdGreaterThan(Long value) {
            addCriterion("widget_id >", value, "widgetId");
            return (Criteria) this;
        }

        public Criteria andWidgetIdGreaterThanOrEqualTo(Long value) {
            addCriterion("widget_id >=", value, "widgetId");
            return (Criteria) this;
        }

        public Criteria andWidgetIdLessThan(Long value) {
            addCriterion("widget_id <", value, "widgetId");
            return (Criteria) this;
        }

        public Criteria andWidgetIdLessThanOrEqualTo(Long value) {
            addCriterion("widget_id <=", value, "widgetId");
            return (Criteria) this;
        }

        public Criteria andWidgetIdIn(List<Long> values) {
            addCriterion("widget_id in", values, "widgetId");
            return (Criteria) this;
        }

        public Criteria andWidgetIdNotIn(List<Long> values) {
            addCriterion("widget_id not in", values, "widgetId");
            return (Criteria) this;
        }

        public Criteria andWidgetIdBetween(Long value1, Long value2) {
            addCriterion("widget_id between", value1, value2, "widgetId");
            return (Criteria) this;
        }

        public Criteria andWidgetIdNotBetween(Long value1, Long value2) {
            addCriterion("widget_id not between", value1, value2, "widgetId");
            return (Criteria) this;
        }

        public Criteria andWidgetNameIsNull() {
            addCriterion("widget_name is null");
            return (Criteria) this;
        }

        public Criteria andWidgetNameIsNotNull() {
            addCriterion("widget_name is not null");
            return (Criteria) this;
        }

        public Criteria andWidgetNameEqualTo(String value) {
            addCriterion("widget_name =", value, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameNotEqualTo(String value) {
            addCriterion("widget_name <>", value, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameGreaterThan(String value) {
            addCriterion("widget_name >", value, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameGreaterThanOrEqualTo(String value) {
            addCriterion("widget_name >=", value, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameLessThan(String value) {
            addCriterion("widget_name <", value, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameLessThanOrEqualTo(String value) {
            addCriterion("widget_name <=", value, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameLike(String value) {
            addCriterion("widget_name like", value, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameNotLike(String value) {
            addCriterion("widget_name not like", value, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameIn(List<String> values) {
            addCriterion("widget_name in", values, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameNotIn(List<String> values) {
            addCriterion("widget_name not in", values, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameBetween(String value1, String value2) {
            addCriterion("widget_name between", value1, value2, "widgetName");
            return (Criteria) this;
        }

        public Criteria andWidgetNameNotBetween(String value1, String value2) {
            addCriterion("widget_name not between", value1, value2, "widgetName");
            return (Criteria) this;
        }

        public Criteria andVariablesIsNull() {
            addCriterion("`variables` is null");
            return (Criteria) this;
        }

        public Criteria andVariablesIsNotNull() {
            addCriterion("`variables` is not null");
            return (Criteria) this;
        }

        public Criteria andVariablesEqualTo(String value) {
            addCriterion("`variables` =", value, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesNotEqualTo(String value) {
            addCriterion("`variables` <>", value, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesGreaterThan(String value) {
            addCriterion("`variables` >", value, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesGreaterThanOrEqualTo(String value) {
            addCriterion("`variables` >=", value, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesLessThan(String value) {
            addCriterion("`variables` <", value, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesLessThanOrEqualTo(String value) {
            addCriterion("`variables` <=", value, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesLike(String value) {
            addCriterion("`variables` like", value, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesNotLike(String value) {
            addCriterion("`variables` not like", value, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesIn(List<String> values) {
            addCriterion("`variables` in", values, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesNotIn(List<String> values) {
            addCriterion("`variables` not in", values, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesBetween(String value1, String value2) {
            addCriterion("`variables` between", value1, value2, "variables");
            return (Criteria) this;
        }

        public Criteria andVariablesNotBetween(String value1, String value2) {
            addCriterion("`variables` not between", value1, value2, "variables");
            return (Criteria) this;
        }

        public Criteria andFiltersIsNull() {
            addCriterion("filters is null");
            return (Criteria) this;
        }

        public Criteria andFiltersIsNotNull() {
            addCriterion("filters is not null");
            return (Criteria) this;
        }

        public Criteria andFiltersEqualTo(String value) {
            addCriterion("filters =", value, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersNotEqualTo(String value) {
            addCriterion("filters <>", value, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersGreaterThan(String value) {
            addCriterion("filters >", value, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersGreaterThanOrEqualTo(String value) {
            addCriterion("filters >=", value, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersLessThan(String value) {
            addCriterion("filters <", value, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersLessThanOrEqualTo(String value) {
            addCriterion("filters <=", value, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersLike(String value) {
            addCriterion("filters like", value, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersNotLike(String value) {
            addCriterion("filters not like", value, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersIn(List<String> values) {
            addCriterion("filters in", values, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersNotIn(List<String> values) {
            addCriterion("filters not in", values, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersBetween(String value1, String value2) {
            addCriterion("filters between", value1, value2, "filters");
            return (Criteria) this;
        }

        public Criteria andFiltersNotBetween(String value1, String value2) {
            addCriterion("filters not between", value1, value2, "filters");
            return (Criteria) this;
        }

        public Criteria andGroupsIsNull() {
            addCriterion("groups is null");
            return (Criteria) this;
        }

        public Criteria andGroupsIsNotNull() {
            addCriterion("groups is not null");
            return (Criteria) this;
        }

        public Criteria andGroupsEqualTo(String value) {
            addCriterion("groups =", value, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsNotEqualTo(String value) {
            addCriterion("groups <>", value, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsGreaterThan(String value) {
            addCriterion("groups >", value, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsGreaterThanOrEqualTo(String value) {
            addCriterion("groups >=", value, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsLessThan(String value) {
            addCriterion("groups <", value, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsLessThanOrEqualTo(String value) {
            addCriterion("groups <=", value, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsLike(String value) {
            addCriterion("groups like", value, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsNotLike(String value) {
            addCriterion("groups not like", value, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsIn(List<String> values) {
            addCriterion("groups in", values, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsNotIn(List<String> values) {
            addCriterion("groups not in", values, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsBetween(String value1, String value2) {
            addCriterion("groups between", value1, value2, "groups");
            return (Criteria) this;
        }

        public Criteria andGroupsNotBetween(String value1, String value2) {
            addCriterion("groups not between", value1, value2, "groups");
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
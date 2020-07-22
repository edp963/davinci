package edp.davinci.core.dao.entity;

import java.util.ArrayList;
import java.util.List;

public class PlatformExample {
    protected String orderByClause;

    protected boolean distinct;

    protected List<Criteria> oredCriteria;

    public PlatformExample() {
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

        public Criteria andNameIsNull() {
            addCriterion("`name` is null");
            return (Criteria) this;
        }

        public Criteria andNameIsNotNull() {
            addCriterion("`name` is not null");
            return (Criteria) this;
        }

        public Criteria andNameEqualTo(String value) {
            addCriterion("`name` =", value, "name");
            return (Criteria) this;
        }

        public Criteria andNameNotEqualTo(String value) {
            addCriterion("`name` <>", value, "name");
            return (Criteria) this;
        }

        public Criteria andNameGreaterThan(String value) {
            addCriterion("`name` >", value, "name");
            return (Criteria) this;
        }

        public Criteria andNameGreaterThanOrEqualTo(String value) {
            addCriterion("`name` >=", value, "name");
            return (Criteria) this;
        }

        public Criteria andNameLessThan(String value) {
            addCriterion("`name` <", value, "name");
            return (Criteria) this;
        }

        public Criteria andNameLessThanOrEqualTo(String value) {
            addCriterion("`name` <=", value, "name");
            return (Criteria) this;
        }

        public Criteria andNameLike(String value) {
            addCriterion("`name` like", value, "name");
            return (Criteria) this;
        }

        public Criteria andNameNotLike(String value) {
            addCriterion("`name` not like", value, "name");
            return (Criteria) this;
        }

        public Criteria andNameIn(List<String> values) {
            addCriterion("`name` in", values, "name");
            return (Criteria) this;
        }

        public Criteria andNameNotIn(List<String> values) {
            addCriterion("`name` not in", values, "name");
            return (Criteria) this;
        }

        public Criteria andNameBetween(String value1, String value2) {
            addCriterion("`name` between", value1, value2, "name");
            return (Criteria) this;
        }

        public Criteria andNameNotBetween(String value1, String value2) {
            addCriterion("`name` not between", value1, value2, "name");
            return (Criteria) this;
        }

        public Criteria andPlatformIsNull() {
            addCriterion("platform is null");
            return (Criteria) this;
        }

        public Criteria andPlatformIsNotNull() {
            addCriterion("platform is not null");
            return (Criteria) this;
        }

        public Criteria andPlatformEqualTo(String value) {
            addCriterion("platform =", value, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformNotEqualTo(String value) {
            addCriterion("platform <>", value, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformGreaterThan(String value) {
            addCriterion("platform >", value, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformGreaterThanOrEqualTo(String value) {
            addCriterion("platform >=", value, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformLessThan(String value) {
            addCriterion("platform <", value, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformLessThanOrEqualTo(String value) {
            addCriterion("platform <=", value, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformLike(String value) {
            addCriterion("platform like", value, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformNotLike(String value) {
            addCriterion("platform not like", value, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformIn(List<String> values) {
            addCriterion("platform in", values, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformNotIn(List<String> values) {
            addCriterion("platform not in", values, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformBetween(String value1, String value2) {
            addCriterion("platform between", value1, value2, "platform");
            return (Criteria) this;
        }

        public Criteria andPlatformNotBetween(String value1, String value2) {
            addCriterion("platform not between", value1, value2, "platform");
            return (Criteria) this;
        }

        public Criteria andCodeIsNull() {
            addCriterion("code is null");
            return (Criteria) this;
        }

        public Criteria andCodeIsNotNull() {
            addCriterion("code is not null");
            return (Criteria) this;
        }

        public Criteria andCodeEqualTo(String value) {
            addCriterion("code =", value, "code");
            return (Criteria) this;
        }

        public Criteria andCodeNotEqualTo(String value) {
            addCriterion("code <>", value, "code");
            return (Criteria) this;
        }

        public Criteria andCodeGreaterThan(String value) {
            addCriterion("code >", value, "code");
            return (Criteria) this;
        }

        public Criteria andCodeGreaterThanOrEqualTo(String value) {
            addCriterion("code >=", value, "code");
            return (Criteria) this;
        }

        public Criteria andCodeLessThan(String value) {
            addCriterion("code <", value, "code");
            return (Criteria) this;
        }

        public Criteria andCodeLessThanOrEqualTo(String value) {
            addCriterion("code <=", value, "code");
            return (Criteria) this;
        }

        public Criteria andCodeLike(String value) {
            addCriterion("code like", value, "code");
            return (Criteria) this;
        }

        public Criteria andCodeNotLike(String value) {
            addCriterion("code not like", value, "code");
            return (Criteria) this;
        }

        public Criteria andCodeIn(List<String> values) {
            addCriterion("code in", values, "code");
            return (Criteria) this;
        }

        public Criteria andCodeNotIn(List<String> values) {
            addCriterion("code not in", values, "code");
            return (Criteria) this;
        }

        public Criteria andCodeBetween(String value1, String value2) {
            addCriterion("code between", value1, value2, "code");
            return (Criteria) this;
        }

        public Criteria andCodeNotBetween(String value1, String value2) {
            addCriterion("code not between", value1, value2, "code");
            return (Criteria) this;
        }

        public Criteria andCheckCodeIsNull() {
            addCriterion("checkCode is null");
            return (Criteria) this;
        }

        public Criteria andCheckCodeIsNotNull() {
            addCriterion("checkCode is not null");
            return (Criteria) this;
        }

        public Criteria andCheckCodeEqualTo(String value) {
            addCriterion("checkCode =", value, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeNotEqualTo(String value) {
            addCriterion("checkCode <>", value, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeGreaterThan(String value) {
            addCriterion("checkCode >", value, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeGreaterThanOrEqualTo(String value) {
            addCriterion("checkCode >=", value, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeLessThan(String value) {
            addCriterion("checkCode <", value, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeLessThanOrEqualTo(String value) {
            addCriterion("checkCode <=", value, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeLike(String value) {
            addCriterion("checkCode like", value, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeNotLike(String value) {
            addCriterion("checkCode not like", value, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeIn(List<String> values) {
            addCriterion("checkCode in", values, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeNotIn(List<String> values) {
            addCriterion("checkCode not in", values, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeBetween(String value1, String value2) {
            addCriterion("checkCode between", value1, value2, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckCodeNotBetween(String value1, String value2) {
            addCriterion("checkCode not between", value1, value2, "checkCode");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenIsNull() {
            addCriterion("checkSystemToken is null");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenIsNotNull() {
            addCriterion("checkSystemToken is not null");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenEqualTo(String value) {
            addCriterion("checkSystemToken =", value, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenNotEqualTo(String value) {
            addCriterion("checkSystemToken <>", value, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenGreaterThan(String value) {
            addCriterion("checkSystemToken >", value, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenGreaterThanOrEqualTo(String value) {
            addCriterion("checkSystemToken >=", value, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenLessThan(String value) {
            addCriterion("checkSystemToken <", value, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenLessThanOrEqualTo(String value) {
            addCriterion("checkSystemToken <=", value, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenLike(String value) {
            addCriterion("checkSystemToken like", value, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenNotLike(String value) {
            addCriterion("checkSystemToken not like", value, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenIn(List<String> values) {
            addCriterion("checkSystemToken in", values, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenNotIn(List<String> values) {
            addCriterion("checkSystemToken not in", values, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenBetween(String value1, String value2) {
            addCriterion("checkSystemToken between", value1, value2, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckSystemTokenNotBetween(String value1, String value2) {
            addCriterion("checkSystemToken not between", value1, value2, "checkSystemToken");
            return (Criteria) this;
        }

        public Criteria andCheckUrlIsNull() {
            addCriterion("checkUrl is null");
            return (Criteria) this;
        }

        public Criteria andCheckUrlIsNotNull() {
            addCriterion("checkUrl is not null");
            return (Criteria) this;
        }

        public Criteria andCheckUrlEqualTo(String value) {
            addCriterion("checkUrl =", value, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlNotEqualTo(String value) {
            addCriterion("checkUrl <>", value, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlGreaterThan(String value) {
            addCriterion("checkUrl >", value, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlGreaterThanOrEqualTo(String value) {
            addCriterion("checkUrl >=", value, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlLessThan(String value) {
            addCriterion("checkUrl <", value, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlLessThanOrEqualTo(String value) {
            addCriterion("checkUrl <=", value, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlLike(String value) {
            addCriterion("checkUrl like", value, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlNotLike(String value) {
            addCriterion("checkUrl not like", value, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlIn(List<String> values) {
            addCriterion("checkUrl in", values, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlNotIn(List<String> values) {
            addCriterion("checkUrl not in", values, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlBetween(String value1, String value2) {
            addCriterion("checkUrl between", value1, value2, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andCheckUrlNotBetween(String value1, String value2) {
            addCriterion("checkUrl not between", value1, value2, "checkUrl");
            return (Criteria) this;
        }

        public Criteria andAlternateField1IsNull() {
            addCriterion("alternateField1 is null");
            return (Criteria) this;
        }

        public Criteria andAlternateField1IsNotNull() {
            addCriterion("alternateField1 is not null");
            return (Criteria) this;
        }

        public Criteria andAlternateField1EqualTo(String value) {
            addCriterion("alternateField1 =", value, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1NotEqualTo(String value) {
            addCriterion("alternateField1 <>", value, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1GreaterThan(String value) {
            addCriterion("alternateField1 >", value, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1GreaterThanOrEqualTo(String value) {
            addCriterion("alternateField1 >=", value, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1LessThan(String value) {
            addCriterion("alternateField1 <", value, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1LessThanOrEqualTo(String value) {
            addCriterion("alternateField1 <=", value, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1Like(String value) {
            addCriterion("alternateField1 like", value, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1NotLike(String value) {
            addCriterion("alternateField1 not like", value, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1In(List<String> values) {
            addCriterion("alternateField1 in", values, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1NotIn(List<String> values) {
            addCriterion("alternateField1 not in", values, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1Between(String value1, String value2) {
            addCriterion("alternateField1 between", value1, value2, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField1NotBetween(String value1, String value2) {
            addCriterion("alternateField1 not between", value1, value2, "alternateField1");
            return (Criteria) this;
        }

        public Criteria andAlternateField2IsNull() {
            addCriterion("alternateField2 is null");
            return (Criteria) this;
        }

        public Criteria andAlternateField2IsNotNull() {
            addCriterion("alternateField2 is not null");
            return (Criteria) this;
        }

        public Criteria andAlternateField2EqualTo(String value) {
            addCriterion("alternateField2 =", value, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2NotEqualTo(String value) {
            addCriterion("alternateField2 <>", value, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2GreaterThan(String value) {
            addCriterion("alternateField2 >", value, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2GreaterThanOrEqualTo(String value) {
            addCriterion("alternateField2 >=", value, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2LessThan(String value) {
            addCriterion("alternateField2 <", value, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2LessThanOrEqualTo(String value) {
            addCriterion("alternateField2 <=", value, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2Like(String value) {
            addCriterion("alternateField2 like", value, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2NotLike(String value) {
            addCriterion("alternateField2 not like", value, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2In(List<String> values) {
            addCriterion("alternateField2 in", values, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2NotIn(List<String> values) {
            addCriterion("alternateField2 not in", values, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2Between(String value1, String value2) {
            addCriterion("alternateField2 between", value1, value2, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField2NotBetween(String value1, String value2) {
            addCriterion("alternateField2 not between", value1, value2, "alternateField2");
            return (Criteria) this;
        }

        public Criteria andAlternateField3IsNull() {
            addCriterion("alternateField3 is null");
            return (Criteria) this;
        }

        public Criteria andAlternateField3IsNotNull() {
            addCriterion("alternateField3 is not null");
            return (Criteria) this;
        }

        public Criteria andAlternateField3EqualTo(String value) {
            addCriterion("alternateField3 =", value, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3NotEqualTo(String value) {
            addCriterion("alternateField3 <>", value, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3GreaterThan(String value) {
            addCriterion("alternateField3 >", value, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3GreaterThanOrEqualTo(String value) {
            addCriterion("alternateField3 >=", value, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3LessThan(String value) {
            addCriterion("alternateField3 <", value, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3LessThanOrEqualTo(String value) {
            addCriterion("alternateField3 <=", value, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3Like(String value) {
            addCriterion("alternateField3 like", value, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3NotLike(String value) {
            addCriterion("alternateField3 not like", value, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3In(List<String> values) {
            addCriterion("alternateField3 in", values, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3NotIn(List<String> values) {
            addCriterion("alternateField3 not in", values, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3Between(String value1, String value2) {
            addCriterion("alternateField3 between", value1, value2, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField3NotBetween(String value1, String value2) {
            addCriterion("alternateField3 not between", value1, value2, "alternateField3");
            return (Criteria) this;
        }

        public Criteria andAlternateField4IsNull() {
            addCriterion("alternateField4 is null");
            return (Criteria) this;
        }

        public Criteria andAlternateField4IsNotNull() {
            addCriterion("alternateField4 is not null");
            return (Criteria) this;
        }

        public Criteria andAlternateField4EqualTo(String value) {
            addCriterion("alternateField4 =", value, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4NotEqualTo(String value) {
            addCriterion("alternateField4 <>", value, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4GreaterThan(String value) {
            addCriterion("alternateField4 >", value, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4GreaterThanOrEqualTo(String value) {
            addCriterion("alternateField4 >=", value, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4LessThan(String value) {
            addCriterion("alternateField4 <", value, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4LessThanOrEqualTo(String value) {
            addCriterion("alternateField4 <=", value, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4Like(String value) {
            addCriterion("alternateField4 like", value, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4NotLike(String value) {
            addCriterion("alternateField4 not like", value, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4In(List<String> values) {
            addCriterion("alternateField4 in", values, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4NotIn(List<String> values) {
            addCriterion("alternateField4 not in", values, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4Between(String value1, String value2) {
            addCriterion("alternateField4 between", value1, value2, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField4NotBetween(String value1, String value2) {
            addCriterion("alternateField4 not between", value1, value2, "alternateField4");
            return (Criteria) this;
        }

        public Criteria andAlternateField5IsNull() {
            addCriterion("alternateField5 is null");
            return (Criteria) this;
        }

        public Criteria andAlternateField5IsNotNull() {
            addCriterion("alternateField5 is not null");
            return (Criteria) this;
        }

        public Criteria andAlternateField5EqualTo(String value) {
            addCriterion("alternateField5 =", value, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5NotEqualTo(String value) {
            addCriterion("alternateField5 <>", value, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5GreaterThan(String value) {
            addCriterion("alternateField5 >", value, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5GreaterThanOrEqualTo(String value) {
            addCriterion("alternateField5 >=", value, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5LessThan(String value) {
            addCriterion("alternateField5 <", value, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5LessThanOrEqualTo(String value) {
            addCriterion("alternateField5 <=", value, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5Like(String value) {
            addCriterion("alternateField5 like", value, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5NotLike(String value) {
            addCriterion("alternateField5 not like", value, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5In(List<String> values) {
            addCriterion("alternateField5 in", values, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5NotIn(List<String> values) {
            addCriterion("alternateField5 not in", values, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5Between(String value1, String value2) {
            addCriterion("alternateField5 between", value1, value2, "alternateField5");
            return (Criteria) this;
        }

        public Criteria andAlternateField5NotBetween(String value1, String value2) {
            addCriterion("alternateField5 not between", value1, value2, "alternateField5");
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
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

        public Criteria andCheckcodeIsNull() {
            addCriterion("checkCode is null");
            return (Criteria) this;
        }

        public Criteria andCheckcodeIsNotNull() {
            addCriterion("checkCode is not null");
            return (Criteria) this;
        }

        public Criteria andCheckcodeEqualTo(String value) {
            addCriterion("checkCode =", value, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeNotEqualTo(String value) {
            addCriterion("checkCode <>", value, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeGreaterThan(String value) {
            addCriterion("checkCode >", value, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeGreaterThanOrEqualTo(String value) {
            addCriterion("checkCode >=", value, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeLessThan(String value) {
            addCriterion("checkCode <", value, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeLessThanOrEqualTo(String value) {
            addCriterion("checkCode <=", value, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeLike(String value) {
            addCriterion("checkCode like", value, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeNotLike(String value) {
            addCriterion("checkCode not like", value, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeIn(List<String> values) {
            addCriterion("checkCode in", values, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeNotIn(List<String> values) {
            addCriterion("checkCode not in", values, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeBetween(String value1, String value2) {
            addCriterion("checkCode between", value1, value2, "checkcode");
            return (Criteria) this;
        }

        public Criteria andCheckcodeNotBetween(String value1, String value2) {
            addCriterion("checkCode not between", value1, value2, "checkcode");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenIsNull() {
            addCriterion("checkSystemToken is null");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenIsNotNull() {
            addCriterion("checkSystemToken is not null");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenEqualTo(String value) {
            addCriterion("checkSystemToken =", value, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenNotEqualTo(String value) {
            addCriterion("checkSystemToken <>", value, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenGreaterThan(String value) {
            addCriterion("checkSystemToken >", value, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenGreaterThanOrEqualTo(String value) {
            addCriterion("checkSystemToken >=", value, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenLessThan(String value) {
            addCriterion("checkSystemToken <", value, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenLessThanOrEqualTo(String value) {
            addCriterion("checkSystemToken <=", value, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenLike(String value) {
            addCriterion("checkSystemToken like", value, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenNotLike(String value) {
            addCriterion("checkSystemToken not like", value, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenIn(List<String> values) {
            addCriterion("checkSystemToken in", values, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenNotIn(List<String> values) {
            addCriterion("checkSystemToken not in", values, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenBetween(String value1, String value2) {
            addCriterion("checkSystemToken between", value1, value2, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andChecksystemtokenNotBetween(String value1, String value2) {
            addCriterion("checkSystemToken not between", value1, value2, "checksystemtoken");
            return (Criteria) this;
        }

        public Criteria andCheckurlIsNull() {
            addCriterion("checkUrl is null");
            return (Criteria) this;
        }

        public Criteria andCheckurlIsNotNull() {
            addCriterion("checkUrl is not null");
            return (Criteria) this;
        }

        public Criteria andCheckurlEqualTo(String value) {
            addCriterion("checkUrl =", value, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlNotEqualTo(String value) {
            addCriterion("checkUrl <>", value, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlGreaterThan(String value) {
            addCriterion("checkUrl >", value, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlGreaterThanOrEqualTo(String value) {
            addCriterion("checkUrl >=", value, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlLessThan(String value) {
            addCriterion("checkUrl <", value, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlLessThanOrEqualTo(String value) {
            addCriterion("checkUrl <=", value, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlLike(String value) {
            addCriterion("checkUrl like", value, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlNotLike(String value) {
            addCriterion("checkUrl not like", value, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlIn(List<String> values) {
            addCriterion("checkUrl in", values, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlNotIn(List<String> values) {
            addCriterion("checkUrl not in", values, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlBetween(String value1, String value2) {
            addCriterion("checkUrl between", value1, value2, "checkurl");
            return (Criteria) this;
        }

        public Criteria andCheckurlNotBetween(String value1, String value2) {
            addCriterion("checkUrl not between", value1, value2, "checkurl");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1IsNull() {
            addCriterion("alternateField1 is null");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1IsNotNull() {
            addCriterion("alternateField1 is not null");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1EqualTo(String value) {
            addCriterion("alternateField1 =", value, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1NotEqualTo(String value) {
            addCriterion("alternateField1 <>", value, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1GreaterThan(String value) {
            addCriterion("alternateField1 >", value, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1GreaterThanOrEqualTo(String value) {
            addCriterion("alternateField1 >=", value, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1LessThan(String value) {
            addCriterion("alternateField1 <", value, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1LessThanOrEqualTo(String value) {
            addCriterion("alternateField1 <=", value, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1Like(String value) {
            addCriterion("alternateField1 like", value, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1NotLike(String value) {
            addCriterion("alternateField1 not like", value, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1In(List<String> values) {
            addCriterion("alternateField1 in", values, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1NotIn(List<String> values) {
            addCriterion("alternateField1 not in", values, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1Between(String value1, String value2) {
            addCriterion("alternateField1 between", value1, value2, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield1NotBetween(String value1, String value2) {
            addCriterion("alternateField1 not between", value1, value2, "alternatefield1");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2IsNull() {
            addCriterion("alternateField2 is null");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2IsNotNull() {
            addCriterion("alternateField2 is not null");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2EqualTo(String value) {
            addCriterion("alternateField2 =", value, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2NotEqualTo(String value) {
            addCriterion("alternateField2 <>", value, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2GreaterThan(String value) {
            addCriterion("alternateField2 >", value, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2GreaterThanOrEqualTo(String value) {
            addCriterion("alternateField2 >=", value, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2LessThan(String value) {
            addCriterion("alternateField2 <", value, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2LessThanOrEqualTo(String value) {
            addCriterion("alternateField2 <=", value, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2Like(String value) {
            addCriterion("alternateField2 like", value, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2NotLike(String value) {
            addCriterion("alternateField2 not like", value, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2In(List<String> values) {
            addCriterion("alternateField2 in", values, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2NotIn(List<String> values) {
            addCriterion("alternateField2 not in", values, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2Between(String value1, String value2) {
            addCriterion("alternateField2 between", value1, value2, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield2NotBetween(String value1, String value2) {
            addCriterion("alternateField2 not between", value1, value2, "alternatefield2");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3IsNull() {
            addCriterion("alternateField3 is null");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3IsNotNull() {
            addCriterion("alternateField3 is not null");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3EqualTo(String value) {
            addCriterion("alternateField3 =", value, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3NotEqualTo(String value) {
            addCriterion("alternateField3 <>", value, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3GreaterThan(String value) {
            addCriterion("alternateField3 >", value, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3GreaterThanOrEqualTo(String value) {
            addCriterion("alternateField3 >=", value, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3LessThan(String value) {
            addCriterion("alternateField3 <", value, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3LessThanOrEqualTo(String value) {
            addCriterion("alternateField3 <=", value, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3Like(String value) {
            addCriterion("alternateField3 like", value, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3NotLike(String value) {
            addCriterion("alternateField3 not like", value, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3In(List<String> values) {
            addCriterion("alternateField3 in", values, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3NotIn(List<String> values) {
            addCriterion("alternateField3 not in", values, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3Between(String value1, String value2) {
            addCriterion("alternateField3 between", value1, value2, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield3NotBetween(String value1, String value2) {
            addCriterion("alternateField3 not between", value1, value2, "alternatefield3");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4IsNull() {
            addCriterion("alternateField4 is null");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4IsNotNull() {
            addCriterion("alternateField4 is not null");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4EqualTo(String value) {
            addCriterion("alternateField4 =", value, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4NotEqualTo(String value) {
            addCriterion("alternateField4 <>", value, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4GreaterThan(String value) {
            addCriterion("alternateField4 >", value, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4GreaterThanOrEqualTo(String value) {
            addCriterion("alternateField4 >=", value, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4LessThan(String value) {
            addCriterion("alternateField4 <", value, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4LessThanOrEqualTo(String value) {
            addCriterion("alternateField4 <=", value, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4Like(String value) {
            addCriterion("alternateField4 like", value, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4NotLike(String value) {
            addCriterion("alternateField4 not like", value, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4In(List<String> values) {
            addCriterion("alternateField4 in", values, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4NotIn(List<String> values) {
            addCriterion("alternateField4 not in", values, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4Between(String value1, String value2) {
            addCriterion("alternateField4 between", value1, value2, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield4NotBetween(String value1, String value2) {
            addCriterion("alternateField4 not between", value1, value2, "alternatefield4");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5IsNull() {
            addCriterion("alternateField5 is null");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5IsNotNull() {
            addCriterion("alternateField5 is not null");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5EqualTo(String value) {
            addCriterion("alternateField5 =", value, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5NotEqualTo(String value) {
            addCriterion("alternateField5 <>", value, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5GreaterThan(String value) {
            addCriterion("alternateField5 >", value, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5GreaterThanOrEqualTo(String value) {
            addCriterion("alternateField5 >=", value, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5LessThan(String value) {
            addCriterion("alternateField5 <", value, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5LessThanOrEqualTo(String value) {
            addCriterion("alternateField5 <=", value, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5Like(String value) {
            addCriterion("alternateField5 like", value, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5NotLike(String value) {
            addCriterion("alternateField5 not like", value, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5In(List<String> values) {
            addCriterion("alternateField5 in", values, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5NotIn(List<String> values) {
            addCriterion("alternateField5 not in", values, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5Between(String value1, String value2) {
            addCriterion("alternateField5 between", value1, value2, "alternatefield5");
            return (Criteria) this;
        }

        public Criteria andAlternatefield5NotBetween(String value1, String value2) {
            addCriterion("alternateField5 not between", value1, value2, "alternatefield5");
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
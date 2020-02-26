package edp.davinci.core.dao.entity;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class DavinciStatisticTerminalExample {
    protected String orderByClause;

    protected boolean distinct;

    protected List<Criteria> oredCriteria;

    public DavinciStatisticTerminalExample() {
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

        public Criteria andBrowserNameIsNull() {
            addCriterion("browser_name is null");
            return (Criteria) this;
        }

        public Criteria andBrowserNameIsNotNull() {
            addCriterion("browser_name is not null");
            return (Criteria) this;
        }

        public Criteria andBrowserNameEqualTo(String value) {
            addCriterion("browser_name =", value, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameNotEqualTo(String value) {
            addCriterion("browser_name <>", value, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameGreaterThan(String value) {
            addCriterion("browser_name >", value, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameGreaterThanOrEqualTo(String value) {
            addCriterion("browser_name >=", value, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameLessThan(String value) {
            addCriterion("browser_name <", value, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameLessThanOrEqualTo(String value) {
            addCriterion("browser_name <=", value, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameLike(String value) {
            addCriterion("browser_name like", value, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameNotLike(String value) {
            addCriterion("browser_name not like", value, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameIn(List<String> values) {
            addCriterion("browser_name in", values, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameNotIn(List<String> values) {
            addCriterion("browser_name not in", values, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameBetween(String value1, String value2) {
            addCriterion("browser_name between", value1, value2, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserNameNotBetween(String value1, String value2) {
            addCriterion("browser_name not between", value1, value2, "browserName");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionIsNull() {
            addCriterion("browser_version is null");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionIsNotNull() {
            addCriterion("browser_version is not null");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionEqualTo(String value) {
            addCriterion("browser_version =", value, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionNotEqualTo(String value) {
            addCriterion("browser_version <>", value, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionGreaterThan(String value) {
            addCriterion("browser_version >", value, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionGreaterThanOrEqualTo(String value) {
            addCriterion("browser_version >=", value, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionLessThan(String value) {
            addCriterion("browser_version <", value, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionLessThanOrEqualTo(String value) {
            addCriterion("browser_version <=", value, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionLike(String value) {
            addCriterion("browser_version like", value, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionNotLike(String value) {
            addCriterion("browser_version not like", value, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionIn(List<String> values) {
            addCriterion("browser_version in", values, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionNotIn(List<String> values) {
            addCriterion("browser_version not in", values, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionBetween(String value1, String value2) {
            addCriterion("browser_version between", value1, value2, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andBrowserVersionNotBetween(String value1, String value2) {
            addCriterion("browser_version not between", value1, value2, "browserVersion");
            return (Criteria) this;
        }

        public Criteria andEngineNameIsNull() {
            addCriterion("engine_name is null");
            return (Criteria) this;
        }

        public Criteria andEngineNameIsNotNull() {
            addCriterion("engine_name is not null");
            return (Criteria) this;
        }

        public Criteria andEngineNameEqualTo(String value) {
            addCriterion("engine_name =", value, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameNotEqualTo(String value) {
            addCriterion("engine_name <>", value, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameGreaterThan(String value) {
            addCriterion("engine_name >", value, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameGreaterThanOrEqualTo(String value) {
            addCriterion("engine_name >=", value, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameLessThan(String value) {
            addCriterion("engine_name <", value, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameLessThanOrEqualTo(String value) {
            addCriterion("engine_name <=", value, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameLike(String value) {
            addCriterion("engine_name like", value, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameNotLike(String value) {
            addCriterion("engine_name not like", value, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameIn(List<String> values) {
            addCriterion("engine_name in", values, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameNotIn(List<String> values) {
            addCriterion("engine_name not in", values, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameBetween(String value1, String value2) {
            addCriterion("engine_name between", value1, value2, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineNameNotBetween(String value1, String value2) {
            addCriterion("engine_name not between", value1, value2, "engineName");
            return (Criteria) this;
        }

        public Criteria andEngineVersionIsNull() {
            addCriterion("engine_version is null");
            return (Criteria) this;
        }

        public Criteria andEngineVersionIsNotNull() {
            addCriterion("engine_version is not null");
            return (Criteria) this;
        }

        public Criteria andEngineVersionEqualTo(String value) {
            addCriterion("engine_version =", value, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionNotEqualTo(String value) {
            addCriterion("engine_version <>", value, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionGreaterThan(String value) {
            addCriterion("engine_version >", value, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionGreaterThanOrEqualTo(String value) {
            addCriterion("engine_version >=", value, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionLessThan(String value) {
            addCriterion("engine_version <", value, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionLessThanOrEqualTo(String value) {
            addCriterion("engine_version <=", value, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionLike(String value) {
            addCriterion("engine_version like", value, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionNotLike(String value) {
            addCriterion("engine_version not like", value, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionIn(List<String> values) {
            addCriterion("engine_version in", values, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionNotIn(List<String> values) {
            addCriterion("engine_version not in", values, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionBetween(String value1, String value2) {
            addCriterion("engine_version between", value1, value2, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andEngineVersionNotBetween(String value1, String value2) {
            addCriterion("engine_version not between", value1, value2, "engineVersion");
            return (Criteria) this;
        }

        public Criteria andOsNameIsNull() {
            addCriterion("os_name is null");
            return (Criteria) this;
        }

        public Criteria andOsNameIsNotNull() {
            addCriterion("os_name is not null");
            return (Criteria) this;
        }

        public Criteria andOsNameEqualTo(String value) {
            addCriterion("os_name =", value, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameNotEqualTo(String value) {
            addCriterion("os_name <>", value, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameGreaterThan(String value) {
            addCriterion("os_name >", value, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameGreaterThanOrEqualTo(String value) {
            addCriterion("os_name >=", value, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameLessThan(String value) {
            addCriterion("os_name <", value, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameLessThanOrEqualTo(String value) {
            addCriterion("os_name <=", value, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameLike(String value) {
            addCriterion("os_name like", value, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameNotLike(String value) {
            addCriterion("os_name not like", value, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameIn(List<String> values) {
            addCriterion("os_name in", values, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameNotIn(List<String> values) {
            addCriterion("os_name not in", values, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameBetween(String value1, String value2) {
            addCriterion("os_name between", value1, value2, "osName");
            return (Criteria) this;
        }

        public Criteria andOsNameNotBetween(String value1, String value2) {
            addCriterion("os_name not between", value1, value2, "osName");
            return (Criteria) this;
        }

        public Criteria andOsVersionIsNull() {
            addCriterion("os_version is null");
            return (Criteria) this;
        }

        public Criteria andOsVersionIsNotNull() {
            addCriterion("os_version is not null");
            return (Criteria) this;
        }

        public Criteria andOsVersionEqualTo(String value) {
            addCriterion("os_version =", value, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionNotEqualTo(String value) {
            addCriterion("os_version <>", value, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionGreaterThan(String value) {
            addCriterion("os_version >", value, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionGreaterThanOrEqualTo(String value) {
            addCriterion("os_version >=", value, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionLessThan(String value) {
            addCriterion("os_version <", value, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionLessThanOrEqualTo(String value) {
            addCriterion("os_version <=", value, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionLike(String value) {
            addCriterion("os_version like", value, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionNotLike(String value) {
            addCriterion("os_version not like", value, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionIn(List<String> values) {
            addCriterion("os_version in", values, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionNotIn(List<String> values) {
            addCriterion("os_version not in", values, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionBetween(String value1, String value2) {
            addCriterion("os_version between", value1, value2, "osVersion");
            return (Criteria) this;
        }

        public Criteria andOsVersionNotBetween(String value1, String value2) {
            addCriterion("os_version not between", value1, value2, "osVersion");
            return (Criteria) this;
        }

        public Criteria andDeviceModelIsNull() {
            addCriterion("device_model is null");
            return (Criteria) this;
        }

        public Criteria andDeviceModelIsNotNull() {
            addCriterion("device_model is not null");
            return (Criteria) this;
        }

        public Criteria andDeviceModelEqualTo(String value) {
            addCriterion("device_model =", value, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelNotEqualTo(String value) {
            addCriterion("device_model <>", value, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelGreaterThan(String value) {
            addCriterion("device_model >", value, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelGreaterThanOrEqualTo(String value) {
            addCriterion("device_model >=", value, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelLessThan(String value) {
            addCriterion("device_model <", value, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelLessThanOrEqualTo(String value) {
            addCriterion("device_model <=", value, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelLike(String value) {
            addCriterion("device_model like", value, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelNotLike(String value) {
            addCriterion("device_model not like", value, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelIn(List<String> values) {
            addCriterion("device_model in", values, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelNotIn(List<String> values) {
            addCriterion("device_model not in", values, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelBetween(String value1, String value2) {
            addCriterion("device_model between", value1, value2, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceModelNotBetween(String value1, String value2) {
            addCriterion("device_model not between", value1, value2, "deviceModel");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeIsNull() {
            addCriterion("device_type is null");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeIsNotNull() {
            addCriterion("device_type is not null");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeEqualTo(String value) {
            addCriterion("device_type =", value, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeNotEqualTo(String value) {
            addCriterion("device_type <>", value, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeGreaterThan(String value) {
            addCriterion("device_type >", value, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeGreaterThanOrEqualTo(String value) {
            addCriterion("device_type >=", value, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeLessThan(String value) {
            addCriterion("device_type <", value, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeLessThanOrEqualTo(String value) {
            addCriterion("device_type <=", value, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeLike(String value) {
            addCriterion("device_type like", value, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeNotLike(String value) {
            addCriterion("device_type not like", value, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeIn(List<String> values) {
            addCriterion("device_type in", values, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeNotIn(List<String> values) {
            addCriterion("device_type not in", values, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeBetween(String value1, String value2) {
            addCriterion("device_type between", value1, value2, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceTypeNotBetween(String value1, String value2) {
            addCriterion("device_type not between", value1, value2, "deviceType");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorIsNull() {
            addCriterion("device_vendor is null");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorIsNotNull() {
            addCriterion("device_vendor is not null");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorEqualTo(String value) {
            addCriterion("device_vendor =", value, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorNotEqualTo(String value) {
            addCriterion("device_vendor <>", value, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorGreaterThan(String value) {
            addCriterion("device_vendor >", value, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorGreaterThanOrEqualTo(String value) {
            addCriterion("device_vendor >=", value, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorLessThan(String value) {
            addCriterion("device_vendor <", value, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorLessThanOrEqualTo(String value) {
            addCriterion("device_vendor <=", value, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorLike(String value) {
            addCriterion("device_vendor like", value, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorNotLike(String value) {
            addCriterion("device_vendor not like", value, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorIn(List<String> values) {
            addCriterion("device_vendor in", values, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorNotIn(List<String> values) {
            addCriterion("device_vendor not in", values, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorBetween(String value1, String value2) {
            addCriterion("device_vendor between", value1, value2, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andDeviceVendorNotBetween(String value1, String value2) {
            addCriterion("device_vendor not between", value1, value2, "deviceVendor");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureIsNull() {
            addCriterion("cpu_architecture is null");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureIsNotNull() {
            addCriterion("cpu_architecture is not null");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureEqualTo(String value) {
            addCriterion("cpu_architecture =", value, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureNotEqualTo(String value) {
            addCriterion("cpu_architecture <>", value, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureGreaterThan(String value) {
            addCriterion("cpu_architecture >", value, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureGreaterThanOrEqualTo(String value) {
            addCriterion("cpu_architecture >=", value, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureLessThan(String value) {
            addCriterion("cpu_architecture <", value, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureLessThanOrEqualTo(String value) {
            addCriterion("cpu_architecture <=", value, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureLike(String value) {
            addCriterion("cpu_architecture like", value, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureNotLike(String value) {
            addCriterion("cpu_architecture not like", value, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureIn(List<String> values) {
            addCriterion("cpu_architecture in", values, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureNotIn(List<String> values) {
            addCriterion("cpu_architecture not in", values, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureBetween(String value1, String value2) {
            addCriterion("cpu_architecture between", value1, value2, "cpuArchitecture");
            return (Criteria) this;
        }

        public Criteria andCpuArchitectureNotBetween(String value1, String value2) {
            addCriterion("cpu_architecture not between", value1, value2, "cpuArchitecture");
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
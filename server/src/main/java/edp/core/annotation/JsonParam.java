package edp.core.annotation;

import java.lang.annotation.*;

/**
 * 自定义Json 参数注解
 * 注解 参数
 * 获取http请求中的json参数
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface JsonParam {
    String value();
}

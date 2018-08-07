package edp.core.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 自定义 不验证token 注解
 * 注解在 controller 方法
 * 添加此注解后对应的方法/请求将不走验证token流程
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface AuthIgnore {
}

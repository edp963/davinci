package edp.davinci.core.inteceptor;

import edp.core.annotation.CurrentUser;
import edp.core.consts.Consts;
import edp.core.inteceptor.CurrentUserMethodArgumentResolverInterface;
import edp.davinci.model.User;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * @CurrentUser 注解 解析器
 */
public class CurrentUserMethodArgumentResolver implements CurrentUserMethodArgumentResolverInterface {
    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType().isAssignableFrom(User.class)
                && parameter.hasParameterAnnotation(CurrentUser.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        return  (User) webRequest.getAttribute(Consts.CURRENT_USER, RequestAttributes.SCOPE_REQUEST);
    }
}
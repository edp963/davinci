package edp.davinci.core.config;

import edp.core.config.OAuth2EnableCondition;
import edp.davinci.core.common.Constants;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@Conditional(value = OAuth2EnableCondition.class)
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers(Constants.BASE_API_PATH + "/login");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                .antMatchers(Constants.BASE_API_PATH + "/login").permitAll()
                .and().oauth2Login().loginPage("/")
                .and().logout().logoutUrl("/login/oauth2/logout").permitAll()
                .and().csrf().disable();
    }
}

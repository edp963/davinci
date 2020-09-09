package edp.davinci.server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TokenConfig {

    @Value("${jwtToken.secret:Pa@ss@Word}")
    private String tokenSecret;

    @Bean
    public String TOKEN_SECRET() {
        return tokenSecret;
    }

}

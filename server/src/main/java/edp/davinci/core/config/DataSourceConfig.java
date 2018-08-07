package edp.davinci.core.config;

import com.alibaba.druid.pool.DruidDataSource;
import com.github.pagehelper.PageInterceptor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Slf4j
@Configuration
@MapperScan("edp.davinci.dao.*Mapper")
@EnableTransactionManagement
public class DataSourceConfig {

    @Autowired
    private DruidDataSource druidDataSource;

    @Autowired
    private Environment environment;

    @Autowired
    private PageInterceptor pageInterceptor;

    @Bean
    @ConfigurationProperties(prefix = "mybatis.configuration")
    public org.apache.ibatis.session.Configuration globalConfiguration() {
        return new org.apache.ibatis.session.Configuration();
    }

    @Bean
    public SqlSessionFactory sqlSessionFactory() throws Exception {
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(druidDataSource);
        sqlSessionFactoryBean.setConfiguration(globalConfiguration());
        sqlSessionFactoryBean.setPlugins(new Interceptor[]{pageInterceptor});
        sqlSessionFactoryBean.setTypeAliasesPackage(environment.getProperty("mybatis.type-aliases-package"));
        sqlSessionFactoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources(environment.getProperty("mybatis.mapper-locations")));
        return sqlSessionFactoryBean.getObject();
    }

}

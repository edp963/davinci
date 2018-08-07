package edp.core.config;

import org.quartz.spi.JobFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;

@Configuration
public class SchedulerConfig {

    @Bean
    public JobFactory jobFactory(ApplicationContext applicationContext) {
        AutowireSpringBeanJobFactory beanJobFactory = new AutowireSpringBeanJobFactory();
        beanJobFactory.setApplicationContext(applicationContext);
        return beanJobFactory;
    }

    @Bean
    public SchedulerFactoryBean schedulerFactoryBean(JobFactory jobFactory) {
        SchedulerFactoryBean factory = new SchedulerFactoryBean();
        factory.setOverwriteExistingJobs(true);
        // 自定义JobFactory，用于Spring注入
        factory.setJobFactory(jobFactory);
        return factory;
    }
}

package edp;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("edp.davinci.dao")
public class DavinciServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DavinciServerApplication.class, args);
    }

}

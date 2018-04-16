/*-
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

package davinci

import edp.davinci.persistence.entities.CronJob
import edp.davinci.util.quartz.{EmailCronJobExecutor, QuartzManager}
import org.scalatest.FunSuite

class QuartzTest extends FunSuite{
  test("quartz"){
    var JOB_NAME = "动态任务调度"
    var TRIGGER_NAME = "动态任务触发器"


   val cronJob= CronJob(1,"haha","email","","0/1 * * * * ?","2018-03-28","2018-04-01","",Some(""),"",1,"","")
      try {
        System.out.println("【系统启动】开始(每1秒输出一次)...")
        QuartzManager.addJob(cronJob)
        Thread.sleep(5000)
        System.out.println("【修改时间】开始(每5秒输出一次)...")
        val cronJob2 =CronJob(1,"haha","email","","0/5 * * * * ?","2018-03-28","2018-04-01","",Some(""),"",1,"","")

        QuartzManager.modifyJob(cronJob2)
//        QuartzManager.addJob("job2", "job2", classOf[MyJob2], "0/2 * * * * ?")
        Thread.sleep(6000)
        System.out.println("【移除定时】开始...")
        QuartzManager.removeJob("1", "1")
        System.out.println("【移除定时】成功")
      } catch {
        case e: Exception =>
          e.printStackTrace()
      }
    }


}

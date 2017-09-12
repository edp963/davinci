/*-
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
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

package edp.davinci.util

import java.io.ByteArrayOutputStream

import edp.davinci.DavinciConstants.defaultEncode
import edp.davinci.csv.{CSVWriter, DefaultCSVFormat}

object MyConversions {

  implicit val defaultCSVFormat: DefaultCSVFormat = new DefaultCSVFormat {}

}

import edp.davinci.util.MyConversions._


object CommonUtils extends CommonUtils

trait CommonUtils {
  /**
    *
    * @param row a row in DB represent by string
    * @return a CSV String
    */
  def covert2CSV(row: Seq[String]): String = {
    val byteArrOS = new ByteArrayOutputStream()
    val writer = CSVWriter.open(byteArrOS)
    writer.writeRow(row)
    val CSVStr = byteArrOS.toString(defaultEncode)
    byteArrOS.close()
    writer.close()
    CSVStr
  }


}

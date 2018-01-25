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





package edp.davinci.util.common

import java.util.Properties
import javax.naming.directory.{InitialDirContext, SearchControls, SearchResult}
import javax.naming.{Context, NamingEnumeration}

import edp.davinci.ModuleInstance
import org.apache.log4j.Logger

import scala.util.{Failure, Success, Try}

object LdapValidate extends LdapValidate

trait LdapValidate {
  private lazy val logger = Logger.getLogger(this.getClass)
  private lazy val config = ModuleInstance.getModule.config
  private val ldapUser = config.getString("ldap.user")
  private val ldapPwd = config.getString("ldap.pwd")
  private val ldapUrl = config.getString("ldap.url")
  private val ldapDc = config.getString("ldap.dc")
  private val readTimeout = config.getString("ldap.read.timeout")
  private val connectTimeout = config.getString("ldap.connect.timeout")
  private val isEnable = config.getString("ldap.connect.pool")
  private var context: InitialDirContext = _

  def validate(username: String, password: String): Boolean = {
    try {
      propsSet(ldapUrl + ldapDc, ldapUser, ldapPwd)
      val controls: SearchControls = new SearchControls
      controls.setSearchScope(SearchControls.SUBTREE_SCOPE)
      val answers: NamingEnumeration[SearchResult] = context.search("", s"userPrincipalName=$username", controls)
      val nsName: String = answers.nextElement.getNameInNamespace
      val result = Try {
        this.propsSet(ldapUrl, nsName, password)
      }
      result match {
        case Success(_) => true
        case Failure(_) => false
      }
    } catch {
      case e: Throwable =>
        logger.error("LdapValidate failed===" + username + "," + password)
        logger.error("LdapValidate failed===", e)
        false
    } finally {
      context.close()
    }
  }

  private def propsSet(url: String, nsName: String, pwd: String) = {
    val props = new Properties
    props.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory")
    props.put(Context.PROVIDER_URL, url)
    props.put(Context.SECURITY_AUTHENTICATION, "simple")
    props.put(Context.SECURITY_PRINCIPAL, nsName)
    props.put(Context.SECURITY_CREDENTIALS, pwd)
    props.put("com.sun.jndi.ldap.read.timeout", readTimeout)
    props.put("com.sun.jndi.ldap.connect.timeout", connectTimeout)
    props.put("com.sun.jndi.ldap.connect.pool", isEnable)
    context = new InitialDirContext(props)
  }
}

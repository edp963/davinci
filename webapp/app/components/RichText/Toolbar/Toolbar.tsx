/*
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

import React from 'react'
import { EditorContext, useEditorContext } from '../context'

import Font from './Font'
import Heading from './Heading'
import Format from './Format'
import Alignment from './Alignment'
import Link from './Link'
import Image from './Image'
import Reset from './Reset'

import './Toolbar.less'

const Toolbar: React.FC = (props) => {
  const editorContextValue = useEditorContext()
  return (
    <div className="richtext-toolbar">
      <EditorContext.Provider value={editorContextValue}>
        {props.children ? (
          props.children
        ) : (
          <>
            <Font />
            <Heading />
            <Format />
            <Alignment />
            <Link />
            <Image />
            <Reset />
          </>
        )}
      </EditorContext.Provider>
    </div>
  )
}

export default Toolbar

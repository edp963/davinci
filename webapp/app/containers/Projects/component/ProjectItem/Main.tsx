
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


import React, { useCallback, useMemo } from 'react'
import { Tag } from 'antd'
import Toolbar  from './Toolbar'
import { IProjectItem, ItemToolbarProps } from './type'
const styles = require('./item.less')




const ProjectItem: React.FC<IProjectItem> & {Toolbar: React.FC<ItemToolbarProps>} = ({
  tags, backgroundImg, title, description, onClick, style, children
}) => {

  const handleClick: React.MouseEventHandler<HTMLDivElement> = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      onClick && (onClick as React.MouseEventHandler<HTMLElement>)(e)
    }, 
  [onClick])

  const getBackgroundImg:React.CSSProperties = useMemo(() => {
    return {
      backgroundImage: backgroundImg
    }
  }, [backgroundImg])

  const getTags: React.ReactNode[] = useMemo(() => {
    return tags && tags.length > 0 ? tags.map((tag) => {
      return <Tag color={tag.color} key={`${tag.text}tagkey`}>{tag.text}</Tag>
    }) : []
  }, [tags])

  const body: React.ReactNode = useMemo(() => {
    return children ? (
      <div className={styles.itemToolbar}>
        {children}
      </div>
    ) : []
  }, [children])

  return (
    <div className={styles.unit}
      style={style}
      onClick={handleClick}
    >
      <div
        className={styles.thumbnail}
        style={getBackgroundImg}
      >
        <header>
          <div className={styles.tags}>
            {getTags}
          </div>
          <h3 className={styles.title}>
            {title ? title : ''}
          </h3>
          <p className={styles.descs}>
            {description ? description : ''}
          </p>
        </header>
      </div>
      {
        body
      }
    </div>
  )
}

ProjectItem.Toolbar = Toolbar

export default ProjectItem
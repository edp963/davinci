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

import React, { PureComponent } from 'react'

import styles from './Login.less'

export class Banner extends PureComponent {

  componentDidMount () {
    const cubes = document.querySelectorAll(`.${styles.cube}`)
    const cubeLength = cubes.length

    this.interval = setInterval(() => {
      const rollingOnTime = Math.round(Math.random() * 5000)
      const rollingBackTime = Math.round(Math.random() * 55000) + 5000

      setTimeout(() => {
        const magicNumber = Math.floor(Math.random() * cubeLength)
        const chosen = cubes[magicNumber]
        const ror = Math.random() > 0.5 ? styles.cubeRock : styles.cubeRoll
        chosen.classList.add(ror)

        setTimeout(() => {
          chosen.classList.remove(ror)
        }, rollingBackTime)
      }, rollingOnTime)
    }, 1000)
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  render () {
    const cubePositions = {
      d: [2, 7, 2, 2, 5],
      a: [3, 2, 2, 2, 3],
      v: [3, 1, 1, 1, 3],
      i1: [2, 2, 7, 2, 2],
      n: [7, 1, 1, 1, 7],
      c: [5, 2, 2, 2, 2],
      i2: [2, 2, 7, 2, 2]
    }

    const polyfillPositions = {
      a: 4,
      v: 4,
      n: 2
    }

    const cubes = (k) => cubePositions[k].map((num, numIndex) =>
      Array.from(Array(num))
        .map((c, index) => (
          <div
            key={`${k}-${numIndex}-${index}`}
            className={`${styles.cube} ${styles[`${k}-${numIndex + 1}-${index + 1}`]}`}
          >
            <div className={styles.front}></div>
            <div className={styles.back}></div>
            <div className={styles.top}></div>
            <div className={styles.bottom}></div>
            <div className={styles.left}></div>
            <div className={styles.right}></div>
          </div>
        ))
    )

    const polyfills = (k) => polyfillPositions[k]
      ? Array.from(Array(polyfillPositions[k]))
        .map((pfp, index) => (
          <div
            key={`${k}-pf-${index}`}
            className={`${styles.cube} ${styles[`${k}-p-${index + 1}`]}`}
          >
            <div className={styles.front}></div>
            <div className={styles.back}></div>
            <div className={styles.top}></div>
            <div className={styles.bottom}></div>
            <div className={styles.left}></div>
            <div className={styles.right}></div>
          </div>
        ))
      : ''

    const words = Object.keys(cubePositions).map(k => (
      <div
        key={k}
        className={`${styles.word} ${styles[k]}`}
      >
        {cubes(k)}
        {polyfills(k)}
      </div>
    ))

    return (
      <div className={styles.banner}>
        {words}
      </div>
    )
  }
}

export default Banner

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

import * as React from 'react'

import { DEFAULT_SECONDARY_COLOR } from '../../globalConstants'
const styles = require('./Background.less')

declare interface IWindow extends Window {
  THREE: any
}
declare const window: IWindow

export class Canvas extends React.Component<{}, {}> {
  constructor (props) {
    super(props)
  }

  private removeListeners: () => any = null
  private container: any = null

  public componentDidMount () {
    import('three')
      .then((_) => {
        window.THREE = _
        Promise.all([
          import('three/examples/js/renderers/Projector'),
          import('three/examples/js/renderers/CanvasRenderer')
        ]).then(() => {
          this.drawBackground()
        })
      })
  }

  public componentWillUnmount () {
    this.removeListeners()
  }

  private drawBackground = () => {
    const THREE = window.THREE
    const SEPARATION = 100
    const AMOUNTX = 50
    const AMOUNTY = 50

    let camera
    let scene
    let renderer

    let particles
    let particle
    let count = 0

    let mouseX = 0
    let mouseY = 0

    let windowHalfX = window.innerWidth / 2
    let windowHalfY = window.innerHeight / 2

    const init = () => {
      const container = this.container

      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
      camera.position.z = 1000
      scene = new THREE.Scene()

      particles = []

      const PI2 = Math.PI * 2
      const material = new THREE.SpriteCanvasMaterial({
        color: 0xffffff,
        program: (context) => {
          context.beginPath()
          context.arc(0, 0, 1, 0, PI2, true)
          context.fill()
        }
      })

      let i = 0
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          particle = particles[i++] = new THREE.Sprite(material)
          particle.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2)
          particle.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2)
          scene.add(particle)
        }
      }

      renderer = new THREE.CanvasRenderer()
      renderer.setPixelRatio(window.devicePixelRatio || 1)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setClearColor(parseInt(DEFAULT_SECONDARY_COLOR.substr(1), 16))
      container.appendChild(renderer.domElement)

      document.addEventListener('mousemove', onDocumentMouseMove, false)
      container.addEventListener('touchstart', onDocumentTouchStart, false)
      container.addEventListener('touchmove', onDocumentTouchMove, false)

      window.addEventListener('resize', onWindowResize, false)

      this.removeListeners = () => {
        document.removeEventListener('mousemove', onDocumentMouseMove, false)
        container.removeEventListener('touchstart', onDocumentTouchStart, false)
        container.removeEventListener('touchmove', onDocumentTouchMove, false)
        window.removeEventListener('resize', onWindowResize, false)
      }
    }

    function onWindowResize () {
      windowHalfX = window.innerWidth / 2
      windowHalfY = window.innerHeight / 2

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    function onDocumentMouseMove (event) {
      mouseX = event.clientX - windowHalfX
      mouseY = event.clientY - windowHalfY
    }

    function onDocumentTouchStart (event) {
      if (event.touches.length === 1) {
        event.preventDefault()
        mouseX = event.touches[ 0 ].pageX - windowHalfX
        mouseY = event.touches[ 0 ].pageY - windowHalfY
      }
    }

    function onDocumentTouchMove (event) {
      if (event.touches.length === 1) {
        event.preventDefault()
        mouseX = event.touches[ 0 ].pageX - windowHalfX
        mouseY = event.touches[ 0 ].pageY - windowHalfY
      }
    }

    function animate () {
      requestAnimationFrame(animate)
      render()
    }

    function render () {
      camera.position.x += (mouseX - camera.position.x) * 0.05
      camera.position.y += (-mouseY - camera.position.y) * 0.05
      camera.lookAt(scene.position)

      let i = 0
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          particle = particles[ i++ ]
          particle.position.y = (Math.sin((ix + count) * 0.3) * 50) + (Math.sin((iy + count) * 0.5) * 50) - 120
          particle.scale.x = particle.scale.y = (Math.sin((ix + count) * 0.3) + 1) * 2 + (Math.sin((iy + count) * 0.5) + 1) * 2
        }
      }

      renderer.render(scene, camera)
      count += 0.1
    }

    init()
    animate()
  }

  public render () {
    return (
      <div ref={(f) => this.container = f} className={styles.background} />
    )
  }
}

export default Canvas

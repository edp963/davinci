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
import { DEFAULT_SECONDARY_COLOR } from 'app/globalConstants'
const styles = require('./Background.less')

export class Canvas extends React.Component<{}, {}> {
  constructor (props) {
    super(props)
  }

  private removeListeners: () => any = null
  private container = React.createRef<HTMLDivElement>()

  public componentDidMount () {
    // TODO to verify the performance under one or multiple chunks
    Promise.all([
      import('three/src/cameras/PerspectiveCamera'),
      import('three/src/scenes/Scene'),
      import('three/src/core/BufferAttribute'),
      import('three/src/core/BufferGeometry'),
      import('three/src/math/Color'),
      import('three/src/objects/Points'),
      import('three/src/materials/ShaderMaterial'),
      import('three/src/renderers/WebGLRenderer')
    ]).then(([...args]) => {
      this.drawBackground(args)
    })
  }

  public componentWillUnmount () {
    if (this.removeListeners) {
      this.removeListeners()
    }
  }

  private drawBackground = (modules: any[]) => {
    const [{ PerspectiveCamera }, { Scene }, { BufferAttribute }, { BufferGeometry }, { Color }, { Points }, { ShaderMaterial }, { WebGLRenderer }] = modules
    const SEPARATION = 100
    const AMOUNTX = 50
    const AMOUNTY = 50

    let camera
    let scene
    let renderer

    let particles
    let count = 0

    let mouseX = 0
    let mouseY = 0

    let windowHalfX = window.innerWidth / 2
    let windowHalfY = window.innerHeight / 2

    const init = () => {
      const container = this.container.current

      camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
      camera.position.z = 1000
      scene = new Scene()

      const numParticles = AMOUNTX * AMOUNTY
      const positions = new Float32Array(numParticles * 3)
      const scales = new Float32Array(numParticles)

      let i = 0
      let j = 0

      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2) // x
          positions[i + 1] = 0 // y
          positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2) // z
          scales[j] = 1
          i += 3
          j++
        }
      }

      const geometry = new BufferGeometry()
      geometry.addAttribute('position', new BufferAttribute(positions, 3))
      geometry.addAttribute('scale', new BufferAttribute(scales, 1))
      const material = new ShaderMaterial({
        uniforms: {
          color: {
            value: new Color(0xffffff)
          }
        },
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent
      })
      //
      particles = new Points(geometry, material)
      scene.add(particles)

      renderer = new WebGLRenderer({ antialias: true })
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
        mouseX = event.touches[0].pageX - windowHalfX
        mouseY = event.touches[0].pageY - windowHalfY
      }
    }

    function onDocumentTouchMove (event) {
      if (event.touches.length === 1) {
        event.preventDefault()
        mouseX = event.touches[0].pageX - windowHalfX
        mouseY = event.touches[0].pageY - windowHalfY
      }
    }

    function animate () {
      requestAnimationFrame(animate)
      render()
    }

    function render () {
      camera.position.x += (mouseX - camera.position.x) * .05
      camera.position.y += (-mouseY - camera.position.y) * .05
      camera.lookAt(scene.position)
      const positions = particles.geometry.attributes.position.array
      const scales = particles.geometry.attributes.scale.array

      let i = 0
      let j = 0
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
            (Math.sin((iy + count) * 0.5) * 50)
          scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 8 +
            (Math.sin((iy + count) * 0.5) + 1) * 8
          i += 3
          j++
        }
      }

      particles.geometry.attributes.position.needsUpdate = true
      particles.geometry.attributes.scale.needsUpdate = true

      renderer.render(scene, camera)
      count += 0.1
    }

    init()
    animate()
  }

  public render () {
    return (
      <div ref={this.container} className={styles.background}/>
    )
  }
}

export default Canvas

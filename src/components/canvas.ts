import * as THREE from 'three'
import { Dimensions, Size } from '../types/types'

import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'
import Media from './media'

export default class Canvas {
  element: HTMLCanvasElement
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  sizes: Size
  dimensions: Dimensions
  time: number
  clock: THREE.Clock
  medias: Media[]

  constructor() {
    this.element = document.getElementById('webgl') as HTMLCanvasElement
    this.time = 0
    this.medias = []
    this.createClock()
    this.createScene()
    this.createCamera()
    this.createRenderer()
    this.setSizes()
    this.addEventListeners()
    this.createMedias()
  }

  createScene() {
    this.scene = new THREE.Scene()
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
    this.scene.add(this.camera)
    this.camera.position.z = 10
  }

  createRenderer() {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    }

    this.renderer = new THREE.WebGLRenderer({ canvas: this.element, alpha: true })
    this.renderer.setSize(this.dimensions.width, this.dimensions.height)
    this.renderer.render(this.scene, this.camera)

    this.renderer.setPixelRatio(this.dimensions.pixelRatio)
  }

  setSizes() {
    let fov = this.camera.fov * (Math.PI / 180)
    let height = this.camera.position.z * Math.tan(fov / 2) * 2
    let width = height * this.camera.aspect

    this.sizes = {
      width: width,
      height: height,
    }
  }

  createClock() {
    this.clock = new THREE.Clock()
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this))
  }

  onResize() {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    }

    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.setSizes()

    this.renderer.setPixelRatio(this.dimensions.pixelRatio)
    this.renderer.setSize(this.dimensions.width, this.dimensions.height)

    this.medias.forEach((media) => {
      media.onResize(this.sizes)
    })
  }

  createDebugMesh() {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 5),
      new THREE.ShaderMaterial({ vertexShader, fragmentShader })
    )

    this.scene.add(mesh)
  }

  getTime() {
    return this.time
  }

  createMedias() {
    const images = document.querySelectorAll('img')
    images.forEach((image) => {
      const media = new Media({
        element: image,
        scene: this.scene,
        sizes: this.sizes,
      })

      this.medias.push(media)
    })
  }

  render(scroll: number) {
    this.time = this.clock.getElapsedTime()

    this.medias.forEach((media) => {
      media.updateScroll(scroll)
    })

    this.renderer.render(this.scene, this.camera)
  }
}

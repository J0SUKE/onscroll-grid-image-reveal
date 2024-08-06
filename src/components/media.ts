import { Position, Size } from '../types/types'
import * as THREE from 'three'
import gsap from 'gsap'

import vertexShader from '../shaders/vertex.glsl'
import fragmentShader from '../shaders/fragment.glsl'

interface Props {
  element: HTMLImageElement
  scene: THREE.Scene
  sizes: Size
}

export default class Media {
  element: HTMLImageElement
  scene: THREE.Scene
  sizes: Size
  material: THREE.ShaderMaterial
  geometry: THREE.PlaneGeometry
  mesh: THREE.Mesh
  nodeDimensions: Size
  meshDimensions: Size
  meshPostion: Position
  elementBounds: DOMRect
  currentScroll: number
  lastScroll: number
  scrollSpeed: number
  observer: IntersectionObserver

  constructor({ element, scene, sizes }: Props) {
    this.element = element
    this.scene = scene
    this.sizes = sizes

    this.currentScroll = 0
    this.lastScroll = 0
    this.scrollSpeed = 0

    this.createGeometry()
    this.createMaterial()
    this.createMesh()
    this.setNodeBounds()
    this.setMeshDimensions()
    this.setMeshPosition()

    this.setTexture()

    this.scene.add(this.mesh)
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1)
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: new THREE.Uniform(new THREE.Vector4()),
        uResolution: new THREE.Uniform(new THREE.Vector2(0, 0)),
        uProgress: new THREE.Uniform(0),
        uColor: new THREE.Uniform(new THREE.Color('#242424')),
      },
    })
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
  }

  setNodeBounds() {
    this.elementBounds = this.element.getBoundingClientRect()

    this.nodeDimensions = {
      width: this.elementBounds.width,
      height: this.elementBounds.height,
    }
  }

  setMeshDimensions() {
    this.meshDimensions = {
      width: (this.nodeDimensions.width * this.sizes.width) / window.innerWidth,
      height: (this.nodeDimensions.height * this.sizes.height) / window.innerHeight,
    }

    this.mesh.scale.x = this.meshDimensions.width
    this.mesh.scale.y = this.meshDimensions.height
  }

  setMeshPosition() {
    this.meshPostion = {
      x: (this.elementBounds.left * this.sizes.width) / window.innerWidth,
      y: (-this.elementBounds.top * this.sizes.height) / window.innerHeight,
    }

    this.meshPostion.x -= this.sizes.width / 2
    this.meshPostion.x += this.meshDimensions.width / 2

    this.meshPostion.y -= this.meshDimensions.height / 2
    this.meshPostion.y += this.sizes.height / 2

    this.mesh.position.x = this.meshPostion.x
    this.mesh.position.y = this.meshPostion.y
  }

  setTexture() {
    this.material.uniforms.uTexture.value = new THREE.TextureLoader().load(this.element.src, ({ image }) => {
      const { naturalWidth, naturalHeight } = image

      this.material.uniforms.uResolution.value = new THREE.Vector2(naturalWidth, naturalHeight)
      this.observe()
    })
  }

  updateScroll(scrollY: number) {
    this.currentScroll = (-scrollY * this.sizes.height) / window.innerHeight

    const deltaScroll = this.currentScroll - this.lastScroll
    this.lastScroll = this.currentScroll

    this.updateY(deltaScroll)
  }

  updateY(deltaScroll: number) {
    this.meshPostion.y -= deltaScroll
    this.mesh.position.y = this.meshPostion.y
  }

  onVisible() {
    gsap.to(this.material.uniforms.uProgress, {
      value: 1,
      duration: 1.6,
      ease: 'linear',
    })
  }

  onInvisible() {
    gsap.set(this.material.uniforms.uProgress, {
      value: 0,
    })
  }

  observe() {
    this.observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting

        if (isVisible) {
          this.onVisible()
        } else {
          this.onInvisible()
        }
      },
      {
        threshold: 0,
      }
    )

    this.observer.observe(this.element)
  }

  onResize(sizes: Size) {
    this.sizes = sizes

    this.setNodeBounds()
    this.setMeshDimensions()
    this.setMeshPosition()
  }
}

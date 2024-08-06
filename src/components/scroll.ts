import Lenis from 'lenis'
import '../lenis.css'

export default class Scroll {
  lenis: Lenis
  scroll: number

  constructor() {
    this.scroll = 0
    this.lenis = new Lenis()

    this.lenis.on('scroll', (e: Lenis) => {
      this.scroll = e.scroll as number
    })

    requestAnimationFrame(this.raf.bind(this))

    window.addEventListener('resize', () => {
      this.lenis.resize()
    })
  }

  getScroll() {
    return this.scroll
  }

  raf(time: number) {
    this.lenis.raf(time)
    requestAnimationFrame(this.raf.bind(this))
  }
}

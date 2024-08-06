import './style.css'
import Canvas from './components/canvas'
import Scroll from './components/scroll'

class App {
  canvas: Canvas
  scroll: Scroll

  constructor() {
    this.scroll = new Scroll()
    this.canvas = new Canvas()

    this.render()
  }

  render() {
    const s = this.scroll.getScroll()

    this.canvas.render(s)

    requestAnimationFrame(this.render.bind(this))
  }
}

export default new App()

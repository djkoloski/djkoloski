let vec2 = window.vec2

window.onload = () => {
  const example1 = new Example1(
    'example1',
    800, 400,
    vec2.fromValues(0, -0.5),
    100,
    CubicCurve.FromBezier([
      vec2.fromValues(-1, 0),
      vec2.fromValues(-1, 1),
      vec2.fromValues(1, 1),
      vec2.fromValues(1, 0)
    ]))
  example1.render()

  const example2 = new Example2(
    'example2',
    800, 400,
    vec2.fromValues(0, 0),
    100,
    CubicCurve.FromBezier([
      vec2.fromValues(-2, 0),
      vec2.fromValues(-2, 1),
      vec2.fromValues(0, 1),
      vec2.fromValues(0, 0)
    ]),
    CubicCurve.FromBezier([
      vec2.fromValues(0, 0),
      vec2.fromValues(0, -1),
      vec2.fromValues(2, -1),
      vec2.fromValues(2, 0)
    ]))
  example2.render()
}

class Graph {
  constructor (id, width, height, position, scale) {
    this.canvas = document.getElementById(id)
    this.canvas.width = width
    this.canvas.height = height
    this.context = this.canvas.getContext('2d')

    this.position = vec2.clone(position)
    this.scale = scale

    this.canvas.addEventListener('wheel', this.onWheel.bind(this))

    this.dragHandler = null
    this.dragPosition = null
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this))
  }

  render () {
    this.context.setTransform(1, 0, 0, 1, 0, 0)
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.context.setTransform(
      this.scale, 0,
      0, -this.scale,
      -this.position[0] * this.scale + this.canvas.width / 2, this.position[1] * this.scale + this.canvas.height / 2
    )

    this.context.lineWidth = 1 / this.scale

    // Render gridlines
    const kMajorGridInterval = 10
    const kMajorGridColor = 'rgba(0,0,0,0.4)'
    const kMinorGridColor = 'rgba(0,0,0,0.2)'

    const halfSize = vec2.fromValues(this.canvas.width, this.canvas.height)
    vec2.scale(halfSize, halfSize, 0.5 / this.scale)

    const lowerLeft = vec2.create()
    vec2.sub(lowerLeft, this.position, halfSize)
    vec2.ceil(lowerLeft, lowerLeft)

    const upperRight = vec2.create()
    vec2.add(upperRight, this.position, halfSize)
    vec2.floor(upperRight, upperRight)

    this.context.beginPath()

    for (let x = lowerLeft[0]; x <= upperRight[0]; ++x) {
      if (x % kMajorGridInterval === 0) {
        continue
      }

      this.context.moveTo(x, lowerLeft[1] - 1)
      this.context.lineTo(x, upperRight[1] + 1)
    }

    for (let y = lowerLeft[1]; y <= upperRight[1]; ++y) {
      if (y % kMajorGridInterval === 0) {
        continue
      }

      this.context.moveTo(lowerLeft[0] - 1, y)
      this.context.lineTo(upperRight[0] + 1, y)
    }

    this.context.strokeStyle = kMinorGridColor
    this.context.stroke()

    this.context.beginPath()

    for (let x = Math.ceil(lowerLeft[0] / kMajorGridInterval) * kMajorGridInterval; x <= upperRight[0]; x += kMajorGridInterval) {
      this.context.moveTo(x, lowerLeft[1] - 1)
      this.context.lineTo(x, upperRight[1] + 1)
    }

    for (let y = Math.ceil(lowerLeft[1] / kMajorGridInterval) * kMajorGridInterval; y <= upperRight[1]; y += kMajorGridInterval) {
      this.context.moveTo(lowerLeft[0] - 1, y)
      this.context.lineTo(upperRight[0] + 1, y)
    }

    this.context.strokeStyle = kMajorGridColor
    this.context.lineWidth *= 1.5
    this.context.stroke()
    this.context.lineWidth /= 1.5
  }

  movePosition (delta) {
    vec2.sub(this.position, this.position, delta)
    this.render()
  }

  onDrag (position) {
    return this.movePosition.bind(this)
  }

  onWheel (event) {
    const maxScale = 400
    const minScale = 10

    let mod = 1 - event.deltaY / 25
    this.scale = Math.max(Math.min(this.scale * mod, maxScale), minScale)
    this.render()

    event.preventDefault()
  }

  onMouseDown (event) {
    this.dragHandler = this.onDrag(
      vec2.fromValues(
        (event.pageX - this.canvas.offsetLeft - this.canvas.width / 2) / this.scale + this.position[0],
        -(event.pageY - this.canvas.offsetTop - this.canvas.height / 2) / this.scale + this.position[1]))
    this.dragPosition = [event.screenX, event.screenY]
  }

  onMouseMove (event) {
    if (this.dragHandler != null) {
      let delta = vec2.fromValues(
        (event.screenX - this.dragPosition[0]) / this.scale,
        -(event.screenY - this.dragPosition[1]) / this.scale
      )
      this.dragPosition[0] = event.screenX
      this.dragPosition[1] = event.screenY

      this.dragHandler(delta)
    }
  }

  onMouseUp (event) {
    if (this.dragHandler != null) {
      this.dragHandler = null
      this.dragPosition = null
    }
  }

  onMouseLeave (event) {
    if (this.dragHandler != null) {
      this.dragHandler = null
      this.dragPosition = null
    }
  }
}

class CubicCurve {
  constructor (p) {
    this.p = p
  }

  clone () {
    return new CubicCurve([
      vec2.clone(this.p[0]),
      vec2.clone(this.p[1]),
      vec2.clone(this.p[2]),
      vec2.clone(this.p[3])
    ])
  }

  bezier () {
    return CubicCurve.ConvertParametricToBezier(this.p)
  }

  evaluate (t) {
    let result = vec2.clone(this.p[0])
    vec2.scaleAndAdd(result, result, this.p[1], t)
    vec2.scaleAndAdd(result, result, this.p[2], t * t)
    vec2.scaleAndAdd(result, result, this.p[3], t * t * t)
    return result
  }

  evaluateFirstDerivative (t) {
    let result = vec2.clone(this.p[1])
    vec2.scaleAndAdd(result, result, this.p[2], 2 * t)
    vec2.scaleAndAdd(result, result, this.p[3], 3 * t * t)
    return result
  }

  evaluateSecondDerivative (t) {
    let result = vec2.create()
    vec2.scaleAndAdd(result, result, this.p[2], 2)
    vec2.scaleAndAdd(result, result, this.p[3], 6 * t)
    return result
  }

  evaluateThirdDerivative (t) {
    let result = vec2.create()
    vec2.scaleAndAdd(result, result, this.p[3], 6)
    return result
  }

  reparameterize (left, right) {
    let newX = [
      this.evaluate(left),
      this.evaluateFirstDerivative(left),
      this.evaluateSecondDerivative(left),
      this.evaluateThirdDerivative(left)
    ]
    vec2.scale(newX[1], newX[1], right)
    vec2.scale(newX[2], newX[2], right * right / 2)
    vec2.scale(newX[3], newX[3], right * right * right / 6)
    return new CubicCurve(newX)
  }

  render (graph, renderHandles = false) {
    const b = this.bezier()

    graph.context.beginPath()
    graph.context.moveTo(b[0][0], b[0][1])
    graph.context.bezierCurveTo(
      b[1][0], b[1][1],
      b[2][0], b[2][1],
      b[3][0], b[3][1]
    )
    graph.context.stroke()

    if (renderHandles) {
      graph.context.beginPath()
      graph.context.arc(b[0][0], b[0][1], CubicCurve.HandleRadius / graph.scale, 0, 2 * Math.PI)
      graph.context.stroke()

      graph.context.beginPath()
      graph.context.arc(b[1][0], b[1][1], CubicCurve.HandleRadius / graph.scale, 0, 2 * Math.PI)
      graph.context.stroke()

      graph.context.beginPath()
      graph.context.arc(b[2][0], b[2][1], CubicCurve.HandleRadius / graph.scale, 0, 2 * Math.PI)
      graph.context.stroke()

      graph.context.beginPath()
      graph.context.arc(b[3][0], b[3][1], CubicCurve.HandleRadius / graph.scale, 0, 2 * Math.PI)
      graph.context.stroke()
    }
  }

  onDrag (graph, position) {
    const b = this.bezier()

    for (let i = 0; i < 4; ++i) {
      const d = vec2.create()
      vec2.sub(d, b[i], position)
      if (vec2.len(d) < CubicCurve.HandleRadius / graph.scale) {
        return (delta) => {
          vec2.add(b[i], b[i], delta)
          this.p = CubicCurve.ConvertBezierToParametric(b)
          graph.render()
        }
      }
    }

    return null
  }
}
CubicCurve.HandleRadius = 8
CubicCurve.ConvertBezierToParametric = (b) => {
  const x0 = vec2.clone(b[0])

  const x1 = vec2.create()
  vec2.scaleAndAdd(x1, x1, b[0], -3)
  vec2.scaleAndAdd(x1, x1, b[1], 3)

  const x2 = vec2.create()
  vec2.scaleAndAdd(x2, x2, b[0], 3)
  vec2.scaleAndAdd(x2, x2, b[1], -6)
  vec2.scaleAndAdd(x2, x2, b[2], 3)

  const x3 = vec2.create()
  vec2.scaleAndAdd(x3, x3, b[0], -1)
  vec2.scaleAndAdd(x3, x3, b[1], 3)
  vec2.scaleAndAdd(x3, x3, b[2], -3)
  vec2.scaleAndAdd(x3, x3, b[3], 1)

  return [x0, x1, x2, x3]
}
CubicCurve.ConvertParametricToBezier = (x) => {
  const b0 = vec2.clone(x[0])

  const b1 = vec2.clone(x[0])
  vec2.scaleAndAdd(b1, b1, x[1], 1 / 3)

  const b2 = vec2.clone(x[0])
  vec2.scaleAndAdd(b2, b2, x[1], 2 / 3)
  vec2.scaleAndAdd(b2, b2, x[2], 1 / 3)

  const b3 = vec2.clone(x[0])
  vec2.add(b3, b3, x[1])
  vec2.add(b3, b3, x[2])
  vec2.add(b3, b3, x[3])

  return [b0, b1, b2, b3]
}
CubicCurve.FromBezier = (b) => {
  return new CubicCurve(CubicCurve.ConvertBezierToParametric(b))
}

class ExampleBase extends Graph {
  constructor (id, width, height, position, scale) {
    super(id, width, height, position, scale)

    this.originalPosition = position
    this.originalScale = scale

    let reset = document.getElementById(id + '-reset')
    reset.addEventListener('click', () => {
      this.reset()
      this.render()
    })
  }

  reset () {
    this.position = vec2.clone(this.originalPosition)
    this.scale = this.originalScale
  }
}

class Example1 extends ExampleBase {
  constructor (id, width, height, position, scale, curve) {
    super(id, width, height, position, scale)

    this.originalCurve = curve
    this.curve = curve.clone()

    this.showEntireCurve = document.getElementById(id + '-showentirecurve')
    this.showEntireCurve.addEventListener('input', this.render.bind(this))
  }

  render () {
    super.render()

    if (this.showEntireCurve.checked) {
      this.context.strokeStyle = 'blue'
      this.context.setLineDash([0.25, 0.25])
      this.curve.reparameterize(-5, 11).render(this)
    }

    this.context.strokeStyle = 'red'
    this.context.setLineDash([])
    this.curve.render(this, true)
  }

  reset () {
    super.reset()
    this.curve = this.originalCurve.clone()
  }

  onDrag (position) {
    return this.curve.onDrag(this, position) || super.onDrag(position)
  }
}

class Example2 extends Example1 {
  constructor (id, width, height, position, scale, curve1, curve2) {
    super(id, width, height, position, scale, curve1)

    this.originalCurve2 = curve2
    this.curve2 = curve2.clone()
  }

  render () {
    super.render()

    if (this.showEntireCurve.checked) {
      this.context.strokeStyle = 'blue'
      this.context.setLineDash([0.25, 0.25])
      this.curve2.reparameterize(-5, 11).render(this)
    }

    this.context.strokeStyle = 'red'
    this.context.setLineDash([])
    this.curve2.render(this, true)
  }

  reset () {
    super.reset()
    this.curve2 = this.originalCurve2.clone()
  }

  onDrag (position) {
    return this.curve2.onDrag(this, position) || super.onDrag(position)
  }
}

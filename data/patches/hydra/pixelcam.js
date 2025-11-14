bpm = 8
speed = bpm / 60


s0.initCam()

src(s0)
  .pixelate(80, 60)
  .posterize(8)
  .contrast(1)
  .saturate(0.1)
  .thresh(0.3)
  .colorama(() => {
    const phase = time * speed * 2 * Math.PI
    return 0.5 - 0.5 * Math.cos(phase)
  })
  .out()

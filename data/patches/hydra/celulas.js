bpm=160

s0.initCam()
  
src(s0)
  .modulate(noise(10,0.1),0.5)
  .colorama([0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6].smooth())
  .saturate(1.8)
  .contrast(1.6)
  .hue(.3)
  .blend(o0,0.5)
  .rotate(0,0.02)
  
.out(o0)
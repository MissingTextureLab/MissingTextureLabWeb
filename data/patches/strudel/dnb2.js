export default `
//Coding DnB/Jungle 2 by @MissingTexture_Lab

samples('github:tidalcycles/dirt-samples')
samples('github:yaxu/clean-breaks')
await initHydra()
let bpms = 160

let bpm = 160
let t = () => time * (bpm / 60) 


s0.initCam()


osc(10, 0.02, 1.2)
  .rotate(() => 0.1 * Math.sin(t()/8), () => 0.2 * Math.cos(t()/6))
  .modulate(osc(3, 0.1, 0.8).rotate(() => t()/16), 0.3)
  .color(0.2, -0.5, 0.9)
  .blend(o0, 0.7)
  .modulateScale(noise(2, 0.3), 0.3)
  .diff(o0, 0.4)
  .mult(src(s0).scale(1.1).kaleid(5).contrast(1.2), 0.6)
  .luma(0.3, 0.2)
  .modulateRotate(osc(0.1).kaleid(3), 0.3)
  .scale(() => 1.02 + 0.02*Math.sin(t()/2))
  .out(o0)


src(o0)
  .diff(osc(1.5,0.02,2).rotate(() => t()/8))
  .modulate(noise(3,0.4))
  .colorama(0.4)
  .contrast(1.5)
  .scale(1.001)
  .blend(o0,0.85)
  .out(o1)


src(o1)
  .add(src(s0)
       .posterize(8)
       .contrast(1.3)
       .hue(() => t()/10)
       .luma(0.4,0.1),
       0.3)
  .modulateRotate(osc(3,0.1,1.5).kaleid(9), () => 0.2 * Math.sin(t()/4))
  .colorama(() => 0.3 + 0.2*Math.sin(t()/2))
  .saturate(1.2)
  .blend(o0, 0.5)
  .out()

// Music ---->

n(0).s("saw").gain(0)

let seq1 = "< 4@3 4@5 2@3 4@1 3@2 6@2 >*8" // straight ahead
let seq2 = "< 0@3 <0 3>@5 2@3 2@3 4@2 >*8" // alt slices every2 bars

let break1 = s("amen:0/4")  .fit().scrub(seq2.div(8))
let break2 = s("sesame:0/1").fit().scrub(seq2.div(8))
let break3 = s("riffin:0/2").fit().scrub(seq1.div(8))

$: n("<0 0 3 5 7 5 3 0>*16".add("<0 2 4 6>"))
  .scale("g2:minor")
  .s("sawtooth")
  .cutoff(slider(1085.70,3000)) 
  .resonance(10)
  .distort(3)
  .decay(0.15)
  .sustain(0.1)
  .gain(0.4)
  .room(0.3)
  .delay(.3)

$: n("<0 3 7 10>").scale("g:minor")
  .s("sine")
  .slow(2)
  .gain(2)
  .attack(1.5).release(2)
  .lpf(2000)
  .room(1)
  .rev()
  .add(sine.range(-0.2,0.2))
  .dist(.5)
  .orbit(3)

$: n("<0 2 4 [-2@3 -1]>")
  .scale("g1:minor")
  .s("saw")
  .resonance(12)
  .distort(3)
  .gain(1)
  .lpa(0.05)
  .lpenv(5)
  

$: arrange(
  
[4, break3.color("blue")],
[4, break1.color("red")],
[3, break3.color("blue")],
[1, break2.color("green")],
[2, break3.color("blue")],
[2, break2.color("green")],

 ).gain(4)
  .dist(.3)
  .cutoff(perlin.range(1000, 6000).slow(2))  // filtro dinámico
  ._pianoroll({labels:1,cycles:4})
`;
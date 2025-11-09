export default `
// Ambient_fmwaves by @MissingTexture_Lab


setcpm(20)
samples('github:yaxu/clean-breaks')


$: n("<[0 ~ 4 ~ 7]>/2").add("<0 2 4 0>/4").scale("<A3:minor E3:minor>")
  .s("triangle")               
  .attack(2).decay(6).sustain(.6).release(4)  // envolvente larga
  .fm(sine.range(3,7).slow(16)) // modulación
  .lpf("800:8")                 // filtro bajo
  .room(.6).gain(.35)
  .orbit(1)

$: s("<numbers:0 numbers:4> numbers:1 numbers:2 numbers:3")
  .slow(4)
  .gain(.7)
  .lpf(800)
  .delay(0.6)
  .room(0.8).size(0.9)
  .shape(0.2)
  .orbit(2)

$: n("<0 4 7>/2").scale("A4:minor")
  .s("sawtooth,triangle")
  .fm(sine.range(7,12).slow(24))
  .fmh("0.9")
  .attack(3).decay(7).sustain(.7).release(5)
  .lpf(sine.range(2500, 4000).slow(18)) 
  .room(0.8)
  .gain(0.08)
  .orbit(4)

$: n("<0 ~ -3 ~ -5>/4").scale("A2:minor")
  .s("sine")
  .fm(sine.range(10, 50).slow(16))
  .attack(2).decay(6).sustain(.7).release(5)
  .gain(0.4)
  .lpf(sine.range(300, 900).slow(8)) 
  .room(0.5)
  .orbit(5)

$: n("0,2,4,6,8,10").scale("<A3:minor E3:minor>")
  .s("gm_string_ensemble_1:1").slow(2)
  .lpf(1000).delay(.2)
  .fm(30)
  .gain(.3)
  .room(0.5)._punchcard()


//DRUMSS

$: stack(
  
  s("<bd bd bd <bd [bd [bd bd]]>>*8").bank("rolandtr909")
  .delay(.1)
  .room(0.3)
  .gain(1)
  .orbit(3)
  .distort(".2"),
  
  s("<- sd:2>*4").bank("rolandtr808")
  .delay(.3)
  .room(0.3)
  .gain(0.7)
  .orbit(3)
)._punchcard()

$: n("<[0 - - -] - - - ->*8").slow("1").scale("A4:minor").s("sine, saw:.8")._scope()

$: n("<0!8>*32").s("hh").bank("viscospacedrum").gain("<.2 .4. .6 .8>*16").delay(.2)


$: s("<sport!8 mechanicalman!8>")
  .fit()
  .speed("<[1 5] 1 <2 3> 4>*8")
  .chop(7)
  .hpf(sine.range(2000, 6000).slow(12))
  .dec(sine.range(.2, 1.2).slow(8)) 
  .delay(.1)
  .room(0.7)
  .gain(0.4)
  .orbit(3)
`;

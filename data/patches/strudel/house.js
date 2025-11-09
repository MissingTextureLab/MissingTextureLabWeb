export default `
// coding_house by @MissingTexture_Lab

setCpm(140/4)

$: n("0,2,4,6").scale("<F:major D:major>").s("gm_string_ensemble_1:2").slow(4)
  .lpf(800)
  .phaser(".25").phasercenter("<800 2000>").phaserdepth(sine.range(0.1, 0.6).slow(16))
  .chorus(.4).postgain(2)
  .orbit(4)

$: stack(
  n("<0!7 <[0 0] [0 [- 0]]>>*4").s("bd").bank("RolandTR909").gain(.6).room(0.05).dist(.3).duckorbit("2:<30 4>").duckattack(0.3).duckdepth(1),
  n("<- 0>*8").s("hh").bank("RolandTR909").room(0.05).delay(.2).lpf(4800).gain(0.25).orbit(5),
  n("<- - 0 <-!7 [- 0]>>*8").s("sd").bank("RolandTR909").delay("<0!7 0.5>*8").room(0.3).lpf(2000).gain(1)
).compressor("-20:4:8:0.01:0.2")
  
$: stack(
  n("<0 2 6 - 0 4 2 6 2 - - 4 2 0 6>*4".add("0,7")).scale("<F:major  D:major>".slow(4)).s("gm_pizzicato_strings:5").gain(.7),
  n("<0 2 6 - 0 4 2 6 2 - - 4 2 0 6>*8".add("0,2,7")).scale("<F4:major  D:major>".slow(4)).s("gm_pizzicato_strings:5").gain(.7).delay(.3),
).crush(slider(9.925,1,16)).gain(.8).lpf(900).orbit(2).punchcard()

$: n("0").scale("<F1:major D1:major>").s("gm_synth_bass_1").slow(4)
  .lpf(slider(5000,0,5000)).vib(4).chorus(.3).dist(.3).fm("32v").phaser(2).phasercenter("<800 2000>").orbit(3).punchcard()
`;
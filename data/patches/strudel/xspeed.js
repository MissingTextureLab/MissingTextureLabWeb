export default `
//x=>x.speed by @MissingTexture_Lab (está subida en IG,TikTok y YouTube <3)


setcpm(40/4)

$: stack(
  n("<0 2 6 9 4 2 6 4>*16").scale("C:major A:minor").s("piano")
  .delay(.3).room(.3).lpf("400 800")
  .off(1/8, x=>x.speed(2))
  .off(1/8, x=>x.speed(4))
)._punchcard()

$: stack(
  n("<0 - - - [0 0] - - <0 0 0 [0 0 0]>>*16").s("rolandtr808_bd:11").gain(1.2), 
  n("<0 0 [0 0 0] 0 0 0 <0 [0 0]> >*32").s("rolandtr808_hh:2").gain(.4)
  .lpf(4500).delay(.3),
  n("<- - - - 1 - - <- - - [1]>>*32").s("rolandtr808_sd:3").gain(1.2)
  .lpf(2500).delay(0.1).room(.15)
)._punchcard()

$: stack(
  n("<0 2 6 0>*4").scale("C2:major A1:minor").s("gm_synth_bass_1:3").gain(0.5)
  .lpf("600 800")._punchcard()
)
`;
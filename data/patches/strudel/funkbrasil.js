export default `
//Funk Brasileño by @MissingTexture_Lab

setcpm(120/4)

$:stack(
  s("bd").beat("0,10",16)
  .gain(1)
  .compressor("9:8:8:.003:.15")
  .distort("3:.7")
  .lpf(4200)
  .hpf(40)
  .shape(.4)
  .bank("korgddm110"),
  n("- [- 0] - 0 - - 0 -").s("sd").distort("2:.5").lpf(2000).delay(.2).bank("korgddm110").gain(.7),
  n("0!16").s("hh:5").distort("3:.5").lpf(3000).delay(.5).speed(3).gain(.2).room(.1).bank("korgddm110"),
  n("- [- 0] - 0 - <0 [0 0]> <0 [0 0]> -").s("cowbell:2").distort("2:.5").delay(.1).speed(1.7).lpf(2400)
)._punchcard()

$: n("<0@6 4 [5 5 5]>*4").scale("C2:minor").s("supersaw").distort("3:.5").gain(.1).fm(1)._scope()

$: n("<0@6 [4 4 4] [5 5 5]>*4".add("<[0] [0,4]>/4")).scale("C4:minor").s("gm_ocarina").distort("3:.2")

$: n("<0@6 [4 4 4] [5 5 5]>*4".add("<[0] [0,4]>/4")).scale("C2:minor").s("gm_synth_strings_1").distort("3:.2")
`;

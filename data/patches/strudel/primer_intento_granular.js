export default `
// Primer experimento tratando de hacer un efecto granular en Strudel by @MissingTexture_Lab


samples('github:tidalcycles/dirt-samples')

$: n(run(12).slow(2)).s("fm").scrub("{0.3 0.4 0.2 0.5}%16")
.clip(rand.range(.05,.4))._scope()

$: stack(
  n("<0 <0 [0 - - 0]> 0 0>*4").s("bd")._punchcard()
  ,n("<- 0 - 0 - <0 [2 2 5 -]> - 0>*8").s("hh").gain(1.5)._punchcard()
  ).bank("rolandtr909").gain(.4)
`;
export default `
// Mi primera canción en Strudel <3 by @MissingTexture_Lab


setcpm(150/4)

$: s("<bd*4 , hh*8, <[- [- oh]*3]*2 [- oh]*2>>").bank("ViscoSpaceDrum")

$: n("<0, 2, 4, 6>").scale("<C:major F:major>").s("piano")

$: n("<0 2 4 6>*2").scale("<C:major F:major>").s("piano")

$: n("<6 [2,4] 0 2>*8").scale("<C4:major F:major>").s("gm_synth_choir")

$: n("<7 - <7 [7 7]> - 6 - <6 [6 6]> ->*8").scale("<C4:major F4:major>").s("gm_tremolo_strings:4")
`;
export default `
setcpm(130/4)

$: n("0,2,4,6").scale("<C:major A:minor>").s("gm_fx_soundtrack").slow(4).orbit(2)
$: n("<0 -2>".ply(32)).scale("C2:major").s("gm_electric_bass_pick:2".decay(1.3)).slow(4)
  .lpf(slider(1375.2,600,3000))
  .dist(.2)
  .room(.5)
  .delay(.1)
  .orbit(3)
  // .duckorbit(2)

$: stack(
  n("<0!7 [0 0]>*4").s("bd")
  .lpf(1500)
  .room(.3)
  .dist(.1),
  n("<- 0>*8").s("oh".decay(.2))
  .room(.6)
  .delay(.1)
  .lpf(1500),
    n("<0>*16").s("hh".decay(.5))
  .room(.5)
  .delay(.3)
  .lpf(slider(966.9,300,3000)),
  n("<- <0? 0? [0 - - 0] 0>>*4").s("sd:8")
  .lpf(1900)
  .dist(.3)
  )

  .lpf(slider(1560.9,300,3000))
  .bank("rolandtr909")

// Esto está comentado porque satura el navegador y y crashea el sonido pero es super bonito (<trabajando en una versión optimizada>)

// $: stack(
//   n("<0@3 6 8 4 [<2 3> 1] -1>*4".ply(4)).scale("<C:pentatonic A:minor e:minor a:minor>/4").s("piano".decay(.06)).cut(1),
//   n("<0@3 8 2 6 [0 1] 3>*4".ply("<1 2 3 2>/2")).scale("<C:pentatonic A:minor e:minor a:minor>/4").s("piano".decay(.06)).cut(1),
//   ).room(.8).delay(.2).lpf(1500).dist(.3).gain(1.5)

$:n("<[0,2,4]@5 6 8 4 [2 1] -1>").scale("<C:major A:minor>").s("piano")
`;
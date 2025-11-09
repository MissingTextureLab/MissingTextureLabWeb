export default `
//pixelate_crush (w/ visuals) by @MissingTexture_Lab

await initHydra()
let bpms = 160

bpm=160
s0.initCam()
src(s0)
  .color([5, -5].fast(.5),[-1, -2, -3, -4],[5, -5].fast(.5))
  .colorama([-3])
  .saturate([1, 6].fast(2))
  .brightness([0, 0, .8, 1].fast(2))
  .pixelate([10,50,100,200,300,400,500,1000].smooth().fast(.5),[10,50,100,200,300,400,500,1000].smooth().fast(.5))
.out()

setcpm(bpms/4)

$: stack(
  n("<0!8>*4").s("bd").gain(1.1),
  n("<[- 0]!8>*4").s("hh:4").gain(.5).delay(.2),
  n("<- <0 0 0 [0 - [0 0 0]] <0 [- 0]> <0 [0 - 0 0]>>>*4").s("sd:9")
  .zcrush(7)
  .delay(.05)
  .room(.1)
  .lpf(1200)
  .fm(2)
  .postgain(.7)
).bank("viscospacedrum")

$: n("<5 0 2 [3@3 <[3 4] 2>]>"
     .add("0,11")
    )
  .scale("F1:minor").s("saw")
  .fm("<0 1>/2")
  .phaser("<4 8 4 8>")
  .room(.8)
  .lpf(1000)
  .crush("<7 4 6 3>")
.postgain(.7)

$: n("<5 0 2 3>".add("0,2,<<4 6> <6 4>>")).scale("F3:minor").s("saw")
  .crush(8)
  .phaser("<0.5 0.5 0.5 8>")
  .lpf(600)
  .room(.8)
  .postgain(.8)

$: n("<[0 - 5] 0 [4 - 6][<2 3> - <4 2>]>*2".add("0,2")).scale("<F4:minor F3:minor>/4").s("piano")
  .lpf(1000)
  .room(.8).postgain(.3)

$:n("<0 6 2 4>*8".add("<0 2 -2 [3 4]>")).scale("F4:minor").sound("sine")
  .fast("<.5 1>/4")
  .delay(.5)
  .lpf(400).postgain(.5)
`;
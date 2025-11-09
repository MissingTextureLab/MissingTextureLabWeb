export default `
//Ambient2_PajarosDrone (w/ visuals) by @MissingTexture_Lab

await initHydra()
bpm=1000

s0.initCam()
src(s0)
  .color(1,-1,-1)
  .colorama(.7)
  .hue(.3)
  .pixelate([0,100].smooth(),[100,0].smooth())
  
.out(o0)

samples('github:tidalcycles/Dirt-Samples');
let seq1 = "<[1!8] [2!2] [4!16] 3 2 [5!9] [6!8]>*2"
let seq2 = "<[1!4] [2!16] 3 [4!16] 2 [5!3] [6!8]>*2"

setcpm(80/4)

$:stack(
s("<birds:2>").delay(.3).lpf(1200).fit()
  .scrub(seq2.div(8)).gain(.6),
s("<birds:3>").delay(.3).lpf(1000).fit()
  .scrub(seq1.div(8)).gain(.8),
s("<birds:4>").delay(.3).lpf(1300).fit()
  .scrub(seq1.div(8)).gain(.3),
s("<birds:1>").delay(.3).lpf(800).fit()
  .scrub(seq2.div(8)).gain(.5)
).room(slider(5.6,0,10,0.1)).postgain(.5)

$:stack(
  n("<0,2,4,6>/4").scale("a2:major").s("piano").room(.2).dist(.3),
  // n("<[0|2|4|6|8|11|13|15|18]*8>".decay(.4)).scale("<a2:major d2:major e2:major e2:major>").s("piano").room(.8).dist(.2).gain(.3),
  // n("<[0|2|4|6|8|11|13|15|18]*4>".decay(.4)).jux(rev).scale("<d2:major a2:major a2:major e2:major>").s("piano").room(.8).dist(.2).gain(.7),
  // n("<-!3 <0 -> 6 4 2 8>*2").scale("a2:major").s("piano").room(.5).dist(.1).cut(1).gain(.8),
  // n("<-!3 <0 -> 4 6 2 8>*2".add("0")).scale("a1:major").s("gm_blown_bottle").room(.5).cut(1).gain(1).lpf(800)
)._punchcard()
`;

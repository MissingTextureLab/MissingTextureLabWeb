export default `
//Intento de contrapunto extraño by @MissingTexture_Lab

setcpm(180/4)

$: stack(
  n("<[0|2|4|6|8|11|13|15|18]*8>".decay(.4)).scale("<a2:major d2:major e2:major e2:major>").s("piano").room(.8).dist(.2).gain(.3),
  n("<[0|2|4|6|8|11|13|15|18]*4>".decay(.4)).jux(rev).scale("<d2:major a2:major a2:major e2:major>").s("piano").room(.8).dist(.2).gain(.7),
  n("<-!3 <0 -> 6 4 2 8>*2").scale("a2:major").s("piano").room(.5).dist(.1).cut(1).gain(.8),
  n("<-!3 <0 -> 4 6 2 8>*2".add("0")).scale("a1:major").s("gm_blown_bottle").room(.5).cut(1).gain(1).lpf(800)
)
`;
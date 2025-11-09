export default `
//Bajo para un tema de punk sin terminar by @MissingTexture_Lab

samples('github:tidalcycles/Dirt-Samples');

setcpm(80/4)

$: n("<0!4 6!4 2!3 4!5>*16")
  .scale("e2:minor")
  .s("juno:6")
  .cut(.8)
  .room(.3)
  .lpf(slider(910,100,5000,5))
  .distort(".7:<0.7 0.75 0.8 0.85>")._pianoroll({ labels: 1 })

$: stack(
  n("<0!7 <[0 0] [0 [0 - 0]]>>*8").s("bd").lpf(300),
).bank("tr909")
`;




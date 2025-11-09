export default `
//Coding DnB/Jungle 1 by @MissingTexture_Lab


setcpm(180/4)
samples('github:yaxu/clean-breaks')
samples({'reese':'https://cdn.freesound.org/previews/236/236932_4212462-lq.mp3'})

let seq1 = "< 4@3 4@5 2@3 4@1 3@2 6@2 >*8" // straight ahead
let seq2 = "< 0@3 <0 3>@5 2@3 2@3 4@2 >*8" // alt slices every2 bars

let break1 = s("amen:0/4")  .fit().scrub(seq2.div(8))
let break2 = s("sesame:0/1").fit().scrub(seq2.div(8))
let break3 = s("riffin:0/2").fit().scrub(seq1.div(8))

let pads = n("<0 5 3 1>/2".add("0,2,4,6")).scale("e:major").s("supersaw").attack(.5).release(.5)
  .gain(.5).room(3).phaser(1).phaserdepth(0.3).postgain(.5)
.early(.1) ._scope()

let bass = note("<e2 _ c#3 _ c3 _ b2 _ >").s('reese').transpose(-12)
  .s("reese")
  .clip(1)
  .vib("3:.4")
  .distort(1)
  .phaser(1)
  .phaserdepth(.2)
  .lpf("<400 500 600 800>/2")
  .postgain(.6)
  ._scope()

let melody = n("<0 2 6 4 [4 4 4 4 4 ] - [6 - - 2 2] [4 - - - 2 1]>*2".add("0,<2 4 3 2>/2,<4 6 5 4>/2"))
  .jux(rev)
  .scale("e3:pentatonic").s("gm_tremolo_strings:5")
  .clip(1)
  .vib("3:.4")
  .distort(1)
  .phaser(1)
  .phaserdepth(.2)
  .lpf("<1000 900 800 600>/2")
  .postgain(.4)
  ._scope()
let melody2 = n("<12 - - - 10 - - - [9 8 7 6] 5@3 0@2 2 6>*8")
  .jux(rev)
  .scale("e3:pentatonic").s("piano")
  .phaser(1)
  .phaserdepth(.2)
  .lpf("1700")
  .postgain(.8)
  ._scope()

//$: pads
//$: bass
$: melody
$: melody2

 $: arrange(
[6, break3.color("blue")],
[2, break1.color("red")],
[3, break3.color("blue")],
[1, break2.color("green")],
[2, break3.color("blue")],
[2, break2.color("green")],

 )._pianoroll({labels:1,cycles:4})
`;
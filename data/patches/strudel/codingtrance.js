export default `

// Código basado en el tutorial “Coding trance” de @_switch_angel.
// Incluye dos funciones creadas por ella, compartidas en el servidor oficial de Discord de la comunidad de Strudel.
// Agradezco profundamente a @_switch_angel por introducirme mediante su contenido en esta nueva forma de hacer música <3

// fill in gaps between events
register('fill', function (pat) {
  return new Pattern(function (state) {
    const lookbothways = 1;
    // Expand the query window
    const haps = pat.query(state.withSpan(span => new TimeSpan(span.begin.sub(lookbothways), span.end.add(lookbothways))));
    const onsets = haps.map(hap => hap.whole.begin)
      // sort fractions
      .sort((a, b) => a.compare(b))
      // make unique
      .filter((x, i, arr) => i == (arr.length - 1) || x.ne(arr[i + 1]));
    const newHaps = [];
    for (const hap of haps) {
      // Ingore if the part starts after the original query
      if (hap.part.begin.gte(state.span.end)) {
        continue;
      }

      // Find the next onset, to use as an offset
      const next = onsets.find(onset => onset.gte(hap.whole.end));

      // Ignore if the part ended before the original query, and hasn't expanded inside
      if (next.lte(state.span.begin)) {
        continue;
      }

      const whole = new TimeSpan(hap.whole.begin, next);
      // Constrain part to original query
      const part = new TimeSpan(hap.part.begin.max(state.span.begin), next.min(state.span.end));
      newHaps.push(new Hap(whole, part, hap.value, hap.context, hap.stateful));
    }
    return newHaps;
  });
});

register('trancegate', (density, seed, length, x) => {
  return x.struct(rand.mul(density).round().seg(16).rib(seed, length)).fill().clip(.7)
})

register('rlpf', (x,pat) => {return pat.lpf(pure(x).mul(23).pow(3))})



setCpm(140/4)

$:n("<0!7 [0 0]>*4").s("bd").bank("rolandtr909")
  .dist(.2).lpf(2000).room(.1)
  ._scope()
$: n("0".add("-14")).scale("E:minor")
  .s("supersaw")
  .seg(16)
  // .trancegate(1.5,45,1)
  .rlpf(slider(1))
  .orbit(2)._scope()

$: n("0@2 [-7 <-7 5 2 -2>]@6 <0 3 6 0>@2".add("7,<- 0>/4")).scale("E:minor")
  .s("supersaw")
  .delay(.3)
  .pan(rand)
  .trancegate("<1.5 1.2>/4",45,1)
  .fm(.5).fmwave("brown")
  .rlpf(slider(0.953))
  .orbit(3)._punchcard({labels : 1})

$: n("0,2,4".add("<0 -2>/2")).scale("E:minor").s("supersaw")
  .dist(.3).room(.1)
  // .trancegate(1.5,45,1)
  .rlpf(slider(0.953))

$: s("pulse!16").dec(.1)
  .fm(time).fmh(time)
  .delay(.7).postgain(.25).orbit(4)
`;
const list = `<ul>
<li><a href="/tracks/abap">ABAP</a></li>
<li><a href="/tracks/bash">Bash</a></li>
<li><a href="/tracks/c">C</a></li>
<li><a href="/tracks/csharp">C#</a></li>
<li><a href="/tracks/cpp">C++</a></li>
<li><a href="/tracks/cfml">CFML</a></li>
<li><a href="/tracks/clojure">Clojure</a></li>
<li><a href="/tracks/clojurescript">ClojureScript</a></li>
<li><a href="/tracks/coffeescript">CoffeeScript</a></li>
<li><a href="/tracks/common-lisp">Common Lisp</a></li>
<li><a href="/tracks/crystal">Crystal</a></li>
<li><a href="/tracks/d">D</a></li>
</ul>
</div>
<div class='col'>
<ul>
<li><a href="/tracks/dart">Dart</a></li>
<li><a href="/tracks/delphi">Delphi Pascal</a></li>
<li><a href="/tracks/elixir">Elixir</a></li>
<li><a href="/tracks/elm">Elm</a></li>
<li><a href="/tracks/emacs-lisp">Emacs Lisp</a></li>
<li><a href="/tracks/erlang">Erlang</a></li>
<li><a href="/tracks/fsharp">F#</a></li>
<li><a href="/tracks/fortran">Fortran</a></li>
<li><a href="/tracks/go">Go</a></li>
<li><a href="/tracks/groovy">Groovy</a></li>
<li><a href="/tracks/haskell">Haskell</a></li>
<li><a href="/tracks/java">Java</a></li>
</ul>
</div>
<div class='col'>
<ul>
<li><a href="/tracks/javascript">JavaScript</a></li>
<li><a href="/tracks/julia">Julia</a></li>
<li><a href="/tracks/kotlin">Kotlin</a></li>
<li><a href="/tracks/lfe">LFE</a></li>
<li><a href="/tracks/lua">Lua</a></li>
<li><a href="/tracks/mips">MIPS Assembly</a></li>
<li><a href="/tracks/nim">Nim</a></li>
<li><a href="/tracks/objective-c">Objective-C</a></li>
<li><a href="/tracks/ocaml">OCaml</a></li>
<li><a href="/tracks/perl5">Perl 5</a></li>
<li><a href="/tracks/pharo-smalltalk">Pharo</a></li>
<li><a href="/tracks/php">PHP</a></li>
</ul>
</div>
<div class='col'>
<ul>
<li><a href="/tracks/plsql">PL/SQL</a></li>
<li><a href="/tracks/prolog">Prolog</a></li>
<li><a href="/tracks/purescript">PureScript</a></li>
<li><a href="/tracks/python">Python</a></li>
<li><a href="/tracks/r">R</a></li>
<li><a href="/tracks/racket">Racket</a></li>
<li><a href="/tracks/raku">Raku</a></li>
<li><a href="/tracks/reasonml">ReasonML</a></li>
<li><a href="/tracks/ruby">Ruby</a></li>
<li><a href="/tracks/rust">Rust</a></li>
<li><a href="/tracks/scala">Scala</a></li>
</ul>
</div>
<div class='col'>
<ul>
<li><a href="/tracks/scheme">Scheme</a></li>
<li><a href="/tracks/sml">Standard ML</a></li>
<li><a href="/tracks/swift">Swift</a></li>
<li><a href="/tracks/tcl">Tcl</a></li>
<li><a href="/tracks/typescript">TypeScript</a></li>
<li><a href="/tracks/unison">Unison</a></li>
<li><a href="/tracks/vbnet">VB.NET</a></li>
<li><a href="/tracks/vimscript">Vim script</a></li>
<li><a href="/tracks/wasm">WebAssembly</a></li>
<li><a href="/tracks/wren">Wren</a></li>
<li><a href="/tracks/x86-64-assembly">x86-64 Assembly</a></li>`;

const reg = /\/tracks\/(.+)"/g;
const array = [...list.matchAll(reg)].map((e) => e[1]);
console.log(array);

const fs = require('fs');
const https = require('https');

const tracks = [
  'bash',
  'c',
  'csharp',
  'cpp',
  'cfml',
  'clojure',
  'clojurescript',
  'coffeescript',
  'common-lisp',
  'crystal',
  'd',
  'dart',
  'delphi',
  'elixir',
  'elm',
  'emacs-lisp',
  'erlang',
  'fsharp',
  'fortran',
  'go',
  'groovy',
  'haskell',
  'java',
  'javascript',
  'julia',
  'kotlin',
  'lfe',
  'lua',
  'mips',
  'nim',
  'objective-c',
  'ocaml',
  'perl5',
  'pharo-smalltalk',
  'php',
  'plsql',
  'prolog',
  'purescript',
  'python',
  'r',
  'racket',
  'raku',
  'reasonml',
  'ruby',
  'rust',
  'scala',
  'scheme',
  'sml',
  'swift',
  'tcl',
  'typescript',
  'vbnet',
  'vimscript',
  'wren',
  'x86-64-assembly',
];

const getConfig = (track) => {
  return new Promise((resolve) => {
    https.get(
      `https://raw.githubusercontent.com/exercism/${track}/main/config.json`,
      (res) => {
        res.setEncoding('utf8');
        let body = '';
        res.on('data', (data) => {
          body += data;
        });
        res.on('end', () => {
          body = JSON.parse(body);
          resolve(body);
        });
      }
    );
  });
};

run();

async function run() {
  const configs = await Promise.all(tracks.map(getConfig));

  const map = {};
  let result = '| Exercise Slug | Concepts| Tracks |\n| --- | --- | --- |\n';

  for (const config of configs) {
    for (const exercise of config.exercises.concept) {
      if (exercise.status == 'wip' || exercise.status == 'deprecated') continue;

      if (!map[exercise.slug]) {
        map[exercise.slug] = {
          concepts: new Set(),
          tracks: [],
        };
      }

      map[exercise.slug].concepts.add(...exercise.concepts);
      map[exercise.slug].tracks.push(config.slug);
    }
  }

  for (const [slug, { concepts, tracks }] of Object.entries(map)) {
    const conceptList = Array.from(concepts).join(', ');
    result += `| **${slug}** |  ${conceptList} | ${trackList(
      tracks,
      slug
    )} |\n`;
  }

  fs.writeFileSync('./scratch.exercises.md', result);
}

function trackList(tracks, slug) {
  return tracks
    .map(
      (track) =>
        `[${track}](https://github.com/exercism/${track}/tree/main/exercises/concept/${slug})`
    )
    .join(', ');
}

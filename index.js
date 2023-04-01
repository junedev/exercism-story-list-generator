const fs = require("fs");
const https = require("https");

const getConfig = (track) => {
  return new Promise((resolve) => {
    https.get(`https://raw.githubusercontent.com/exercism/${track}/main/config.json`, (res) => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", (data) => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        resolve(body);
      });
    });
  });
};

run();

async function run() {
  const res = await fetch("https://exercism.org/api/v2/tracks")
  const json = await res.json()

  const tracks = []
  
  for (const trackObj of json.tracks) {
    tracks.push(trackObj.slug)
  }

  const configs = await Promise.all(tracks.map(getConfig));

  const map = {};
  let result = "| Exercise Slug | Concepts| Tracks |\n| --- | --- | --- |\n";

  for (const config of configs) {
    for (const exercise of config.exercises.concept) {
      if (exercise.status == "deprecated") continue
      
      if (!map[exercise.slug]) {
        map[exercise.slug] = {
          concepts: new Set(),
          tracks: [],
        };
      }

      for(const concept of exercise.concepts) {
        if (concept) {
          map[exercise.slug].concepts.add(concept)
        }
      }

      map[exercise.slug].tracks.push({ slug: config.slug, status: exercise.status });
    }
  }

  for (const [slug, { concepts, tracks }] of Object.entries(map)) {
    const conceptList = Array.from(concepts).join(", ");
    result += `| **${slug}** |  ${conceptList} | ${trackList(tracks, slug)} |\n`;
  }

  fs.writeFileSync("./exercises.md", result);
}

function trackList(tracks, exerciseSlug) {
  return tracks
    .map((track) => {
      const link = `https://github.com/exercism/${track.slug}/tree/main/exercises/concept/${exerciseSlug}`;

      let statusStr = "";
      // || track.status == "deprecated"
      if (track.status == "wip") {
        statusStr += ` (${track.status})`;
      }

      return `[${track.slug}](${link})${statusStr}`;
    })
    .join(", ");
}

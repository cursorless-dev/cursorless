const colors = [
  ["hsl(255, 0%, 40%)", "default grey"],
  ["#757180", "default (std light)"],
  ["#aaa7bb", "default (std dark)", 16],
  ["#36B33F", "green (std dark)"],
  ["hsl(120, 60%, 40%)", "green", 21],
  ["#0000FF", "Blue"],
  ["hsl(205, 100%, 50%)", "blue", 31],
  ["#7F00FF", "purple violet", 35],
  ["hsl(300, 100%, 50%)", "pink magenta", 40],
  ["#FF0000", "Red", 50],
  ["hsl(0, 70%, 50%)", "red"],
  ["#fabed4", "pink"],
  ["#f58231", "yellow orange"],
  ["hsl(40, 90%, 50%)", "yellow orange", 60],

  ["#a9a9a9", "default grey"],
  ["#e6194B", "red"],
  ["#3cb44b", "green"],
  ["#4363d8", "blue"],
  ["#f032e6", "pink magenta"],
  ["#911eb4", "purple"],
  ["#dcbeff", "- lavender"],
  ["#808000", "green olive"],
  ["#000075", "- navy"],
  ["#42d4f4", "blue cyan"],
  ["#800000", "- maroon"],
  ["#9a6324", "- brown"],
  ["#469990", "green teal"],
  ["#ffd8b1", "- apricot"],
  ["#00FF00", "Green"],
  ["#FFFF00", "Yellow"],
  ["#FF00FF", "pink magenta"],
  ["#00FFFF", "cyan"],
  ["#FF007F", "red rose"],
  ["#007FFF", "blue azure"],
  ["#00FF7F", "spring green"],
  ["#DFFF00", "Chartreuse"],
  ["#FFA500", "yellow orange"],
  ["#ffe119", "yellow"],
  ["#bfef45", "green lime"],
  ["#fffac8", "beige"],
  ["#aaffc3", "mint"],
  ["#089ad3", "blue (std dark)"],
  ["#E02D28", "red (std dark)"],
  ["#E06CAA", "pink (std dark)"],
  ["#E5C02C", "yellow (std dark)"],
  ["#36B33F", "green (std light)"],
  ["#e0679f", "pink (std light)"],
  ["#edb62b", "yellow (std light)"],
];

const size = 10;
const root = document.getElementById("root");
const picked = document.getElementById("picked");
const pickedColars = colors.filter((color) => color[2]);
colors.sort((a, b) => a[1].localeCompare(b[1]));
pickedColars.sort((a, b) => a[2] - b[2]);

function createSvg(color) {
  const svg = `<svg height="${size}" width="${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${
    size / 2
  }" fill="${color}" />
        </svg>`;
  const span = document.createElement("span");
  span.style.marginRight = `${size / 2}px`;
  span.innerHTML = svg;
  return span;
}

colors.forEach(([color, description, pick]) => {
  const div = document.createElement("div");
  div.style.marginTop = `${size / 2}px`;
  const span1 = createSvg(color);
  const span2 = document.createElement("span");
  span2.innerHTML = `${pick ? "* " : ""}${description} - ${color}`;
  div.appendChild(span1);
  div.appendChild(span2);
  root.appendChild(div);
});

pickedColars.forEach(([color]) => {
  picked.appendChild(createSvg(color));
});

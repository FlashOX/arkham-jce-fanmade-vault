import fs from "fs";

const manifest = JSON.parse(
  fs.readFileSync("data/print-manifest.json", "utf8")
);
const catalogueData = JSON.parse(
  fs.readFileSync("data/catalogue.json", "utf8")
);

catalogueData.items.forEach((item) => {
  const manifestItem = manifest.items[item.id];
  if (manifestItem && manifestItem.creator) {
    item.creator = manifestItem.creator;
  }
});

fs.writeFileSync(
  "data/catalogue.json",
  JSON.stringify(catalogueData, null, 2) + "\n"
);

console.log("Creators added to catalogue.");

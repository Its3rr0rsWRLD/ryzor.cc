// strip-comments.ts
import { Project } from "ts-morph";
import fs from "fs";

const project = new Project({
  tsConfigFilePath: "tsconfig.json", // Or remove if not using TS config
});

const files = project.addSourceFilesAtPaths("**/*.tsx");

for (const file of files) {
  const filePath = file.getFilePath();
  const printer = file.getFullText();

  const noComments = file.getDescendants()
    .map(n => n.getLeadingCommentRanges().concat(n.getTrailingCommentRanges()))
    .flat()
    .forEach(c => c.remove());

  fs.writeFileSync(filePath, file.getFullText());
}
module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "node Scripts/update-manifest-version.cjs ${nextRelease.version} && node Scripts/update-config-production.cjs",
        publishCmd:
          "zip -r extension-v${nextRelease.version}.zip * -x @exclude.lst",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["manifest.json", "config.js", "CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: "extension-v*.zip",
            name: "extension-v${nextRelease.version}.zip",
            label: "Chrome Extension Package",
          },
        ],
      },
    ],
  ],
};

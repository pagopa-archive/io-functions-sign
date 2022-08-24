/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/", "/lib/"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};

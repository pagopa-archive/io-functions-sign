// eslint-disable-next-line @typescript-eslint/no-var-requires
const customRules = require("@pagopa/danger-plugin").default;

const recordScope = {
  projectToScope: {
    SFEQS: "Firma con IO",
  },
  tagToScope: {
    development: "Development",
    backend: "Backend",
    dependency: "Dependency",
  },
  minLenPrDescription: 10,
  updateLabel: false,
  updateTitle: false,
};

void customRules(recordScope);

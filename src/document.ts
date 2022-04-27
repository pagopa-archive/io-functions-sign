import * as D from "io-ts/Decoder";

export const Document = D.struct({
  id: D.string,
  title: D.string,
});

export type Document = D.TypeOf<typeof Document>;

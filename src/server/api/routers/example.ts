import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
//import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `G'mornin ${input.text}`,
      };
    }),
});

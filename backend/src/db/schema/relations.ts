import { relations } from "drizzle-orm";
import { profiles } from "./profiles.js";
import { categories } from "./categories.js";
import { workerApplications } from "./worker-applications.js";
import { workerPortfolios } from "./worker-portfolios.js";
import { workerReferences } from "./worker-references.js";

export const profilesRelations = relations(profiles, ({ many }) => ({
  workerApplications: many(workerApplications),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  workerApplications: many(workerApplications),
}));

export const workerApplicationsRelations = relations(
  workerApplications,
  ({ one, many }) => ({
    profile: one(profiles, {
      fields: [workerApplications.profileId],
      references: [profiles.id],
    }),
    category: one(categories, {
      fields: [workerApplications.categoryId],
      references: [categories.id],
    }),
    portfolios: many(workerPortfolios),
    references: many(workerReferences),
  }),
);

export const workerPortfoliosRelations = relations(
  workerPortfolios,
  ({ one }) => ({
    workerApplication: one(workerApplications, {
      fields: [workerPortfolios.workerApplicationId],
      references: [workerApplications.id],
    }),
  }),
);

export const workerReferencesRelations = relations(
  workerReferences,
  ({ one }) => ({
    workerApplication: one(workerApplications, {
      fields: [workerReferences.workerApplicationId],
      references: [workerApplications.id],
    }),
  }),
);

import { relations } from "drizzle-orm";
import { profiles } from "./profiles.js";
import { categories } from "./categories.js";
import { workerApplications } from "./worker-applications.js";
import { workerPortfolios } from "./worker-portfolios.js";
import { workerReferences } from "./worker-references.js";
import { payoutAccounts } from "./payout-accounts.js";
import { reviews } from "./reviews.js";
import { bookings } from "./bookings.js";
import { withdrawals } from "./withdrawals.js";
import { conversations } from "./conversations.js";
import { messages } from "./messages.js";

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
    payoutAccounts: many(payoutAccounts),
    reviews: many(reviews),
    bookings: many(bookings),
    withdrawals: many(withdrawals),
  }),
);

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  workerApplication: one(workerApplications, {
    fields: [withdrawals.workerApplicationId],
    references: [workerApplications.id],
  }),
  payoutAccount: one(payoutAccounts, {
    fields: [withdrawals.payoutAccountId],
    references: [payoutAccounts.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  customer: one(profiles, {
    fields: [conversations.customerProfileId],
    references: [profiles.id],
    relationName: "customerConversations",
  }),
  worker: one(profiles, {
    fields: [conversations.workerProfileId],
    references: [profiles.id],
    relationName: "workerConversations",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(profiles, {
    fields: [messages.senderProfileId],
    references: [profiles.id],
  }),
}));

export const payoutAccountsRelations = relations(payoutAccounts, ({ one }) => ({
  workerApplication: one(workerApplications, {
    fields: [payoutAccounts.workerApplicationId],
    references: [workerApplications.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  workerApplication: one(workerApplications, {
    fields: [reviews.workerApplicationId],
    references: [workerApplications.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  workerApplication: one(workerApplications, {
    fields: [bookings.workerApplicationId],
    references: [workerApplications.id],
  }),
}));

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

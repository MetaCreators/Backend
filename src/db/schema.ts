import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, unique, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const StatusEnum = pgEnum("status", ["pending", "success", "failed"]);
export const ModelTrainingStatusEnum = pgEnum("trainingStatus", ["canceled", "processing", "failed", "starting", "succeeded"]);

export const UserTable = pgTable('users', {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    availableCreds: integer("available_credits").notNull().default(0),
    totalMoneyPaid: integer("totalMoneyPaidUSD").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
}, table => {
    return {
        emailIndex: uniqueIndex("emailIndex").on(table.email),
        uniqueEmail: unique("uniqueEmail").on(table.email)
    }
});

//after saving user's zip on cloud, we store it to db using the cloud storage url:
//url will be something like => aws.s3.com/storage/{userId}/trainingImages/{imgId}
export const trainingImages = pgTable('training_images', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => UserTable.id).notNull(),
    cloudUrl: varchar("cloud_url", { length: 512 }),
    status: StatusEnum("status"),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

//updatedAt should be updated when the model status changes (e.g., from training to ready).
//add triggers to automatically update updatedAt on row updates ?
export const models = pgTable('models', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => UserTable.id).notNull(),
    replicateModelId: varchar("replicate_model_id", { length: 512 }).unique(),
    status: ModelTrainingStatusEnum("trainingStatus"), //TODO: need to change this to accept  "canceled" || "processing" || "failed" || "starting" || "succeeded"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
});
//after generating image from replicate, we first store it on cloud storage , and then send back this cloud storage url to the user
//url will be something like => aws.s3.com/storage/{userId}/generatedImages/{imgId}
export const generatedImages = pgTable('generatedImages', {
    id: uuid("id").primaryKey().defaultRandom(),
    replicateImageId: varchar("imageId", { length: 512 }).unique(),
    modelId: uuid("model_id").references(() => models.id).notNull(),
    userId: uuid("userId").references(() => UserTable.id).notNull(),
    cloudUrl: varchar("cloud_url", { length: 512 }),
    replicateUrl: varchar("replicate_url", { length: 512 }).notNull(),
    prompt: text("prompt").notNull(),
    status: StatusEnum("status"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    creditsUsed: integer("credits_used").notNull()
});

export const CredChangeReason = pgEnum("reason", ["image_gen_debit", "topup", "package_purchase"]) //we might have to add new_model_train here in future?

export const creditTransactions = pgTable('credit_transactions', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => UserTable.id).notNull(),
    changeAmount: integer("change_amount").notNull(), // Positive for addition, negative for deduction
    reason: CredChangeReason("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull()
});

// RELATIONS:
export const UserTableRelations = relations(UserTable, ({ one, many }) => {
    return {
        models: many(models),
        generatedImages: many(generatedImages),
        trainingImages: many(trainingImages),
        creditTransactions: many(creditTransactions)
    }
})

export const trainingImagesRelations = relations(trainingImages, ({ one }) => {
    return {
        user: one(UserTable, {
            fields: [trainingImages.userId],
            references: [UserTable.id]
        })
    }
})

export const modelRelations = relations(models, ({ one, many }) => {
    return {
        user: one(UserTable, {
            fields: [models.userId],
            references: [UserTable.id]
        }),
        generatedImages: many(generatedImages)
    }
})

export const genImageRelations = relations(generatedImages, ({ one }) => {
    return {
        user: one(UserTable, {
            fields: [generatedImages.userId],
            references: [UserTable.id]
        }),
        model: one(models, {
            fields: [generatedImages.modelId],
            references: [models.id]
        })
    }
})

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => {
    return {
        user: one(UserTable, {
            fields: [creditTransactions.userId],
            references: [UserTable.id]
        })
    }
})
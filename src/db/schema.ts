import { integer, pgTable, serial, text, uuid, varchar } from "drizzle-orm/pg-core";

export const UserTable = pgTable('users', {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", {length:255}).notNull(), 
    email: varchar('email', { length: 255 }).notNull().unique(),
    availableCreds: integer("availableCreds").notNull().default(0),
    trainingImgCloudUrl: varchar("trainingImgCloudUrl"),
    generatedImgCloudUrl:varchar("generatedImgCloudUrl")
});

export const generatedImages = pgTable('generatedImages', {
    id: uuid("id").primaryKey().defaultRandom(),
    imageId:varchar("imageId").unique(),
    modelId:uuid("modelId").references(()=>modelDetails.id).notNull(),
    userId:uuid("userId").references(()=>UserTable.id).notNull()
})

export const modelDetails = pgTable('modelDetails', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId").references(()=>UserTable.id).notNull(),
    modelId:varchar("modelId").unique(),
})

export const userQueries = pgTable('userQueries', {
    id: uuid("id").primaryKey().defaultRandom(),  
    modelId: uuid("modelId").references(()=>modelDetails.id).notNull(),
    query: varchar("query"),
    userId: uuid("userId").references(()=>UserTable.id).notNull(),
    genImgId:uuid("imageId").references(()=>generatedImages.id).notNull()
})
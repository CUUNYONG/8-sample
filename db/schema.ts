// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const slots = sqliteTable('slots', {id:text('id').primaryKey(),startAt:integer('start_at').notNull(),endAt:integer('end_at').notNull(),active:integer('active').notNull().default(1)});
export const reservations=sqliteTable('reservations',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),slotId:text('slot_id').notNull().references(()=>slots.id),
 name:text('name').notNull(),phone:text('phone').notNull(),status:text('status').notNull().default('pending'),
 createdAt:integer('created_at').notNull(),approvedAt:integer('approved_at'),expiresAt:integer('expires_at'),paidAt:integer('paid_at'),
 amount:integer('amount').notNull().default(100000),refundRequestedAt:integer('refund_requested_at'),
});
export const paymentEvents=sqliteTable('payment_events',{id:text('id').primaryKey(),reservationId:text('reservation_id').notNull().references(()=>reservations.id),providerPaymentId:text('provider_payment_id').notNull(),createdAt:integer('created_at').notNull()},t=>[uniqueIndex('unique_payment').on(t.providerPaymentId)]);

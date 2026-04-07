import { pgTable, pgSchema, uuid, varchar, bigint, timestamp, foreignKey, boolean, jsonb, point } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const specification = pgSchema("specification");

export const transaction_seqInSpecification = specification.sequence("transaction_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })

export const cashbox_partnerInSpecification = specification.table("cashbox_partner", {
	cashbox_partner_id: uuid().defaultRandom().primaryKey().notNull(),
	partner_name: varchar(),
	partner_status: varchar().default('Active').notNull(),
	logo: varchar(),
	url: varchar(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
});

export const cashbox_userInSpecification = specification.table("cashbox_user", {
	cashbox_user_id: uuid().defaultRandom().primaryKey().notNull(),
	user_name: varchar().notNull(),
	authentication_type: varchar().default('email').notNull(),
	user_status: varchar().default('Active').notNull(),
	user_email: varchar(),
	user_phone: varchar(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
});

export const cashbox_role_operationInSpecification = specification.table("cashbox_role_operation", {
	cashbox_role_operation_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_role_id: uuid().notNull(),
	cashbox_operation_id: uuid().notNull(),
	is_active: boolean().default(true),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_operation_id],
			foreignColumns: [cashbox_operationInSpecification.cashbox_operation_id],
			name: "fk_cashbox_operation_to_cashbox_role_operation"
		}),
	foreignKey({
			columns: [table.cashbox_role_id],
			foreignColumns: [cashbox_roleInSpecification.cashbox_role_id],
			name: "fk_cashbox_role_to_cashbox_role_operation"
		}),
]);

export const cashbox_operationInSpecification = specification.table("cashbox_operation", {
	cashbox_operation_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_partner_id: uuid().notNull(),
	operation_name: varchar().notNull(),
	is_active: boolean().default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_partner_id],
			foreignColumns: [cashbox_partnerInSpecification.cashbox_partner_id],
			name: "fk_cashbox_partner_to_cashbox_operation"
		}),
]);

export const cashbox_partner_payment_methodInSpecification = specification.table("cashbox_partner_payment_method", {
	cashbox_partner_payment_method_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_partner_id: uuid().notNull(),
	cashbox_payment_method_id: uuid().notNull(),
	is_active: boolean().default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_partner_id],
			foreignColumns: [cashbox_partnerInSpecification.cashbox_partner_id],
			name: "fk_cashbox_partner_to_cashbox_partner_payment_method"
		}),
	foreignKey({
			columns: [table.cashbox_payment_method_id],
			foreignColumns: [cashbox_payment_methodInSpecification.cashbox_payment_method_id],
			name: "fk_cashbox_payment_method_to_cashbox_partner_payment_method"
		}),
]);

export const cashbox_payment_methodInSpecification = specification.table("cashbox_payment_method", {
	cashbox_payment_method_id: uuid().defaultRandom().primaryKey().notNull(),
	payment_method_name: varchar().notNull(),
	is_active: boolean().default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
});

export const cashbox_roleInSpecification = specification.table("cashbox_role", {
	cashbox_role_id: uuid().defaultRandom().primaryKey().notNull(),
	role_name: varchar(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
});

export const cashbox_payment_gatewayInSpecification = specification.table("cashbox_payment_gateway", {
	cashbox_payment_gateway_id: uuid().defaultRandom().primaryKey().notNull(),
	payment_gateway_name: varchar().notNull(),
	payment_gateway_description: varchar(),
	gateway_configuration: jsonb(),
	payment_gateway_type: varchar().default('REST').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
});

export const cashbox_payment_method_providerInSpecification = specification.table("cashbox_payment_method_provider", {
	cashbox_payment_method_provider_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_payment_method_id: uuid().notNull(),
	cashbox_payment_gateway_id: uuid().notNull(),
	provider_name: varchar().notNull(),
	provider_description: varchar(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_payment_gateway_id],
			foreignColumns: [cashbox_payment_gatewayInSpecification.cashbox_payment_gateway_id],
			name: "fk_cashbox_payment_gateway_to_cashbox_payment_method_provider"
		}),
	foreignKey({
			columns: [table.cashbox_payment_method_id],
			foreignColumns: [cashbox_payment_methodInSpecification.cashbox_payment_method_id],
			name: "fk_cashbox_payment_method_to_cashbox_payment_method_provider"
		}),
]);

export const cashbox_role_partnerInSpecification = specification.table("cashbox_role_partner", {
	cashbox_role_partner_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_role_id: uuid().notNull(),
	cashbox_partner_id: uuid().notNull(),
	is_active: boolean().default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_partner_id],
			foreignColumns: [cashbox_partnerInSpecification.cashbox_partner_id],
			name: "fk_cashbox_partner_to_cashbox_role_partner"
		}),
	foreignKey({
			columns: [table.cashbox_role_id],
			foreignColumns: [cashbox_roleInSpecification.cashbox_role_id],
			name: "fk_cashbox_role_to_cashbox_role_partner"
		}),
]);

export const cashbox_terminalInSpecification = specification.table("cashbox_terminal", {
	cashbox_terminal_id: uuid().defaultRandom().primaryKey().notNull(),
	terminal_name: varchar(),
	ip_address: varchar(),
	geo_point: point(),
	geo_url: varchar(),
	is_active: boolean().default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
});

export const cashbox_role_payment_methodInSpecification = specification.table("cashbox_role_payment_method", {
	cashbox_role_payment_method_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_role_id: uuid().notNull(),
	cashbox_payment_method_id: uuid().notNull(),
	is_active: boolean().default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_payment_method_id],
			foreignColumns: [cashbox_payment_methodInSpecification.cashbox_payment_method_id],
			name: "fk_cashbox_payment_method_to_cashbox_role_payment_method"
		}),
	foreignKey({
			columns: [table.cashbox_role_id],
			foreignColumns: [cashbox_roleInSpecification.cashbox_role_id],
			name: "fk_cashbox_role_to_cashbox_role_payment_method"
		}),
]);

export const cashbox_terminal_operationInSpecification = specification.table("cashbox_terminal_operation", {
	cashbox_terminal_operation_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_terminal_id: uuid().notNull(),
	cashbox_operation_id: uuid().notNull(),
	is_active: boolean().default(true),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_operation_id],
			foreignColumns: [cashbox_operationInSpecification.cashbox_operation_id],
			name: "fk_cashbox_operation_to_cashbox_terminal_operation"
		}),
	foreignKey({
			columns: [table.cashbox_terminal_id],
			foreignColumns: [cashbox_terminalInSpecification.cashbox_terminal_id],
			name: "fk_cashbox_terminal_to_cashbox_terminal_operation"
		}),
]);

export const cashbox_terminal_partnerInSpecification = specification.table("cashbox_terminal_partner", {
	cashbox_terminal_partner_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_terminal_id: uuid().notNull(),
	cashbox_partner_id: uuid().notNull(),
	is_active: boolean().default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_partner_id],
			foreignColumns: [cashbox_partnerInSpecification.cashbox_partner_id],
			name: "fk_cashbox_partner_to_cashbox_terminal_partner"
		}),
	foreignKey({
			columns: [table.cashbox_terminal_id],
			foreignColumns: [cashbox_terminalInSpecification.cashbox_terminal_id],
			name: "fk_cashbox_terminal_to_cashbox_terminal_partner"
		}),
]);

export const cashbox_terminal_payment_methodInSpecification = specification.table("cashbox_terminal_payment_method", {
	cashbox_terminal_payment_method_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_terminal_id: uuid().notNull(),
	cashbox_payment_method_id: uuid().notNull(),
	is_active: boolean().default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_payment_method_id],
			foreignColumns: [cashbox_payment_methodInSpecification.cashbox_payment_method_id],
			name: "fk_cashbox_payment_method_to_cashbox_terminal_payment_method"
		}),
	foreignKey({
			columns: [table.cashbox_terminal_id],
			foreignColumns: [cashbox_terminalInSpecification.cashbox_terminal_id],
			name: "fk_cashbox_terminal_to_cashbox_terminal_payment_method"
		}),
]);

export const cashbox_user_roleInSpecification = specification.table("cashbox_user_role", {
	cashbox_user_role_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_user_id: uuid().notNull(),
	cashbox_role_id: uuid().notNull(),
	is_default: boolean().default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_role_id],
			foreignColumns: [cashbox_roleInSpecification.cashbox_role_id],
			name: "fk_cashbox_role_to_cashbox_user_role"
		}),
	foreignKey({
			columns: [table.cashbox_user_id],
			foreignColumns: [cashbox_userInSpecification.cashbox_user_id],
			name: "fk_cashbox_user_to_cashbox_user_role"
		}),
]);

export const cashbox_user_terminalInSpecification = specification.table("cashbox_user_terminal", {
	cashbox_user_terminal_id: uuid().defaultRandom().primaryKey().notNull(),
	cashbox_user_id: uuid().notNull(),
	cashbox_terminal_id: uuid().notNull(),
	is_active: boolean().default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	tran_id: bigint({ mode: "number" }).default(sql`nextval('specification.transaction_seq'::regclass)`),
	tran_date: timestamp({ withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	tran_period: varchar({ length: 10 }).default(sql`to_char(CURRENT_TIMESTAMP, 'yyyymm'::text)`),
	user_id: varchar().default(sql`CURRENT_USER`),
}, (table) => [
	foreignKey({
			columns: [table.cashbox_terminal_id],
			foreignColumns: [cashbox_terminalInSpecification.cashbox_terminal_id],
			name: "fk_cashbox_terminal_to_cashbox_user_terminal"
		}),
	foreignKey({
			columns: [table.cashbox_user_id],
			foreignColumns: [cashbox_userInSpecification.cashbox_user_id],
			name: "fk_cashbox_user_to_cashbox_user_terminal"
		}),
]);

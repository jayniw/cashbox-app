import { relations } from "drizzle-orm/relations";
import { cashbox_operationInSpecification, cashbox_role_operationInSpecification, cashbox_roleInSpecification, cashbox_partnerInSpecification, cashbox_partner_payment_methodInSpecification, cashbox_payment_methodInSpecification, cashbox_payment_gatewayInSpecification, cashbox_payment_method_providerInSpecification, cashbox_role_partnerInSpecification, cashbox_role_payment_methodInSpecification, cashbox_terminal_operationInSpecification, cashbox_terminalInSpecification, cashbox_terminal_partnerInSpecification, cashbox_terminal_payment_methodInSpecification, cashbox_user_roleInSpecification, cashbox_userInSpecification, cashbox_user_terminalInSpecification } from "./schema";

export const cashbox_role_operationInSpecificationRelations = relations(cashbox_role_operationInSpecification, ({one}) => ({
	cashbox_operationInSpecification: one(cashbox_operationInSpecification, {
		fields: [cashbox_role_operationInSpecification.cashbox_operation_id],
		references: [cashbox_operationInSpecification.cashbox_operation_id]
	}),
	cashbox_roleInSpecification: one(cashbox_roleInSpecification, {
		fields: [cashbox_role_operationInSpecification.cashbox_role_id],
		references: [cashbox_roleInSpecification.cashbox_role_id]
	}),
}));

export const cashbox_operationInSpecificationRelations = relations(cashbox_operationInSpecification, ({one, many}) => ({
	cashbox_role_operationInSpecifications: many(cashbox_role_operationInSpecification),
	cashbox_partnerInSpecification: one(cashbox_partnerInSpecification, {
		fields: [cashbox_operationInSpecification.cashbox_partner_id],
		references: [cashbox_partnerInSpecification.cashbox_partner_id]
	}),
	cashbox_terminal_operationInSpecifications: many(cashbox_terminal_operationInSpecification),
}));

export const cashbox_roleInSpecificationRelations = relations(cashbox_roleInSpecification, ({many}) => ({
	cashbox_role_operationInSpecifications: many(cashbox_role_operationInSpecification),
	cashbox_role_partnerInSpecifications: many(cashbox_role_partnerInSpecification),
	cashbox_role_payment_methodInSpecifications: many(cashbox_role_payment_methodInSpecification),
	cashbox_user_roleInSpecifications: many(cashbox_user_roleInSpecification),
}));

export const cashbox_partnerInSpecificationRelations = relations(cashbox_partnerInSpecification, ({many}) => ({
	cashbox_operationInSpecifications: many(cashbox_operationInSpecification),
	cashbox_partner_payment_methodInSpecifications: many(cashbox_partner_payment_methodInSpecification),
	cashbox_role_partnerInSpecifications: many(cashbox_role_partnerInSpecification),
	cashbox_terminal_partnerInSpecifications: many(cashbox_terminal_partnerInSpecification),
}));

export const cashbox_partner_payment_methodInSpecificationRelations = relations(cashbox_partner_payment_methodInSpecification, ({one}) => ({
	cashbox_partnerInSpecification: one(cashbox_partnerInSpecification, {
		fields: [cashbox_partner_payment_methodInSpecification.cashbox_partner_id],
		references: [cashbox_partnerInSpecification.cashbox_partner_id]
	}),
	cashbox_payment_methodInSpecification: one(cashbox_payment_methodInSpecification, {
		fields: [cashbox_partner_payment_methodInSpecification.cashbox_payment_method_id],
		references: [cashbox_payment_methodInSpecification.cashbox_payment_method_id]
	}),
}));

export const cashbox_payment_methodInSpecificationRelations = relations(cashbox_payment_methodInSpecification, ({many}) => ({
	cashbox_partner_payment_methodInSpecifications: many(cashbox_partner_payment_methodInSpecification),
	cashbox_payment_method_providerInSpecifications: many(cashbox_payment_method_providerInSpecification),
	cashbox_role_payment_methodInSpecifications: many(cashbox_role_payment_methodInSpecification),
	cashbox_terminal_payment_methodInSpecifications: many(cashbox_terminal_payment_methodInSpecification),
}));

export const cashbox_payment_method_providerInSpecificationRelations = relations(cashbox_payment_method_providerInSpecification, ({one}) => ({
	cashbox_payment_gatewayInSpecification: one(cashbox_payment_gatewayInSpecification, {
		fields: [cashbox_payment_method_providerInSpecification.cashbox_payment_gateway_id],
		references: [cashbox_payment_gatewayInSpecification.cashbox_payment_gateway_id]
	}),
	cashbox_payment_methodInSpecification: one(cashbox_payment_methodInSpecification, {
		fields: [cashbox_payment_method_providerInSpecification.cashbox_payment_method_id],
		references: [cashbox_payment_methodInSpecification.cashbox_payment_method_id]
	}),
}));

export const cashbox_payment_gatewayInSpecificationRelations = relations(cashbox_payment_gatewayInSpecification, ({many}) => ({
	cashbox_payment_method_providerInSpecifications: many(cashbox_payment_method_providerInSpecification),
}));

export const cashbox_role_partnerInSpecificationRelations = relations(cashbox_role_partnerInSpecification, ({one}) => ({
	cashbox_partnerInSpecification: one(cashbox_partnerInSpecification, {
		fields: [cashbox_role_partnerInSpecification.cashbox_partner_id],
		references: [cashbox_partnerInSpecification.cashbox_partner_id]
	}),
	cashbox_roleInSpecification: one(cashbox_roleInSpecification, {
		fields: [cashbox_role_partnerInSpecification.cashbox_role_id],
		references: [cashbox_roleInSpecification.cashbox_role_id]
	}),
}));

export const cashbox_role_payment_methodInSpecificationRelations = relations(cashbox_role_payment_methodInSpecification, ({one}) => ({
	cashbox_payment_methodInSpecification: one(cashbox_payment_methodInSpecification, {
		fields: [cashbox_role_payment_methodInSpecification.cashbox_payment_method_id],
		references: [cashbox_payment_methodInSpecification.cashbox_payment_method_id]
	}),
	cashbox_roleInSpecification: one(cashbox_roleInSpecification, {
		fields: [cashbox_role_payment_methodInSpecification.cashbox_role_id],
		references: [cashbox_roleInSpecification.cashbox_role_id]
	}),
}));

export const cashbox_terminal_operationInSpecificationRelations = relations(cashbox_terminal_operationInSpecification, ({one}) => ({
	cashbox_operationInSpecification: one(cashbox_operationInSpecification, {
		fields: [cashbox_terminal_operationInSpecification.cashbox_operation_id],
		references: [cashbox_operationInSpecification.cashbox_operation_id]
	}),
	cashbox_terminalInSpecification: one(cashbox_terminalInSpecification, {
		fields: [cashbox_terminal_operationInSpecification.cashbox_terminal_id],
		references: [cashbox_terminalInSpecification.cashbox_terminal_id]
	}),
}));

export const cashbox_terminalInSpecificationRelations = relations(cashbox_terminalInSpecification, ({many}) => ({
	cashbox_terminal_operationInSpecifications: many(cashbox_terminal_operationInSpecification),
	cashbox_terminal_partnerInSpecifications: many(cashbox_terminal_partnerInSpecification),
	cashbox_terminal_payment_methodInSpecifications: many(cashbox_terminal_payment_methodInSpecification),
	cashbox_user_terminalInSpecifications: many(cashbox_user_terminalInSpecification),
}));

export const cashbox_terminal_partnerInSpecificationRelations = relations(cashbox_terminal_partnerInSpecification, ({one}) => ({
	cashbox_partnerInSpecification: one(cashbox_partnerInSpecification, {
		fields: [cashbox_terminal_partnerInSpecification.cashbox_partner_id],
		references: [cashbox_partnerInSpecification.cashbox_partner_id]
	}),
	cashbox_terminalInSpecification: one(cashbox_terminalInSpecification, {
		fields: [cashbox_terminal_partnerInSpecification.cashbox_terminal_id],
		references: [cashbox_terminalInSpecification.cashbox_terminal_id]
	}),
}));

export const cashbox_terminal_payment_methodInSpecificationRelations = relations(cashbox_terminal_payment_methodInSpecification, ({one}) => ({
	cashbox_payment_methodInSpecification: one(cashbox_payment_methodInSpecification, {
		fields: [cashbox_terminal_payment_methodInSpecification.cashbox_payment_method_id],
		references: [cashbox_payment_methodInSpecification.cashbox_payment_method_id]
	}),
	cashbox_terminalInSpecification: one(cashbox_terminalInSpecification, {
		fields: [cashbox_terminal_payment_methodInSpecification.cashbox_terminal_id],
		references: [cashbox_terminalInSpecification.cashbox_terminal_id]
	}),
}));

export const cashbox_user_roleInSpecificationRelations = relations(cashbox_user_roleInSpecification, ({one}) => ({
	cashbox_roleInSpecification: one(cashbox_roleInSpecification, {
		fields: [cashbox_user_roleInSpecification.cashbox_role_id],
		references: [cashbox_roleInSpecification.cashbox_role_id]
	}),
	cashbox_userInSpecification: one(cashbox_userInSpecification, {
		fields: [cashbox_user_roleInSpecification.cashbox_user_id],
		references: [cashbox_userInSpecification.cashbox_user_id]
	}),
}));

export const cashbox_userInSpecificationRelations = relations(cashbox_userInSpecification, ({many}) => ({
	cashbox_user_roleInSpecifications: many(cashbox_user_roleInSpecification),
	cashbox_user_terminalInSpecifications: many(cashbox_user_terminalInSpecification),
}));

export const cashbox_user_terminalInSpecificationRelations = relations(cashbox_user_terminalInSpecification, ({one}) => ({
	cashbox_terminalInSpecification: one(cashbox_terminalInSpecification, {
		fields: [cashbox_user_terminalInSpecification.cashbox_terminal_id],
		references: [cashbox_terminalInSpecification.cashbox_terminal_id]
	}),
	cashbox_userInSpecification: one(cashbox_userInSpecification, {
		fields: [cashbox_user_terminalInSpecification.cashbox_user_id],
		references: [cashbox_userInSpecification.cashbox_user_id]
	}),
}));
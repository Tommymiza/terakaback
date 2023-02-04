"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = __importDefault(global[Symbol.for('ioc.use')]("Adonis/Lucid/Schema"));
class default_1 extends Schema_1.default {
    constructor() {
        super(...arguments);
        this.tableName = "membres";
    }
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments("id");
            table.string("nom", 255).notNullable();
            table.string("prenom", 255).notNullable();
            table.date("date_naissance").notNullable();
            table.enum("genre", ["M", "F"]).notNullable();
            table.string("metier", 255).notNullable();
            table.json("adresse").notNullable();
            table.string("phone", 255).notNullable();
            table.string("email", 255).nullable().unique();
            table.string("password", 255).nullable();
            table.json("qst").notNullable();
            table.boolean("is_verified").defaultTo(false);
            table.bigInteger("num_cin").nullable();
            table.string("photo_cin", 255).nullable();
            table.string("photo", 255).nullable();
            table.integer("id_pg", 10).nullable();
            table.json("staff").nullable();
            table.timestamp("created_at", { useTz: true });
            table.timestamp("updated_at", { useTz: true });
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
exports.default = default_1;
//# sourceMappingURL=1674972331913_membres.js.map
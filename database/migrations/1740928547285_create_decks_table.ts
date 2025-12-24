import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 't_deck'; // Nom de la table

  async up() {
    // Création de la table si elle n'existe pas
    this.schema.createTableIfNotExists(this.tableName, (table) => {
      table.increments('id'); // Colonne ID auto-incrémentée
      table.string('title').notNullable(); // Colonne pour le titre
      table.text('description'); // Colonne pour la description
      table.integer('user_id').unsigned().notNullable(); // Colonne pour l'ID utilisateur
      table.foreign('user_id').references('id').inTable('t_user').onDelete('CASCADE'); // Clé étrangère vers la table utilisateur
      table.string('visibility').notNullable().defaultTo('private'); // Colonne pour la visibilidade
      table.json('allowed_users_ids').nullable(); // IDs autorizados para decks restritos
      table.timestamps(true); // Colonnes pour les dates de création et de mise à jour
    });
  }

  async down() {
    // Suppression de la table
    this.schema.dropTable(this.tableName);
  }
}

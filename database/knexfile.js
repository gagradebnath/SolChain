/**
 * Database Configuration
 * 
 * Knex.js configuration for SQLite database
 * 
 * @author Team GreyDevs
 */

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/data/solchain_dev.db'
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    useNullAsDefault: true,
    debug: true
  },
  
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    useNullAsDefault: true
  },
  
  production: {
    client: 'sqlite3',
    connection: {
      filename: './database/data/solchain_prod.db'
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    },
    useNullAsDefault: true
  }
};

import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('uid', 255).nullable()
      table.bigInteger('store_id').nullable()
      table.bigInteger('user_id').nullable()
      table.float('initial_price').defaultTo(0)
      table.float('delivery_fee').defaultTo(0)
      table.float('total_price').defaultTo(0)
      table.text('shipping_address', 'longtext').nullable()
      table.text('billing_address', 'longtext').nullable()
      table.enum('status', ['Pending', 'Processing', 'Shipped', 'Completed', 'Returned', 'Cancelled']).nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.timestamp('deleted_at', { useTz: true }).nullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}

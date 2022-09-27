import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Models/Role'

export default class extends BaseSeeder {
  public async run () {
    await Role.updateOrCreateMany('name', [
      {name: 'Developer', status: 'Active'},
      {name: 'Super Admin', status: 'Active'},
      {name: 'Admin', status: 'Active'},
      {name: 'Manager', status: 'Active'},
      {name: 'General', status: 'Active'},
      {name: 'Vendor', status: 'Active'},
      {name: 'Customer', status: 'Active'},
    ])
  }
}

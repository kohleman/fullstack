import { Migration } from '@mikro-orm/migrations';

export class Migration20210528141604 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop table if exists "test" cascade;');
  }

}

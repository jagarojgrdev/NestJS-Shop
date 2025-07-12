import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return 'Seed Executed';
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();

    //Para elimianr usuarios, se podría hacer de igual manera que products
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  //Esta forma es otra, se puede hacer de la misma que la de productso
  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(seedUsers);

    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    // Elimina los productos, importando la función de productsModule
    await this.productsService.deleteAllProducts();
    //Obtenemos los productso de data/data-seed
    const products = initialData.products;
    //Recorre los productos y los guarda en un array
    const insertPromises = products.map((product) =>
      this.productsService.create(product, user),
    );
    // Espera a que el array de insertPromises se resuelva
    await Promise.all(insertPromises);
    return true;
  }
}

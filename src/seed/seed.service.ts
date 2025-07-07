import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService) {}

  async runSeed() {
    await this.insertNewProducts();
    return 'Seed Executed';
  }

  private async insertNewProducts() {
    // Elimina los productos, importando la función de productsModule
    await this.productsService.deleteAllProducts();

    //Obtenemos los productso de data/data-seed
    const products = initialData.products;

    //Recorre los productos y los guarda en un array
    const insertPromises = products.map((product) =>
      this.productsService.create(product),
    );

    // Espera a que el array de insertPromises se resuelva
    await Promise.all(insertPromises);

    return true;
  }
}

import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers';
import { FilesService } from './files.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  // Instalamos multer npm i -D @types/multer
  @Post('upload')
  @UseInterceptors(
    // Indicamos el parametro por el que recibimos la data
    FileInterceptor('file', {
      //Sube el archivo a una carpeta temporal del servidor
      //NO SE REMIENDA SUBIR EN LOCAL, SE DEBE DE SUBIR A UN SERVIDOR APARTE BUCKET O SIMIALR
      storage: diskStorage({
        destination: './static/products',
        //Modificamos nombre del fichero
        filename: fileNamer,
      }),
      //Validamos antes de subir archivo
      fileFilter: fileFilter,
    }),
  )
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      //Devolvemos que no existe
      throw new BadRequestException(
        'Make sure file is .jpg .jpeg .png or .gif',
      );
    }

    // const secureUrl = `${file.filename}`;
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return {
      secureUrl,
    };
  }

  @Get('product/:imageName')
  findProductImage(
    //Añadimos decorador para cortar respuesta y especificar nosotros mismos
    @Res() res: Response,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProductImage(imageName);

    //Enviamos como respuesta el fichero de la ruta path
    res.sendFile(path);

    return path;
  }
}

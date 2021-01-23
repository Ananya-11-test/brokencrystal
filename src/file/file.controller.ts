import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { W_OK } from 'constants';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as rawbody from 'raw-body';
import { Stream } from 'stream';
import { FileService } from './file.service';

@Controller('/api/file')
@ApiTags('files controller')
export class FileController {
  private static readonly CONTENT_TYPE_HEADER = 'Content-Type';
  private log: Logger = new Logger(FileController.name);

  constructor(private fileService: FileService) {}

  @ApiOperation({
    description:
      'Reads the file from the provided path and the supplied content type and returns the file',
  })
  @Get()
  async loadFile(
    @Query('path') path: string,
    @Query('type') contentType: string,
    @Res({ passthrough: true }) res: Response,
    @Headers('Accept') acceptHeader: string,
  ): Promise<void> {
    let type: string = null;

    try {
      if (contentType) {
        type = contentType;
      } else if (acceptHeader) {
        type = acceptHeader;
      } else {
        type = 'application/octet-stream';
      }

      res.header(FileController.CONTENT_TYPE_HEADER, type);
      const file: Stream = await this.fileService.getFile(path);
      file.pipe(res);
    } catch (err) {
      throw new HttpException(
        {
          error: err.message,
          location: __filename,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    description: 'deletes file at the given path',
  })
  @Delete()
  async deleteFile(@Query('path') path: string): Promise<void> {
    try {
      await this.fileService.deleteFile(path);
    } catch (err) {
      throw new HttpException(
        {
          error: err.message,
          location: __filename,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiOperation({
    description: 'save raw content on server as a file',
  })
  @Put('raw')
  async uploadFile(
    @Body() data,
    @Query('path') file,
    @Req() req,
  ): Promise<void> {
    if (req.readable) {
      const raw = await rawbody(req);
      try {
        await fs.promises.access(path.dirname(file), W_OK);
        await fs.promises.writeFile(file, raw);
      } catch (err) {
        this.log.error(err.message);
      }
    }
  }

  @ApiOperation({
    description: 'read file content content on server as a file',
  })
  @Get('raw')
  @Header(FileController.CONTENT_TYPE_HEADER, 'application/octet-stream')
  async readFile(
    @Query('path') file,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    try {
      const stream = await this.fileService.getFile(file);
      stream.pipe(res);
    } catch (err) {
      this.log.error(err.message);
      res.status(HttpStatus.NOT_FOUND);
    }
  }
}

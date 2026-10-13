import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from '../src/config/app.config';
import { PrismaService } from '../src/prisma/prisma.service';
import { TeamService } from '../src/modules/team/team.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const teamService = {
    create: jest.fn().mockResolvedValue({ teamId: 1, name: 'Equipo' }),
    findAll: jest.fn().mockResolvedValue({ items: [], meta: {} }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(TeamService)
      .useValue(teamService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useLogger(false);
    configureApp(app);
    jest.clearAllMocks();
    await app.init();
  });

  it('rejects invalid DTOs with the global error contract', async () => {
    const response = await request(app.getHttpServer())
      .post('/team')
      .send({ name: 123 })
      .expect(400);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        code: 400,
        data: null,
        path: '/team',
        message: expect.any(Array) as unknown,
        timestamp: expect.any(String) as unknown,
      }),
    );
    expect(teamService.create).not.toHaveBeenCalled();
  });

  it('removes undeclared properties before calling the service', async () => {
    await request(app.getHttpServer())
      .post('/team')
      .send({ name: 'Equipo', extra: 'discard' })
      .expect(201);
    expect(teamService.create).toHaveBeenCalledWith({ name: 'Equipo' });
  });

  it('transforms pagination and boolean filters', async () => {
    await request(app.getHttpServer())
      .get('/team?page=2&limit=5&status=false')
      .expect(200);
    expect(teamService.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 5, status: false }),
    );
  });

  it('documents envelopes, pagination, DTO properties and error responses', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    const schemas = document.components?.schemas;
    expect(schemas?.TeamResponseDto).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          teamId: expect.any(Object) as unknown,
          name: expect.any(Object) as unknown,
        }) as unknown,
      }),
    );
    const create = document.paths['/team'].post!;
    expect(create.responses['201']).toEqual(
      expect.objectContaining({
        content: expect.objectContaining({
          'application/json': expect.objectContaining({
            schema: expect.objectContaining({
              allOf: expect.arrayContaining([
                expect.objectContaining({
                  properties: expect.objectContaining({
                    data: { $ref: '#/components/schemas/TeamResponseDto' },
                  }) as unknown,
                }),
              ]) as unknown,
            }) as unknown,
          }) as unknown,
        }) as unknown,
      }),
    );
    expect(create.responses['409']).toBeDefined();
    expect(
      JSON.stringify(document.paths['/team'].get?.responses['200']),
    ).toContain('PaginationMetaDto');
    expect(schemas?.UpdateTeamDto).toEqual(
      expect.objectContaining({
        properties: expect.objectContaining({
          name: expect.any(Object) as unknown,
        }) as unknown,
      }),
    );
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        code: 200,
        message: 'Operación exitosa',
        data: 'Api NestJS!',
        path: '/',
      }),
    );
  });

  afterEach(async () => {
    await app.close();
  });
});

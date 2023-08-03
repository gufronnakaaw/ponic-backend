import {
  describe,
  it,
  afterAll,
  beforeAll,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import logger from '../utils/logger';
import server from '../http/server';
import { createUsers, removeUsers } from './utils/user.util';
import {
  createRooms,
  deleteCandidates,
  deleteRooms,
  getRooms,
} from './utils/room.util';

async function doLogin(): Promise<string> {
  const fastifyServer = server();

  const response = await fastifyServer.inject({
    method: 'POST',
    url: '/api/v1/users/login',
    payload: {
      email: 'testing@mail.com',
      password: 'testing123',
    },
  });

  return response.json().data.token;
}

describe('POST /api/v1/rooms', () => {
  beforeAll(async () => {
    await createUsers();
  });

  afterAll(async () => {
    await deleteCandidates();
    await deleteRooms();
    await removeUsers();
  });

  const payload = {
    name: 'Create Room Test',
    start: 1690776168631,
    end: 1690776168631,
    candidates: [
      {
        name: 'Candidate Test 1',
      },
      {
        name: 'Candidate Test 2',
      },
    ],
  };

  it('should can create room', async () => {
    const fastifyServer = server();

    const token = await doLogin();

    const response = await fastifyServer.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload,
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toHaveProperty('success');
    expect(response.json()).toHaveProperty('data');

    expect(response.json().success).toBeTruthy();
    expect(response.json().data).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: payload.name,
        start: payload.start,
        end: payload.end,
        code: expect.any(String),
        candidates: payload.candidates,
      })
    );
  });

  it('should unauthorized', async () => {
    const fastifyServer = server();

    const response = await fastifyServer.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      payload,
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toHaveProperty('success');
    expect(response.json()).toHaveProperty('errors');

    expect(response.json().success).toBeFalsy();
    expect(response.json().errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
        }),
      ])
    );
  });

  it('should cannot create rooms if request is invalid', async () => {
    const fastifyServer = server();

    const token = await doLogin();

    const response = await fastifyServer.inject({
      method: 'POST',
      url: '/api/v1/rooms',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        name: 123,
        start: 1690776168631,
        end: 1690776168631,
        candidates: [
          {
            name: 'Candidate Test 1',
          },
        ],
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toHaveProperty('success');
    expect(response.json()).toHaveProperty('errors');

    expect(response.json().success).toBeFalsy();
    expect(response.json().errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
        }),
      ])
    );
  });
});

describe('DELETE /api/v1/rooms', () => {
  beforeEach(async () => {
    await createUsers();
    await createRooms();
  });

  afterEach(async () => {
    await deleteCandidates();
    await deleteRooms();
    await removeUsers();
  });

  it('should can delete rooms', async () => {
    const fastifyServer = server();
    const room = await getRooms();

    const token = await doLogin();

    const response = await fastifyServer.inject({
      method: 'DELETE',
      url: '/api/v1/rooms',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        room_id: room?.id,
        code: room?.code,
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('success');
    expect(response.json()).toHaveProperty('data');

    expect(response.json().success).toBeTruthy();
    expect(response.json().data).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      })
    );
  });

  it('should cannot delete rooms if request is invalid', async () => {
    const fastifyServer = server();
    const room = await getRooms();

    const token = await doLogin();

    const response = await fastifyServer.inject({
      method: 'DELETE',
      url: '/api/v1/rooms',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        room_id: 'string',
        code: room?.code,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toHaveProperty('success');
    expect(response.json()).toHaveProperty('errors');

    expect(response.json().success).toBeFalsy();
    expect(response.json().errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
        }),
      ])
    );
  });

  it('should cannot delete rooms if room id not found', async () => {
    const fastifyServer = server();

    const room = await getRooms();

    const token = await doLogin();

    const response = await fastifyServer.inject({
      method: 'DELETE',
      url: '/api/v1/rooms',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        room_id: 1,
        code: room?.code,
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toHaveProperty('success');
    expect(response.json()).toHaveProperty('errors');

    expect(response.json().success).toBeFalsy();
    expect(response.json().errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
        }),
      ])
    );
  });

  it('should cannot delete rooms if code not found', async () => {
    const fastifyServer = server();

    const room = await getRooms();

    const token = await doLogin();

    const response = await fastifyServer.inject({
      method: 'DELETE',
      url: '/api/v1/rooms',
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        room_id: room?.id,
        code: 'WRONGGGG',
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toHaveProperty('success');
    expect(response.json()).toHaveProperty('errors');

    expect(response.json().success).toBeFalsy();
    expect(response.json().errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
        }),
      ])
    );
  });

  it('should unauthorized', async () => {
    const fastifyServer = server();
    const room = await getRooms();

    const response = await fastifyServer.inject({
      method: 'DELETE',
      url: '/api/v1/rooms',
      payload: {
        room_id: room?.id,
        code: room?.code,
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toHaveProperty('success');
    expect(response.json()).toHaveProperty('errors');

    expect(response.json().success).toBeFalsy();
    expect(response.json().errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.any(String),
        }),
      ])
    );
  });
});

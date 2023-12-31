import prisma from '../../utils/database';
import generate from '../../utils/generate';
import { getUsers } from './user.util';

export async function deleteRooms() {
  const user = await getUsers();

  await prisma.room.deleteMany({
    where: {
      user_id: user?.id,
    },
  });
}

export async function getRooms() {
  const user = await getUsers();

  return prisma.room.findFirst({
    where: {
      user_id: user?.id,
    },
    include: {
      candidate: true,
    },
  });
}

export async function deleteCandidates() {
  const room = await getRooms();

  if (room) {
    await prisma.candidate.deleteMany({
      where: {
        room_id: room?.id,
      },
    });
  }
}

export async function createRooms() {
  const user = await getUsers();

  await prisma.room.create({
    data: {
      name: 'Create Room Test',
      start: Date.now(),
      end: Date.now() + 7 * 24 * 60 * 60 * 1000,
      code: generate(8),
      user_id: user!.id,
      candidate: {
        createMany: {
          data: [
            {
              name: 'Candidate Test 1',
            },
            {
              name: 'Candidate Test 2',
            },
          ],
        },
      },
    },
  });
}

export async function createManyRooms() {
  const user = await getUsers();

  for (let i = 1; i <= 5; i++) {
    await prisma.room.create({
      data: {
        name: `Create Room Test ${i}`,
        start: Date.now(),
        end: Date.now() + 7 * 24 * 60 * 60 * 1000,
        code: generate(8),
        user_id: user!.id,
        candidate: {
          createMany: {
            data: [
              {
                name: 'Candidate Test 1',
              },
              {
                name: 'Candidate Test 2',
              },
            ],
          },
        },
      },
    });
  }
}

export async function deleteManyRooms() {
  for (let i = 1; i <= 5; i++) {
    const room = await getRooms();

    await deleteCandidates();

    await prisma.room.deleteMany({
      where: {
        id: room?.id,
      },
    });
  }
}

export async function deleteVotes() {
  const room = await getRooms();
  const user = await getUsers();

  await prisma.vote.deleteMany({
    where: {
      AND: [
        {
          room_id: room!.id,
        },
        {
          user_id: user?.id,
        },
      ],
    },
  });
}

import { z } from 'zod';

const createRoomsValidation = z.object({
  name: z.string().trim().nonempty(),
  start: z.number().positive(),
  end: z.number().positive(),
  candidates: z
    .array(
      z.object({
        name: z.string().trim().nonempty(),
      })
    )
    .min(2),
});

const deleteRoomsValidation = z.object({
  room_id: z.number().positive(),
  code: z.string().trim().min(8).nonempty(),
});

const getRoomsValidation = z.object({
  id: z.number().positive().optional(),
  code: z.string().trim().max(8).optional(),
});

const createVotesValidation = z.object({
  room_id: z.number().positive(),
  code: z.string().trim().min(8).nonempty(),
  candidate: z.object({
    id: z.number().positive(),
  }),
});

const updateRoomsValidation = z.object({
  room_id: z.number().positive(),
  name: z.string().trim().min(1).optional(),
  start: z.number().positive().optional(),
  end: z.number().positive().optional(),
  candidates: z
    .array(
      z.object({
        id: z.number().positive(),
        name: z.string().trim().nonempty(),
      })
    )
    .min(2)
    .optional(),
});

export {
  createRoomsValidation,
  deleteRoomsValidation,
  getRoomsValidation,
  createVotesValidation,
  updateRoomsValidation,
};

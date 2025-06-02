import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(1),
  age: z.coerce.number(),
  eyeColor: z.enum([
    "Green",
    "Red",
    "Hazel",
    "Amber",
    "Blue",
    "Brown",
    "Violet",
    "Gray",
  ]),
  birthDate: z.coerce.date(),
});

export type UserType = z.infer<typeof UserSchema>;

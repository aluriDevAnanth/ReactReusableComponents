import {
  Button,
  Fieldset,
  NumberInput,
  Select,
  TextInput,
} from "@mantine/core";
import { Controller } from "react-hook-form";
import { UserSchema, type UserType } from "../schemas";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePickerInput } from "@mantine/dates";

export default function FormTesting() {
  const formState = useForm<UserType>({
    resolver: zodResolver(UserSchema),
  });
  const onSubmit: SubmitHandler<UserType> = (data) => console.log(data);

  return (
    <div className="flex justify-center items-center p-10 w-full">
      <form onSubmit={formState.handleSubmit(onSubmit)} className="w-full">
        <Fieldset
          legend="User Registration"
          className="w-2/3 mx-auto grid grid-cols-2 gap-4"
        >
          <TextInput
            {...formState.register("name")}
            withAsterisk
            error={formState.formState.errors.name?.message}
            label="Your name"
            placeholder="Your name"
          />
          <Controller
            name="age"
            control={formState.control}
            render={({ field }) => (
              <NumberInput
                {...field}
                withAsterisk
                error={formState.formState.errors.age?.message}
                label="Age"
                placeholder="Your age"
              />
            )}
          />
          <Controller
            name="eyeColor"
            control={formState.control}
            render={({ field }) => (
              <Select
                {...field}
                label="Your favorite library"
                placeholder="Pick value"
                error={formState.formState.errors.eyeColor?.message}
                withAsterisk
                data={UserSchema.shape.eyeColor.options}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          <Controller
            name="birthDate"
            control={formState.control}
            render={({ field }) => (
              <DatePickerInput
                {...field}
                clearable
                withAsterisk
                error={formState.formState.errors.birthDate?.message}
                value={field.value || null}
                onChange={(date) => field.onChange(date)}
                label="Birth Date"
                placeholder="Select your birth date"
              />
            )}
          />
          <div>
            <Button type="submit">Submit</Button>
          </div>
        </Fieldset>
      </form>
    </div>
  );
}

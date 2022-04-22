import { IsEmail, Length } from "class-validator";

export class CreateCustomerInputs {
  @IsEmail()
  email: string;

  @Length(7, 12)
  phone: string;

  @Length(6, 12)
  password: string;
}
export class UserLoginInputs {
  @IsEmail()
  email: string;

  @Length(6, 12)
  password: string;
}

export class EditCustomerProfileInputs {
  @Length(1, 16)
  firstName: string;

  @Length(1, 16)
  lastName: string;

  @Length(6, 30)
  adress: string;
}


export interface CustomerPayload {
  _id: string;
  email: string;
  verified: boolean;
}


export class OrderInputs {
  _id: string;
  unit: number;
}


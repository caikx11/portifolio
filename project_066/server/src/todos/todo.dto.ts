import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const PRIORITIES = ['baixa', 'media', 'alta'] as const;
export type Priority = (typeof PRIORITIES)[number];

export class CreateTodoDto {
  @IsString() @MinLength(1) @MaxLength(120)
  title: string;

  @IsOptional() @IsIn(PRIORITIES)
  priority?: Priority;
}

export class UpdateTodoDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(120)
  title?: string;

  @IsOptional() @IsIn(PRIORITIES)
  priority?: Priority;

  @IsOptional() @IsBoolean()
  done?: boolean;
}

import { IsOptional, IsString, IsUUID } from "class-validator";

export class GetEventQueryDto {
  @IsOptional()
  @IsUUID()
  categoryId: string

  @IsOptional()
  @IsString()
  search: string
}
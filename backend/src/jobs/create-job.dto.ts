import { ArrayNotEmpty, IsArray, IsUrl } from 'class-validator';

export class CreateJobDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({ require_protocol: true }, { each: true })
  urls!: string[];
}

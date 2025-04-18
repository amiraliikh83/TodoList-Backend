import { IsString, IsNotEmpty, IsDate, IsEnum } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  projectName: string;

  @IsString()
  date: string;

  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @IsString()
  level: string;

  @IsEnum(['todo', 'done'])
  status: 'todo' | 'done';

  @IsString()
  user: string;
}

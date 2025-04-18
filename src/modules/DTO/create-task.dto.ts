import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  projectName: string;

  @IsString()
  date: string;

  @IsEnum(['Low', 'Medium', 'High'])
  priority: 'Low' | 'Medium' | 'High';

  @IsString()
  level: string;

  @IsEnum(['todo', 'done'])
  status: 'todo' | 'done';

  @IsString()
  user: string;
}

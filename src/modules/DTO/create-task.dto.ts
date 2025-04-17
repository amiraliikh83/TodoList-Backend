import { IsString, IsNotEmpty, IsDate, IsEnum, IsNumber } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  projectName: string;

  @IsDate()
  date: Date;

  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @IsNumber()
  level: number;

  @IsEnum(['todo', 'doing', 'done'])
  status: 'todo' | 'doing' | 'done';


  @IsString()
  user: string;
}

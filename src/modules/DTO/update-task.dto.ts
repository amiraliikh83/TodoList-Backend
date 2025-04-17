export class UpdateTaskDto {
  readonly title?: string;
  readonly projectName?: string;
  readonly date?: Date;
  readonly priority?: 'low' | 'medium' | 'high';
  readonly level?: number;
  readonly status?: 'todo' | 'doing' | 'done';
}
